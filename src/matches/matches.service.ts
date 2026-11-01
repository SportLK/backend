import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from '../database/entities/match.entity';
import { MatchScore } from '../database/entities/match-score.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { MatchQueryDto } from './dto/match-query.dto';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(MatchScore)
    private readonly scoreRepository: Repository<MatchScore>,
  ) {}

  /**
   * Schedule a new match and initialize its scorecard
   */
  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    const { tournamentId, homeTeamId, awayTeamId, venueId, scheduledStartTime } = createMatchDto;

    if (homeTeamId === awayTeamId) {
      throw new BadRequestException('Home team and Away team cannot be the same team');
    }

    const match = this.matchRepository.create({
      tournamentId: tournamentId || null,
      homeTeamId,
      awayTeamId,
      venueId: venueId || null,
      scheduledStartTime: new Date(scheduledStartTime),
      matchStatus: MatchStatus.SCHEDULED,
    });

    const savedMatch = await this.matchRepository.save(match);

    // Initialize blank scorecard
    const initialScore = this.scoreRepository.create({
      matchId: savedMatch.id,
      homeTeamScoreDisplay: '0',
      awayTeamScoreDisplay: '0',
      detailedScorecardJson: {
        events: [],
        timeline: [],
        status: 'Not started',
      },
    });
    await this.scoreRepository.save(initialScore);

    return this.findOne(savedMatch.id);
  }

  /**
   * Get all live matches (status = LIVE) with latest scores
   */
  async findLiveMatches(): Promise<Match[]> {
    return this.matchRepository.find({
      where: { matchStatus: MatchStatus.LIVE },
      relations: ['homeTeam', 'awayTeam', 'venue', 'tournament', 'score'],
      order: { scheduledStartTime: 'ASC' },
    });
  }

  /**
   * Get all matches with optional filters (tournament, team, venue, status, date)
   */
  async findAll(query: MatchQueryDto): Promise<Match[]> {
    const { tournamentId, teamId, venueId, matchStatus, date } = query;

    const qb = this.matchRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.homeTeam', 'homeTeam')
      .leftJoinAndSelect('m.awayTeam', 'awayTeam')
      .leftJoinAndSelect('m.venue', 'venue')
      .leftJoinAndSelect('m.tournament', 'tournament')
      .leftJoinAndSelect('m.score', 'score')
      .leftJoinAndSelect('m.winnerTeam', 'winnerTeam');

    if (tournamentId) {
      qb.andWhere('m.tournament_id = :tournamentId', { tournamentId });
    }

    if (teamId) {
      qb.andWhere('(m.home_team_id = :teamId OR m.away_team_id = :teamId)', { teamId });
    }

    if (venueId) {
      qb.andWhere('m.venue_id = :venueId', { venueId });
    }

    if (matchStatus) {
      qb.andWhere('m.match_status = :matchStatus', { matchStatus });
    }

    if (date) {
      qb.andWhere('DATE(m.scheduled_start_time) = :date', { date });
    }

    qb.orderBy('m.scheduled_start_time', 'ASC');

    return qb.getMany();
  }

  /**
   * Get single match by ID with full details
   */
  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['homeTeam', 'awayTeam', 'venue', 'tournament', 'score', 'winnerTeam'],
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }

  /**
   * Update match status (e.g. SCHEDULED -> LIVE -> COMPLETED)
   */
  async updateStatus(id: string, updateDto: UpdateMatchStatusDto): Promise<Match> {
    const match = await this.findOne(id);

    match.matchStatus = updateDto.matchStatus;

    if (updateDto.winnerTeamId) {
      if (
        updateDto.winnerTeamId !== match.homeTeamId &&
        updateDto.winnerTeamId !== match.awayTeamId
      ) {
        throw new BadRequestException('Winner team must be either the home team or away team');
      }
      match.winnerTeamId = updateDto.winnerTeamId;
    }

    await this.matchRepository.save(match);

    // Update score display if included
    if (
      updateDto.homeTeamScoreDisplay ||
      updateDto.awayTeamScoreDisplay ||
      updateDto.detailedScorecardJson
    ) {
      await this.updateScore(id, {
        homeTeamScoreDisplay: updateDto.homeTeamScoreDisplay,
        awayTeamScoreDisplay: updateDto.awayTeamScoreDisplay,
        detailedScorecardJson: updateDto.detailedScorecardJson,
        lastUpdatedByUserId: updateDto.lastUpdatedByUserId,
      });
    }

    return this.findOne(id);
  }

  /**
   * Update live match score and scorecard JSON
   */
  async updateScore(matchId: string, scoreDto: UpdateScoreDto): Promise<MatchScore> {
    let score = await this.scoreRepository.findOne({ where: { matchId } });

    if (!score) {
      score = this.scoreRepository.create({ matchId });
    }

    if (scoreDto.homeTeamScoreDisplay !== undefined) {
      score.homeTeamScoreDisplay = scoreDto.homeTeamScoreDisplay;
    }

    if (scoreDto.awayTeamScoreDisplay !== undefined) {
      score.awayTeamScoreDisplay = scoreDto.awayTeamScoreDisplay;
    }

    if (scoreDto.detailedScorecardJson !== undefined) {
      score.detailedScorecardJson = scoreDto.detailedScorecardJson;
    }

    if (scoreDto.lastUpdatedByUserId !== undefined) {
      score.lastUpdatedByUserId = scoreDto.lastUpdatedByUserId;
    }

    return this.scoreRepository.save(score);
  }

  /**
   * Cancel or delete a match
   */
  async remove(id: string): Promise<{ message: string }> {
    const match = await this.findOne(id);
    await this.matchRepository.remove(match);
    return { message: `Match ${id} deleted successfully` };
  }
}
