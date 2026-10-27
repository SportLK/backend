import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
} from '../database/entities/tournament.entity';
import { TournamentBracket } from '../database/entities/tournament-bracket.entity';
import { Match, MatchStatus } from '../database/entities/match.entity';
import { MatchScore } from '../database/entities/match-score.entity';
import { Team } from '../database/entities/team.entity';
import { GenerateBracketsDto } from './dto/generate-brackets.dto';
import { AdvanceProgressionDto } from './dto/advance-progression.dto';

@Injectable()
export class BracketService {
  private readonly logger = new Logger(BracketService.name);

  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
    @InjectRepository(TournamentBracket)
    private readonly bracketRepository: Repository<TournamentBracket>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(MatchScore)
    private readonly scoreRepository: Repository<MatchScore>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  /**
   * Generate tournament brackets and initial round fixtures
   */
  async generateBrackets(
    tournamentId: string,
    dto: GenerateBracketsDto,
    confirmedTeamIds: string[],
  ): Promise<{ message: string; brackets: TournamentBracket[]; matches: Match[] }> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }

    if (confirmedTeamIds.length < 2) {
      throw new BadRequestException(
        `At least 2 confirmed teams are required to generate brackets. Current count: ${confirmedTeamIds.length}`,
      );
    }

    // Clear existing brackets & tournament matches if regenerating
    const existingBrackets = await this.bracketRepository.find({
      where: { tournamentId },
    });
    if (existingBrackets.length > 0) {
      await this.bracketRepository.delete({ tournamentId });
      await this.matchRepository.delete({ tournamentId });
    }

    // Determine ordered teams
    let orderedTeams = [...confirmedTeamIds];
    if (dto.seedingType === 'RANDOM') {
      orderedTeams = orderedTeams.sort(() => Math.random() - 0.5);
    } else if (dto.seedingType === 'MANUAL' && dto.seedTeamIds && dto.seedTeamIds.length > 0) {
      orderedTeams = dto.seedTeamIds.filter((id) => confirmedTeamIds.includes(id));
      for (const id of confirmedTeamIds) {
        if (!orderedTeams.includes(id)) {
          orderedTeams.push(id);
        }
      }
    }

    const defaultVenueId = dto.defaultVenueId || tournament.venueId || null;
    const baseStartTime = dto.initialMatchStartTime
      ? new Date(dto.initialMatchStartTime)
      : new Date(`${tournament.startDate}T09:00:00`);
    const intervalMinutes = dto.matchIntervalMinutes || 90;

    let generatedBrackets: TournamentBracket[] = [];
    let generatedMatches: Match[] = [];

    if (tournament.tournamentFormat === TournamentFormat.KNOCKOUT_SINGLE) {
      const result = await this.generateKnockoutSingle(
        tournament,
        orderedTeams,
        defaultVenueId,
        baseStartTime,
        intervalMinutes,
      );
      generatedBrackets = result.brackets;
      generatedMatches = result.matches;
    } else if (tournament.tournamentFormat === TournamentFormat.ROUND_ROBIN) {
      const result = await this.generateRoundRobin(
        tournament,
        orderedTeams,
        defaultVenueId,
        baseStartTime,
        intervalMinutes,
      );
      generatedBrackets = result.brackets;
      generatedMatches = result.matches;
    } else {
      // GROUP_AND_KNOCKOUT: Generate round robin group matches followed by knockout tree
      const result = await this.generateGroupAndKnockout(
        tournament,
        orderedTeams,
        defaultVenueId,
        baseStartTime,
        intervalMinutes,
      );
      generatedBrackets = result.brackets;
      generatedMatches = result.matches;
    }

    // Transition tournament status to ONGOING if currently DRAFT or OPEN_FOR_REGISTRATION
    if (
      tournament.tournamentStatus === TournamentStatus.DRAFT ||
      tournament.tournamentStatus === TournamentStatus.OPEN_FOR_REGISTRATION
    ) {
      tournament.tournamentStatus = TournamentStatus.ONGOING;
      await this.tournamentRepository.save(tournament);
    }

    return {
      message: `Successfully generated ${generatedBrackets.length} bracket nodes and ${generatedMatches.length} matches for tournament: ${tournament.tournamentName}`,
      brackets: generatedBrackets,
      matches: generatedMatches,
    };
  }

  /**
   * Helper: Generate Single-Elimination Knockout Bracket
   */
  private async generateKnockoutSingle(
    tournament: Tournament,
    teamIds: string[],
    defaultVenueId: string | null,
    baseStartTime: Date,
    intervalMinutes: number,
  ) {
    const numTeams = teamIds.length;
    // Calculate total rounds needed: 2^R >= numTeams
    const totalRounds = Math.ceil(Math.log2(numTeams));
    const bracketSize = Math.pow(2, totalRounds);

    // Step 1: Create all TournamentBracket entities for each round from Round 1 up to Final
    // roundMap will store { roundNumber: { sequenceNumber: bracketEntity } }
    const roundMap: Map<number, Map<number, TournamentBracket>> = new Map();

    for (let r = 1; r <= totalRounds; r++) {
      roundMap.set(r, new Map());
      const matchesInRound = Math.pow(2, totalRounds - r);

      for (let s = 1; s <= matchesInRound; s++) {
        const bracket = this.bracketRepository.create({
          tournamentId: tournament.id,
          roundNumber: r,
          matchSequenceInRound: s,
          matchId: null,
          nextBracketId: null,
        });
        const savedBracket = await this.bracketRepository.save(bracket);
        roundMap.get(r)!.set(s, savedBracket);
      }
    }

    // Step 2: Connect child brackets to parent brackets (nextBracketId)
    for (let r = 1; r < totalRounds; r++) {
      const currentRound = roundMap.get(r)!;
      const nextRound = roundMap.get(r + 1)!;

      for (const [seq, bracket] of currentRound.entries()) {
        const parentSeq = Math.ceil(seq / 2);
        const parentBracket = nextRound.get(parentSeq);
        if (parentBracket) {
          bracket.nextBracketId = parentBracket.id;
          await this.bracketRepository.save(bracket);
        }
      }
    }

    // Step 3: Populate Round 1 matches with paired teams
    const round1Brackets = roundMap.get(1)!;
    const matchesCreated: Match[] = [];
    let matchTimeCounter = 0;

    // Pad teams with byes if needed to fill bracket size
    const seededList: (string | null)[] = [...teamIds];
    while (seededList.length < bracketSize) {
      seededList.push(null);
    }

    for (let i = 0; i < bracketSize; i += 2) {
      const homeTeamId = seededList[i];
      const awayTeamId = seededList[i + 1];
      const sequenceInRound = Math.floor(i / 2) + 1;
      const bracketNode = round1Brackets.get(sequenceInRound);

      if (!bracketNode) continue;

      if (homeTeamId && awayTeamId) {
        // Both teams present -> schedule match
        const matchStartTime = new Date(
          baseStartTime.getTime() + matchTimeCounter * intervalMinutes * 60000,
        );
        matchTimeCounter++;

        const match = this.matchRepository.create({
          tournamentId: tournament.id,
          homeTeamId,
          awayTeamId,
          venueId: defaultVenueId,
          scheduledStartTime: matchStartTime,
          matchStatus: MatchStatus.SCHEDULED,
        });

        const savedMatch = await this.matchRepository.save(match);

        // Initialize scorecard
        const score = this.scoreRepository.create({
          matchId: savedMatch.id,
          homeTeamScoreDisplay: '0',
          awayTeamScoreDisplay: '0',
          detailedScorecardJson: {
            round: 1,
            matchSequence: sequenceInRound,
            status: 'SCHEDULED',
          },
        });
        await this.scoreRepository.save(score);

        bracketNode.matchId = savedMatch.id;
        await this.bracketRepository.save(bracketNode);
        matchesCreated.push(savedMatch);
      } else if (homeTeamId && !awayTeamId && bracketNode.nextBracketId) {
        // Bye: Home team gets a bye directly to next round!
        // We will assign this winner into the next round match when available
        this.logger.log(`Team ${homeTeamId} received a Round 1 bye`);
      }
    }

    const allBrackets = await this.bracketRepository.find({
      where: { tournamentId: tournament.id },
      relations: ['match', 'match.homeTeam', 'match.awayTeam', 'match.score'],
      order: { roundNumber: 'ASC', matchSequenceInRound: 'ASC' },
    });

    return { brackets: allBrackets, matches: matchesCreated };
  }

  /**
   * Helper: Generate Round-Robin League Fixtures
   */
  private async generateRoundRobin(
    tournament: Tournament,
    teamIds: string[],
    defaultVenueId: string | null,
    baseStartTime: Date,
    intervalMinutes: number,
  ) {
    const teams = [...teamIds];
    if (teams.length % 2 !== 0) {
      teams.push('BYE');
    }

    const n = teams.length;
    const roundsCount = n - 1;
    const matchesPerRound = n / 2;

    const bracketsCreated: TournamentBracket[] = [];
    const matchesCreated: Match[] = [];
    let matchTimeCounter = 0;

    for (let round = 1; round <= roundsCount; round++) {
      let matchSeq = 1;

      for (let i = 0; i < matchesPerRound; i++) {
        const home = teams[i];
        const away = teams[n - 1 - i];

        if (home !== 'BYE' && away !== 'BYE') {
          const matchStartTime = new Date(
            baseStartTime.getTime() + matchTimeCounter * intervalMinutes * 60000,
          );
          matchTimeCounter++;

          const match = this.matchRepository.create({
            tournamentId: tournament.id,
            homeTeamId: home,
            awayTeamId: away,
            venueId: defaultVenueId,
            scheduledStartTime: matchStartTime,
            matchStatus: MatchStatus.SCHEDULED,
          });
          const savedMatch = await this.matchRepository.save(match);

          const score = this.scoreRepository.create({
            matchId: savedMatch.id,
            homeTeamScoreDisplay: '0',
            awayTeamScoreDisplay: '0',
            detailedScorecardJson: {
              round,
              matchSequence: matchSeq,
              status: 'SCHEDULED',
            },
          });
          await this.scoreRepository.save(score);

          const bracket = this.bracketRepository.create({
            tournamentId: tournament.id,
            roundNumber: round,
            matchSequenceInRound: matchSeq,
            matchId: savedMatch.id,
            nextBracketId: null,
          });
          const savedBracket = await this.bracketRepository.save(bracket);

          bracketsCreated.push(savedBracket);
          matchesCreated.push(savedMatch);
          matchSeq++;
        }
      }

      // Rotate teams array keeping first element fixed (Circle method)
      const last = teams.pop()!;
      teams.splice(1, 0, last);
    }

    return { brackets: bracketsCreated, matches: matchesCreated };
  }

  /**
   * Helper: Generate Group stage & Knockout bracket
   */
  private async generateGroupAndKnockout(
    tournament: Tournament,
    teamIds: string[],
    defaultVenueId: string | null,
    baseStartTime: Date,
    intervalMinutes: number,
  ) {
    // Split into 2 groups (Group A and Group B)
    const mid = Math.ceil(teamIds.length / 2);
    const groupA = teamIds.slice(0, mid);
    const groupB = teamIds.slice(mid);

    const resultA = await this.generateRoundRobin(
      tournament,
      groupA,
      defaultVenueId,
      baseStartTime,
      intervalMinutes,
    );

    const baseStartTimeB = new Date(
      baseStartTime.getTime() + resultA.matches.length * intervalMinutes * 60000,
    );

    const resultB = await this.generateRoundRobin(
      tournament,
      groupB,
      defaultVenueId,
      baseStartTimeB,
      intervalMinutes,
    );

    return {
      brackets: [...resultA.brackets, ...resultB.brackets],
      matches: [...resultA.matches, ...resultB.matches],
    };
  }

  /**
   * Handle match result & advance winner in tournament progression
   */
  async advanceProgression(
    tournamentId: string,
    dto: AdvanceProgressionDto,
  ): Promise<{ message: string; tournamentStatus: TournamentStatus; nextMatch: Match | null }> {
    const { matchId, winnerTeamId } = dto;

    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['tournament'],
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (match.homeTeamId !== winnerTeamId && match.awayTeamId !== winnerTeamId) {
      throw new BadRequestException('Winner team must be either the home team or away team');
    }

    // Set match completed with winner
    match.winnerTeamId = winnerTeamId;
    match.matchStatus = MatchStatus.COMPLETED;
    await this.matchRepository.save(match);

    // Find the corresponding bracket node
    const currentBracket = await this.bracketRepository.findOne({
      where: { matchId },
    });

    if (!currentBracket || !currentBracket.nextBracketId) {
      // No next bracket -> This was the Final match!
      const tournament = await this.tournamentRepository.findOne({
        where: { id: tournamentId },
      });

      if (tournament) {
        tournament.tournamentStatus = TournamentStatus.COMPLETED;
        await this.tournamentRepository.save(tournament);
      }

      return {
        message: `Match completed. Team ${winnerTeamId} is the Tournament Champion! Tournament marked as COMPLETED.`,
        tournamentStatus: TournamentStatus.COMPLETED,
        nextMatch: null,
      };
    }

    // Target parent bracket node in next round
    const nextBracket = await this.bracketRepository.findOne({
      where: { id: currentBracket.nextBracketId },
    });

    if (!nextBracket) {
      return {
        message: 'Match completed. No further bracket slot found.',
        tournamentStatus: TournamentStatus.ONGOING,
        nextMatch: null,
      };
    }

    // Determine the sibling bracket node that feeds into this same nextBracketId
    const siblingBracket = await this.bracketRepository.findOne({
      where: {
        tournamentId,
        nextBracketId: currentBracket.nextBracketId,
        roundNumber: currentBracket.roundNumber,
      },
      relations: ['match'],
    });

    // Check if other sibling match has finished with a winner
    let siblingWinnerTeamId: string | null = null;
    const allSiblings = await this.bracketRepository.find({
      where: {
        tournamentId,
        nextBracketId: currentBracket.nextBracketId,
      },
      relations: ['match'],
    });

    for (const sib of allSiblings) {
      if (sib.id !== currentBracket.id && sib.match && sib.match.winnerTeamId) {
        siblingWinnerTeamId = sib.match.winnerTeamId;
      }
    }

    if (siblingWinnerTeamId) {
      // Both feeder matches have winners -> Create or update the next round Match!
      let nextMatch: Match;
      if (nextBracket.matchId) {
        nextMatch = (await this.matchRepository.findOne({
          where: { id: nextBracket.matchId },
        }))!;
        nextMatch.awayTeamId = winnerTeamId;
        nextMatch.matchStatus = MatchStatus.SCHEDULED;
      } else {
        nextMatch = this.matchRepository.create({
          tournamentId,
          homeTeamId: siblingWinnerTeamId,
          awayTeamId: winnerTeamId,
          venueId: match.venueId,
          scheduledStartTime: new Date(Date.now() + 86400000), // Next day default
          matchStatus: MatchStatus.SCHEDULED,
        });
      }

      const savedNextMatch = await this.matchRepository.save(nextMatch);

      // Initialize scorecard for next match if not already created
      const existingScore = await this.scoreRepository.findOne({
        where: { matchId: savedNextMatch.id },
      });
      if (!existingScore) {
        const score = this.scoreRepository.create({
          matchId: savedNextMatch.id,
          homeTeamScoreDisplay: '0',
          awayTeamScoreDisplay: '0',
          detailedScorecardJson: {
            round: nextBracket.roundNumber,
            matchSequence: nextBracket.matchSequenceInRound,
            status: 'SCHEDULED',
          },
        });
        await this.scoreRepository.save(score);
      }

      nextBracket.matchId = savedNextMatch.id;
      await this.bracketRepository.save(nextBracket);

      return {
        message: `Winner advanced! Next round match scheduled between Team ${siblingWinnerTeamId} and Team ${winnerTeamId}`,
        tournamentStatus: TournamentStatus.ONGOING,
        nextMatch: savedNextMatch,
      };
    } else {
      // Waiting for sibling feeder match to conclude
      return {
        message: `Match completed. Winner Team ${winnerTeamId} is waiting for opponent in Round ${nextBracket.roundNumber}`,
        tournamentStatus: TournamentStatus.ONGOING,
        nextMatch: null,
      };
    }
  }

  /**
   * Retrieve structured tournament bracket tree
   */
  async getBracketTree(tournamentId: string) {
    const brackets = await this.bracketRepository.find({
      where: { tournamentId },
      relations: [
        'match',
        'match.homeTeam',
        'match.awayTeam',
        'match.winnerTeam',
        'match.venue',
        'match.score',
      ],
      order: { roundNumber: 'ASC', matchSequenceInRound: 'ASC' },
    });

    // Group by rounds
    const rounds: Record<number, TournamentBracket[]> = {};
    for (const b of brackets) {
      if (!rounds[b.roundNumber]) {
        rounds[b.roundNumber] = [];
      }
      rounds[b.roundNumber].push(b);
    }

    return {
      tournamentId,
      totalRounds: Object.keys(rounds).length,
      rounds,
    };
  }
}

