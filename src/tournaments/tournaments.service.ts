import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
} from '../database/entities/tournament.entity';
import {
  TournamentRegistration,
  RegistrationStatus,
} from '../database/entities/tournament-registration.entity';
import { TournamentBracket } from '../database/entities/tournament-bracket.entity';
import {
  TournamentReport,
  TournamentReportStatus,
} from '../database/entities/tournament-report.entity';
import { Match, MatchStatus } from '../database/entities/match.entity';
import { Team } from '../database/entities/team.entity';
import { Venue } from '../database/entities/venue.entity';
import { User } from '../database/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateTournamentDto,
  UpdateTournamentDto,
  QueryTournamentsDto,
  RegisterTeamDto,
  UpdateRegistrationStatusDto,
  GenerateBracketDto,
  CreateTournamentReportDto,
  ResolveTournamentReportDto,
} from './dto';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepo: Repository<Tournament>,
    @InjectRepository(TournamentRegistration)
    private readonly registrationRepo: Repository<TournamentRegistration>,
    @InjectRepository(TournamentBracket)
    private readonly bracketRepo: Repository<TournamentBracket>,
    @InjectRepository(TournamentReport)
    private readonly reportRepo: Repository<TournamentReport>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notifications: NotificationsService,
    private readonly dataSource: DataSource,
  ) {}

  // =========================================================================
  // 1. TOURNAMENT CRUD & SEARCH
  // =========================================================================

  async createTournament(organizerId: string, dto: CreateTournamentDto) {
    if (dto.venueId) {
      const venue = await this.venueRepo.findOne({ where: { id: dto.venueId } });
      if (!venue) {
        throw new NotFoundException(`Venue with ID ${dto.venueId} not found`);
      }
    }

    const tournament = this.tournamentRepo.create({
      ...dto,
      organizerId,
      tournamentStatus: TournamentStatus.OPEN_FOR_REGISTRATION,
    });

    return this.tournamentRepo.save(tournament);
  }

  async findAll(query: QueryTournamentsDto) {
    const qb = this.tournamentRepo
      .createQueryBuilder('tournament')
      .leftJoinAndSelect('tournament.organizer', 'organizer')
      .leftJoinAndSelect('tournament.venue', 'venue')
      .loadRelationCountAndMap(
        'tournament.confirmedTeamsCount',
        'tournament.registrations',
        'reg',
        (qb) => qb.where('reg.registration_status = :status', { status: RegistrationStatus.CONFIRMED }),
      );

    if (query.sportType) {
      qb.andWhere('tournament.sportType = :sportType', { sportType: query.sportType });
    }
    if (query.status) {
      qb.andWhere('tournament.tournamentStatus = :status', { status: query.status });
    }
    if (query.format) {
      qb.andWhere('tournament.tournamentFormat = :format', { format: query.format });
    }
    if (query.city) {
      qb.andWhere('tournament.city LIKE :city', { city: `%${query.city}%` });
    }
    if (query.venueId) {
      qb.andWhere('tournament.venueId = :venueId', { venueId: query.venueId });
    }
    if (query.organizerId) {
      qb.andWhere('tournament.organizerId = :organizerId', { organizerId: query.organizerId });
    }
    if (query.search) {
      qb.andWhere(
        '(tournament.tournamentName LIKE :search OR tournament.description LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('tournament.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const tournament = await this.tournamentRepo.findOne({
      where: { id },
      relations: [
        'organizer',
        'venue',
        'registrations',
        'registrations.team',
        'matches',
        'matches.homeTeam',
        'matches.awayTeam',
        'matches.score',
        'matches.winnerTeam',
        'brackets',
        'brackets.team1',
        'brackets.team2',
        'brackets.winner',
        'brackets.match',
      ],
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    return tournament;
  }

  async updateTournament(id: string, userId: string, dto: UpdateTournamentDto, isAdmin = false) {
    const tournament = await this.tournamentRepo.findOne({ where: { id } });
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    if (!isAdmin && tournament.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer or an admin can update this tournament');
    }

    if (dto.venueId && dto.venueId !== tournament.venueId) {
      const venue = await this.venueRepo.findOne({ where: { id: dto.venueId } });
      if (!venue) {
        throw new NotFoundException(`Venue with ID ${dto.venueId} not found`);
      }
    }

    Object.assign(tournament, dto);
    return this.tournamentRepo.save(tournament);
  }

  async deleteTournament(id: string, userId: string, isAdmin = false) {
    const tournament = await this.tournamentRepo.findOne({ where: { id } });
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    if (!isAdmin && tournament.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer or an admin can delete this tournament');
    }

    await this.tournamentRepo.remove(tournament);
    return { success: true, message: `Tournament ${id} deleted successfully` };
  }

  // =========================================================================
  // 2. ORGANIZER WORKSPACE
  // =========================================================================

  async getOrganizerWorkspace(organizerId: string) {
    const tournaments = await this.tournamentRepo.find({
      where: { organizerId },
      relations: ['venue', 'registrations', 'registrations.team'],
      order: { createdAt: 'DESC' },
    });

    const total = tournaments.length;
    const ongoing = tournaments.filter((t) => t.tournamentStatus === TournamentStatus.ONGOING).length;
    const open = tournaments.filter((t) => t.tournamentStatus === TournamentStatus.OPEN_FOR_REGISTRATION).length;
    const completed = tournaments.filter((t) => t.tournamentStatus === TournamentStatus.COMPLETED).length;

    const totalRegistrations = tournaments.reduce((acc, t) => acc + (t.registrations?.length || 0), 0);

    return {
      stats: {
        totalTournaments: total,
        ongoingTournaments: ongoing,
        openTournaments: open,
        completedTournaments: completed,
        totalRegistrations,
      },
      tournaments,
    };
  }

  // =========================================================================
  // 3. TEAM REGISTRATIONS
  // =========================================================================

  async registerTeam(tournamentId: string, teamManagerId: string, dto: RegisterTeamDto) {
    const tournament = await this.tournamentRepo.findOne({
      where: { id: tournamentId },
      relations: ['registrations'],
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }

    if (tournament.tournamentStatus !== TournamentStatus.OPEN_FOR_REGISTRATION) {
      throw new BadRequestException('This tournament is currently not open for registration');
    }

    const team = await this.teamRepo.findOne({ where: { id: dto.teamId } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${dto.teamId} not found`);
    }

    // Check if team sport matches tournament sport
    if (team.sportType && tournament.sportType && team.sportType !== tournament.sportType) {
      throw new BadRequestException(
        `Team sport (${team.sportType}) does not match tournament sport (${tournament.sportType})`,
      );
    }

    const existingReg = await this.registrationRepo.findOne({
      where: { tournamentId, teamId: dto.teamId },
    });

    if (existingReg) {
      throw new BadRequestException('This team is already registered for this tournament');
    }

    const confirmedCount = tournament.registrations?.filter(
      (r) => r.registrationStatus === RegistrationStatus.CONFIRMED,
    ).length || 0;

    if (confirmedCount >= tournament.maxParticipatingTeams) {
      throw new BadRequestException('This tournament has already reached its maximum team capacity');
    }

    // Default to CONFIRMED if registration fee is 0, otherwise PAYMENT_PENDING
    const initialStatus =
      Number(tournament.registrationFee) > 0
        ? RegistrationStatus.PAYMENT_PENDING
        : RegistrationStatus.CONFIRMED;

    const reg = this.registrationRepo.create({
      tournamentId,
      teamId: dto.teamId,
      registrationStatus: initialStatus,
    });

    const savedReg = await this.registrationRepo.save(reg);

    // Notify the organizer about new registration
    await this.notifications.create(
      tournament.organizerId,
      'New Team Registration',
      `Team "${team.teamName}" has registered for your tournament "${tournament.tournamentName}".`,
      'SYSTEM',
    );

    return savedReg;
  }

  async listRegistrations(tournamentId: string) {
    return this.registrationRepo.find({
      where: { tournamentId },
      relations: ['team', 'team.manager'],
      order: { registeredAt: 'ASC' },
    });
  }

  async updateRegistrationStatus(
    tournamentId: string,
    registrationId: string,
    userId: string,
    dto: UpdateRegistrationStatusDto,
    isAdmin = false,
  ) {
    const tournament = await this.tournamentRepo.findOne({ where: { id: tournamentId } });
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }

    if (!isAdmin && tournament.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer or an admin can manage registrations');
    }

    const reg = await this.registrationRepo.findOne({
      where: { id: registrationId, tournamentId },
      relations: ['team'],
    });

    if (!reg) {
      throw new NotFoundException(`Registration with ID ${registrationId} not found`);
    }

    reg.registrationStatus = dto.status;
    const updated = await this.registrationRepo.save(reg);

    // Notify team manager
    if (reg.team?.managerId) {
      await this.notifications.create(
        reg.team.managerId,
        'Tournament Registration Update',
        `Your registration for "${tournament.tournamentName}" is now ${dto.status}.`,
        'SYSTEM',
      );
    }

    return updated;
  }

  // =========================================================================
  // 4. BRACKET GENERATION & FORMAT ENGINE
  // =========================================================================

  async generateBracket(
    tournamentId: string,
    userId: string,
    dto: GenerateBracketDto,
    isAdmin = false,
  ) {
    const tournament = await this.tournamentRepo.findOne({
      where: { id: tournamentId },
      relations: ['registrations', 'registrations.team'],
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }

    if (!isAdmin && tournament.organizerId !== userId) {
      throw new ForbiddenException('Only the tournament organizer or admin can generate brackets');
    }

    const confirmedRegs = (tournament.registrations || []).filter(
      (r) => r.registrationStatus === RegistrationStatus.CONFIRMED,
    );

    if (confirmedRegs.length < tournament.minParticipatingTeams) {
      throw new BadRequestException(
        `Tournament requires at least ${tournament.minParticipatingTeams} confirmed teams to generate brackets. Current confirmed: ${confirmedRegs.length}`,
      );
    }

    const venueId = dto.venueId || tournament.venueId;
    const intervalMinutes = dto.matchIntervalMinutes || 90;

    let teams = confirmedRegs.map((r) => r.team).filter((t): t is Team => !!t);
    if (dto.seedRandomly !== false) {
      teams = [...teams].sort(() => Math.random() - 0.5);
    }

    return this.dataSource.transaction(async (manager) => {
      // Clear any prior brackets and tournament matches
      await manager.delete(TournamentBracket, { tournamentId });
      await manager.delete(Match, { tournamentId });

      let createdBrackets: TournamentBracket[] = [];

      if (tournament.tournamentFormat === TournamentFormat.ROUND_ROBIN) {
        createdBrackets = await this.generateRoundRobin(manager, tournament, teams, venueId, intervalMinutes);
      } else {
        // Default to Knockout (Single elimination)
        createdBrackets = await this.generateKnockout(manager, tournament, teams, venueId, intervalMinutes);
      }

      // Mark tournament ONGOING and REGISTRATION_CLOSED
      tournament.tournamentStatus = TournamentStatus.ONGOING;
      await manager.save(Tournament, tournament);

      return {
        message: 'Bracket successfully generated and fixtures scheduled.',
        tournamentFormat: tournament.tournamentFormat,
        totalTeams: teams.length,
        bracketsCount: createdBrackets.length,
        brackets: createdBrackets,
      };
    });
  }

  private async generateKnockout(
    manager: any,
    tournament: Tournament,
    teams: Team[],
    venueId: string | null,
    intervalMinutes: number,
  ): Promise<TournamentBracket[]> {
    const teamCount = teams.length;
    // Find next power of 2: 4, 8, 16, 32
    let bracketSize = 2;
    while (bracketSize < teamCount) {
      bracketSize *= 2;
    }

    const totalRounds = Math.log2(bracketSize);
    const roundNames = this.getKnockoutRoundNames(totalRounds);

    const bracketRepo = manager.getRepository(TournamentBracket);
    const matchRepo = manager.getRepository(Match);

    const roundBrackets: TournamentBracket[][] = [];
    const baseDate = new Date(tournament.startDate);

    // Build the bracket nodes from Finals back to Round 1
    // Round indices: 1 to totalRounds (e.g. 1 = QF, 2 = SF, 3 = Final)
    for (let round = 1; round <= totalRounds; round++) {
      const matchesInRound = bracketSize / Math.pow(2, round);
      const currentRoundBrackets: TournamentBracket[] = [];

      for (let seq = 1; seq <= matchesInRound; seq++) {
        const bracket = bracketRepo.create({
          tournamentId: tournament.id,
          roundNumber: round,
          roundName: roundNames[round - 1] || `Round ${round}`,
          matchSequenceInRound: seq,
          team1Id: null,
          team2Id: null,
          winnerId: null,
          matchId: null,
          nextBracketId: null,
        });
        currentRoundBrackets.push(bracket);
      }
      roundBrackets.push(currentRoundBrackets);
    }

    // Save all bracket nodes first so we have IDs
    for (let r = 0; r < roundBrackets.length; r++) {
      roundBrackets[r] = await bracketRepo.save(roundBrackets[r]);
    }

    // Link nextBracketId from round r to round r + 1
    for (let r = 0; r < roundBrackets.length - 1; r++) {
      const current = roundBrackets[r];
      const nextRound = roundBrackets[r + 1];

      for (let i = 0; i < current.length; i++) {
        const parentIndex = Math.floor(i / 2);
        current[i].nextBracketId = nextRound[parentIndex].id;
      }
      await bracketRepo.save(current);
    }

    // Seed Round 1 with teams
    const round1 = roundBrackets[0];
    let matchTimeCounter = 0;

    for (let i = 0; i < round1.length; i++) {
      const team1 = teams[i * 2] || null;
      const team2 = teams[i * 2 + 1] || null;

      round1[i].team1Id = team1?.id || null;
      round1[i].team2Id = team2?.id || null;

      // If both teams exist, create scheduled Match
      if (team1 && team2) {
        const matchStartTime = new Date(baseDate.getTime() + matchTimeCounter * intervalMinutes * 60000);
        matchTimeCounter++;

        const match = matchRepo.create({
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id,
          venueId: venueId || null,
          scheduledStartTime: matchStartTime,
          matchStatus: MatchStatus.SCHEDULED,
        });
        const savedMatch = await matchRepo.save(match);
        round1[i].matchId = savedMatch.id;
      } else if (team1 && !team2) {
        // BYE: team1 advances automatically!
        round1[i].winnerId = team1.id;
        if (round1[i].nextBracketId) {
          const nextNode = await bracketRepo.findOne({ where: { id: round1[i].nextBracketId } });
          if (nextNode) {
            if (!nextNode.team1Id) nextNode.team1Id = team1.id;
            else nextNode.team2Id = team1.id;
            await bracketRepo.save(nextNode);
          }
        }
      }
    }

    await bracketRepo.save(round1);

    // Return flattened list
    return bracketRepo.find({
      where: { tournamentId: tournament.id },
      relations: ['team1', 'team2', 'winner', 'match'],
      order: { roundNumber: 'ASC', matchSequenceInRound: 'ASC' },
    });
  }

  private getKnockoutRoundNames(totalRounds: number): string[] {
    const names: string[] = [];
    for (let r = 1; r <= totalRounds; r++) {
      const fromFinal = totalRounds - r;
      if (fromFinal === 0) names.push('Final');
      else if (fromFinal === 1) names.push('Semi-Final');
      else if (fromFinal === 2) names.push('Quarter-Final');
      else if (fromFinal === 3) names.push('Round of 16');
      else if (fromFinal === 4) names.push('Round of 32');
      else names.push(`Round ${r}`);
    }
    return names;
  }

  private async generateRoundRobin(
    manager: any,
    tournament: Tournament,
    teams: Team[],
    venueId: string | null,
    intervalMinutes: number,
  ): Promise<TournamentBracket[]> {
    const bracketRepo = manager.getRepository(TournamentBracket);
    const matchRepo = manager.getRepository(Match);
    const created: TournamentBracket[] = [];
    const baseDate = new Date(tournament.startDate);
    let matchCounter = 0;

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matchCounter++;
        const team1 = teams[i];
        const team2 = teams[j];

        const matchStartTime = new Date(baseDate.getTime() + matchCounter * intervalMinutes * 60000);

        const match = matchRepo.create({
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id,
          venueId: venueId || null,
          scheduledStartTime: matchStartTime,
          matchStatus: MatchStatus.SCHEDULED,
        });
        const savedMatch = await matchRepo.save(match);

        const bracket = bracketRepo.create({
          tournamentId: tournament.id,
          roundNumber: 1,
          roundName: `Matchday ${matchCounter}`,
          matchSequenceInRound: matchCounter,
          team1Id: team1.id,
          team2Id: team2.id,
          matchId: savedMatch.id,
        });
        const savedBracket = await bracketRepo.save(bracket);
        created.push(savedBracket);
      }
    }

    return bracketRepo.find({
      where: { tournamentId: tournament.id },
      relations: ['team1', 'team2', 'winner', 'match'],
    });
  }

  // =========================================================================
  // 5. PROGRESSION ENGINE & BRACKET TREE
  // =========================================================================

  async getBracketTree(tournamentId: string) {
    const brackets = await this.bracketRepo.find({
      where: { tournamentId },
      relations: ['team1', 'team2', 'winner', 'match', 'match.score', 'match.venue'],
      order: { roundNumber: 'ASC', matchSequenceInRound: 'ASC' },
    });

    const roundsMap = new Map<number, { roundNumber: number; roundName: string; matches: any[] }>();

    for (const b of brackets) {
      if (!roundsMap.has(b.roundNumber)) {
        roundsMap.set(b.roundNumber, {
          roundNumber: b.roundNumber,
          roundName: b.roundName || `Round ${b.roundNumber}`,
          matches: [],
        });
      }
      roundsMap.get(b.roundNumber)?.matches.push({
        bracketId: b.id,
        sequence: b.matchSequenceInRound,
        nextBracketId: b.nextBracketId,
        team1: b.team1 ? { id: b.team1.id, name: b.team1.teamName, logo: b.team1.logoUrl } : null,
        team2: b.team2 ? { id: b.team2.id, name: b.team2.teamName, logo: b.team2.logoUrl } : null,
        winner: b.winner ? { id: b.winner.id, name: b.winner.teamName } : null,
        match: b.match,
      });
    }

    return {
      tournamentId,
      rounds: Array.from(roundsMap.values()),
    };
  }

  async advanceMatchWinner(
    tournamentId: string,
    bracketId: string,
    winnerTeamId: string,
    userId: string,
    isAdmin = false,
  ) {
    const tournament = await this.tournamentRepo.findOne({ where: { id: tournamentId } });
    if (!tournament) throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);

    if (!isAdmin && tournament.organizerId !== userId) {
      throw new ForbiddenException('Only organizer or admin can advance winners');
    }

    const bracket = await this.bracketRepo.findOne({
      where: { id: bracketId, tournamentId },
      relations: ['match'],
    });

    if (!bracket) throw new NotFoundException(`Bracket node ${bracketId} not found`);

    if (bracket.team1Id !== winnerTeamId && bracket.team2Id !== winnerTeamId) {
      throw new BadRequestException('Winner must be one of the participating teams in this bracket match');
    }

    return this.dataSource.transaction(async (manager) => {
      // 1. Set winner on bracket node
      bracket.winnerId = winnerTeamId;
      await manager.save(TournamentBracket, bracket);

      // 2. Update Match entity if exists
      if (bracket.matchId) {
        const match = await manager.findOne(Match, { where: { id: bracket.matchId } });
        if (match) {
          match.matchStatus = MatchStatus.COMPLETED;
          match.winnerTeamId = winnerTeamId;
          await manager.save(Match, match);
        }
      }

      // 3. Advance to next bracket if exists
      if (bracket.nextBracketId) {
        const nextBracket = await manager.findOne(TournamentBracket, {
          where: { id: bracket.nextBracketId },
        });

        if (nextBracket) {
          // If match sequence is odd, goes to team1, else team2
          if (bracket.matchSequenceInRound % 2 === 1) {
            nextBracket.team1Id = winnerTeamId;
          } else {
            nextBracket.team2Id = winnerTeamId;
          }

          // If both teams are now present, create scheduled Match for next round!
          if (nextBracket.team1Id && nextBracket.team2Id && !nextBracket.matchId) {
            const match = manager.create(Match, {
              tournamentId: tournament.id,
              homeTeamId: nextBracket.team1Id,
              awayTeamId: nextBracket.team2Id,
              venueId: tournament.venueId,
              scheduledStartTime: new Date(Date.now() + 24 * 3600000), // Next day default
              matchStatus: MatchStatus.SCHEDULED,
            });
            const savedMatch = await manager.save(Match, match);
            nextBracket.matchId = savedMatch.id;
          }

          await manager.save(TournamentBracket, nextBracket);
        }
      } else {
        // Final match won! Conclude tournament!
        tournament.tournamentStatus = TournamentStatus.COMPLETED;
        await manager.save(Tournament, tournament);

        const championTeam = await manager.findOne(Team, { where: { id: winnerTeamId } });
        if (championTeam?.managerId) {
          await this.notifications.create(
            championTeam.managerId,
            'Tournament Champions!',
            `Congratulations! Your team "${championTeam.teamName}" has won the "${tournament.tournamentName}"!`,
            'SYSTEM',
          );
        }
      }

      return {
        success: true,
        message: 'Winner advanced successfully',
        winnerTeamId,
        isTournamentCompleted: !bracket.nextBracketId,
      };
    });
  }

  async getSchedules(tournamentId: string) {
    return this.matchRepo.find({
      where: { tournamentId },
      relations: ['homeTeam', 'awayTeam', 'venue', 'score', 'winnerTeam'],
      order: { scheduledStartTime: 'ASC' },
    });
  }

  // =========================================================================
  // 6. TOURNAMENT REPORTS & DISPUTES
  // =========================================================================

  async createReport(tournamentId: string, reporterId: string, dto: CreateTournamentReportDto) {
    const tournament = await this.tournamentRepo.findOne({ where: { id: tournamentId } });
    if (!tournament) throw new NotFoundException(`Tournament ${tournamentId} not found`);

    const reportNumber = `TR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const report = this.reportRepo.create({
      reportNumber,
      tournamentId,
      reporterId,
      reason: dto.reason,
      details: dto.details,
      severity: dto.severity || 'MEDIUM',
      status: TournamentReportStatus.OPEN,
    });

    return this.reportRepo.save(report);
  }

  async listReports(status?: TournamentReportStatus) {
    const qb = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.tournament', 'tournament')
      .leftJoinAndSelect('report.reporter', 'reporter');

    if (status) {
      qb.andWhere('report.status = :status', { status });
    }

    qb.orderBy('report.createdAt', 'DESC');
    return qb.getMany();
  }

  async resolveReport(reportId: string, adminId: string, dto: ResolveTournamentReportDto) {
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException(`Tournament report ${reportId} not found`);

    report.status = dto.status;
    report.handledByAdminId = adminId;
    report.resolutionNotes = dto.resolutionNotes;

    return this.reportRepo.save(report);
  }

  // =========================================================================
  // 7. DEMO SEEDER
  // =========================================================================

  async seedDemoData() {
    const organizers = await this.userRepo.find({ where: { isTournamentOrganizer: true } });
    const organizer = organizers[0] || (await this.userRepo.findOne({ where: {} }));
    if (!organizer) {
      throw new BadRequestException('No users found to seed tournament demo data.');
    }

    const venues = await this.venueRepo.find();
    const colomboVenue = venues.find((v) => v.city.toLowerCase().includes('colombo')) || venues[0];
    const kandyVenue = venues.find((v) => v.city.toLowerCase().includes('kandy')) || venues[1] || venues[0];

    const teams = await this.teamRepo.find({ take: 8 });

    // 1. Create Colombo Futsal Cup
    let futsalCup = await this.tournamentRepo.findOne({
      where: { tournamentName: 'Colombo Premier Futsal Cup' },
    });

    if (!futsalCup) {
      futsalCup = await this.tournamentRepo.save(
        this.tournamentRepo.create({
          tournamentName: 'Colombo Premier Futsal Cup',
          sportType: 'FOOTBALL' as any,
          tournamentFormat: TournamentFormat.KNOCKOUT_SINGLE,
          organizerId: organizer.id,
          venueId: colomboVenue?.id || null,
          city: 'Colombo',
          minParticipatingTeams: 4,
          maxParticipatingTeams: 8,
          registrationFee: 5000,
          prizePool: 'LKR 100,000 + Trophy',
          startDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
          registrationDeadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          tournamentStatus: TournamentStatus.OPEN_FOR_REGISTRATION,
          description: 'The premier open futsal tournament in Colombo for club and academy teams.',
          rules: '5-a-side FIFA futsal rules. 20-minute halves. Rolling substitutions.',
        }),
      );

      // Register teams
      if (teams.length >= 4) {
        for (let i = 0; i < Math.min(teams.length, 4); i++) {
          await this.registrationRepo.save(
            this.registrationRepo.create({
              tournamentId: futsalCup.id,
              teamId: teams[i].id,
              registrationStatus: RegistrationStatus.CONFIRMED,
            }),
          );
        }
      }
    }

    // 2. Create Kandy T20 Cricket Championship
    let cricketCup = await this.tournamentRepo.findOne({
      where: { tournamentName: 'Kandy T20 Cricket Championship' },
    });

    if (!cricketCup) {
      cricketCup = await this.tournamentRepo.save(
        this.tournamentRepo.create({
          tournamentName: 'Kandy T20 Cricket Championship',
          sportType: 'CRICKET' as any,
          tournamentFormat: TournamentFormat.ROUND_ROBIN,
          organizerId: organizer.id,
          venueId: kandyVenue?.id || null,
          city: 'Kandy',
          minParticipatingTeams: 4,
          maxParticipatingTeams: 6,
          registrationFee: 7500,
          prizePool: 'LKR 250,000 + Medals',
          startDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          endDate: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
          registrationDeadline: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          tournamentStatus: TournamentStatus.OPEN_FOR_REGISTRATION,
          description: 'Central Province annual T20 championship organized for amateur & semi-pro clubs.',
          rules: 'ICC standard T20 rules. White balls, colored clothing.',
        }),
      );
    }

    return {
      success: true,
      message: 'Demo tournament data successfully seeded',
      tournaments: [futsalCup, cricketCup],
    };
  }
}

