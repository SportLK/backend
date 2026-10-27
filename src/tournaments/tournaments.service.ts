import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
} from '../database/entities/tournament.entity';
import {
  TournamentRegistration,
  RegistrationStatus,
} from '../database/entities/tournament-registration.entity';
import { Match, MatchStatus } from '../database/entities/match.entity';
import { Venue } from '../database/entities/venue.entity';
import { User } from '../database/entities/user.entity';
import { Team } from '../database/entities/team.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentQueryDto } from './dto/tournament-query.dto';
import { UpdateTournamentStatusDto } from './dto/update-tournament-status.dto';
import { RegisterTeamDto } from './dto/register-team.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
import { GenerateBracketsDto } from './dto/generate-brackets.dto';
import { ScheduleMatchDto, BulkScheduleMatchesDto } from './dto/schedule-match.dto';
import { AdvanceProgressionDto } from './dto/advance-progression.dto';
import { AdminModerateTournamentDto } from './dto/admin-moderate-tournament.dto';
import { BracketService } from './bracket.service';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
    @InjectRepository(TournamentRegistration)
    private readonly registrationRepository: Repository<TournamentRegistration>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly bracketService: BracketService,
  ) {}

  /**
   * Create a new tournament
   */
  async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    const {
      organizerId,
      venueId,
      tournamentName,
      sportType,
      tournamentFormat,
      maxParticipatingTeams,
      registrationFee,
      startDate,
      endDate,
      tournamentStatus,
    } = createTournamentDto;

    // Validate organizer exists
    const organizer = await this.userRepository.findOne({ where: { id: organizerId } });
    if (!organizer) {
      throw new NotFoundException(`Organizer with ID ${organizerId} not found`);
    }

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('startDate cannot be after endDate');
    }

    // Validate venue if provided
    if (venueId) {
      const venue = await this.venueRepository.findOne({ where: { id: venueId } });
      if (!venue) {
        throw new NotFoundException(`Venue with ID ${venueId} not found`);
      }
    }

    const tournament = this.tournamentRepository.create({
      organizerId,
      venueId: venueId || null,
      tournamentName,
      sportType,
      tournamentFormat: tournamentFormat || TournamentFormat.KNOCKOUT_SINGLE,
      maxParticipatingTeams: maxParticipatingTeams || 16,
      registrationFee: registrationFee || 0.0,
      startDate,
      endDate,
      tournamentStatus: tournamentStatus || TournamentStatus.DRAFT,
    });

    return this.tournamentRepository.save(tournament);
  }

  /**
   * Find tournaments with multiple query filters & search
   */
  async findAll(query: TournamentQueryDto): Promise<Tournament[]> {
    const { sportType, tournamentStatus, tournamentFormat, organizerId, venueId, search } = query;

    const qb = this.tournamentRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.organizer', 'organizer')
      .leftJoinAndSelect('t.venue', 'venue')
      .leftJoinAndSelect('t.registrations', 'registrations');

    if (sportType) {
      qb.andWhere('t.sportType = :sportType', { sportType });
    }

    if (tournamentStatus) {
      qb.andWhere('t.tournamentStatus = :tournamentStatus', { tournamentStatus });
    }

    if (tournamentFormat) {
      qb.andWhere('t.tournamentFormat = :tournamentFormat', { tournamentFormat });
    }

    if (organizerId) {
      qb.andWhere('t.organizerId = :organizerId', { organizerId });
    }

    if (venueId) {
      qb.andWhere('t.venueId = :venueId', { venueId });
    }

    if (search) {
      qb.andWhere('LOWER(t.tournamentName) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('t.startDate', 'DESC');
    return qb.getMany();
  }

  /**
   * Find a single tournament with relations
   */
  async findOne(id: string): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id },
      relations: [
        'organizer',
        'venue',
        'venue.facilities',
        'registrations',
        'registrations.team',
        'matches',
        'matches.homeTeam',
        'matches.awayTeam',
        'matches.score',
      ],
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    return tournament;
  }

  /**
   * Update tournament details
   */
  async update(id: string, updateDto: UpdateTournamentDto): Promise<Tournament> {
    const tournament = await this.findOne(id);

    if (
      tournament.tournamentStatus === TournamentStatus.COMPLETED ||
      tournament.tournamentStatus === TournamentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot edit tournament with status: ${tournament.tournamentStatus}`,
      );
    }

    if (updateDto.startDate && updateDto.endDate) {
      if (new Date(updateDto.startDate) > new Date(updateDto.endDate)) {
        throw new BadRequestException('startDate cannot be after endDate');
      }
    }

    if (updateDto.venueId) {
      const venue = await this.venueRepository.findOne({ where: { id: updateDto.venueId } });
      if (!venue) {
        throw new NotFoundException(`Venue with ID ${updateDto.venueId} not found`);
      }
    }

    Object.assign(tournament, updateDto);
    return this.tournamentRepository.save(tournament);
  }

  /**
   * Update tournament status
   */
  async updateStatus(id: string, dto: UpdateTournamentStatusDto): Promise<Tournament> {
    const tournament = await this.findOne(id);
    tournament.tournamentStatus = dto.tournamentStatus;
    return this.tournamentRepository.save(tournament);
  }

  /**
   * Delete or cancel a tournament
   */
  async remove(id: string): Promise<{ message: string }> {
    const tournament = await this.findOne(id);

    if (tournament.registrations && tournament.registrations.length > 0) {
      // Soft cancel if registrations exist
      tournament.tournamentStatus = TournamentStatus.CANCELLED;
      await this.tournamentRepository.save(tournament);
      return { message: `Tournament ${id} had registrations and was marked as CANCELLED.` };
    }

    await this.tournamentRepository.delete(id);
    return { message: `Tournament ${id} deleted successfully.` };
  }

  /**
   * Get tournament venue details
   */
  async getVenue(tournamentId: string): Promise<Venue> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
      relations: ['venue', 'venue.facilities'],
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }

    if (!tournament.venue) {
      throw new NotFoundException(`No venue assigned to tournament ${tournamentId}`);
    }

    return tournament.venue;
  }

  /**
   * Assign or update venue for tournament
   */
  async assignVenue(tournamentId: string, venueId: string): Promise<Tournament> {
    const tournament = await this.findOne(tournamentId);
    const venue = await this.venueRepository.findOne({ where: { id: venueId } });

    if (!venue) {
      throw new NotFoundException(`Venue with ID ${venueId} not found`);
    }

    tournament.venueId = venueId;
    return this.tournamentRepository.save(tournament);
  }

  /**
   * Register a team for a tournament
   */
  async registerTeam(
    tournamentId: string,
    dto: RegisterTeamDto,
  ): Promise<TournamentRegistration> {
    const tournament = await this.findOne(tournamentId);

    if (tournament.tournamentStatus !== TournamentStatus.OPEN_FOR_REGISTRATION) {
      throw new BadRequestException(
        `Tournament is not open for registration (Status: ${tournament.tournamentStatus})`,
      );
    }

    // Check capacity
    const currentConfirmedCount = await this.registrationRepository.count({
      where: {
        tournamentId,
        registrationStatus: RegistrationStatus.CONFIRMED,
      },
    });

    if (currentConfirmedCount >= tournament.maxParticipatingTeams) {
      throw new BadRequestException(
        `Tournament is already at maximum capacity (${tournament.maxParticipatingTeams} teams)`,
      );
    }

    // Validate team
    const team = await this.teamRepository.findOne({ where: { id: dto.teamId } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${dto.teamId} not found`);
    }

    // Check duplicate
    const existing = await this.registrationRepository.findOne({
      where: { tournamentId, teamId: dto.teamId },
    });
    if (existing) {
      throw new ConflictException(`Team ${dto.teamId} is already registered for this tournament`);
    }

    // If registration fee is 0, auto-confirm; otherwise, if payment provided, confirm, else PAYMENT_PENDING
    const status =
      Number(tournament.registrationFee) === 0 || dto.paymentId
        ? RegistrationStatus.CONFIRMED
        : RegistrationStatus.PAYMENT_PENDING;

    const registration = this.registrationRepository.create({
      tournamentId,
      teamId: dto.teamId,
      paymentId: dto.paymentId || null,
      registrationStatus: status,
    });

    return this.registrationRepository.save(registration);
  }

  /**
   * List all registrations for a tournament
   */
  async findAllRegistrations(tournamentId: string): Promise<TournamentRegistration[]> {
    await this.findOne(tournamentId);

    return this.registrationRepository.find({
      where: { tournamentId },
      relations: ['team', 'payment'],
      order: { registeredAt: 'ASC' },
    });
  }

  /**
   * Update registration status (e.g. PAYMENT_PENDING -> CONFIRMED / DISQUALIFIED)
   */
  async updateRegistrationStatus(
    tournamentId: string,
    registrationId: string,
    dto: UpdateRegistrationStatusDto,
  ): Promise<TournamentRegistration> {
    const reg = await this.registrationRepository.findOne({
      where: { id: registrationId, tournamentId },
      relations: ['team'],
    });

    if (!reg) {
      throw new NotFoundException(`Registration with ID ${registrationId} not found`);
    }

    reg.registrationStatus = dto.registrationStatus;
    return this.registrationRepository.save(reg);
  }

  /**
   * Remove team registration
   */
  async removeRegistration(
    tournamentId: string,
    registrationId: string,
  ): Promise<{ message: string }> {
    const reg = await this.registrationRepository.findOne({
      where: { id: registrationId, tournamentId },
    });

    if (!reg) {
      throw new NotFoundException(`Registration with ID ${registrationId} not found`);
    }

    await this.registrationRepository.delete(registrationId);
    return { message: `Registration ${registrationId} removed successfully` };
  }

  /**
   * Get confirmed participating teams for tournament
   */
  async getConfirmedTeams(tournamentId: string): Promise<Team[]> {
    const registrations = await this.registrationRepository.find({
      where: {
        tournamentId,
        registrationStatus: RegistrationStatus.CONFIRMED,
      },
      relations: ['team'],
    });

    return registrations.map((r) => r.team);
  }

  /**
   * Trigger bracket generation for tournament
   */
  async generateBrackets(tournamentId: string, dto: GenerateBracketsDto) {
    const confirmedTeams = await this.getConfirmedTeams(tournamentId);
    const confirmedTeamIds = confirmedTeams.map((t) => t.id);

    return this.bracketService.generateBrackets(tournamentId, dto, confirmedTeamIds);
  }

  /**
   * Retrieve bracket tree
   */
  async getBracketTree(tournamentId: string) {
    await this.findOne(tournamentId);
    return this.bracketService.getBracketTree(tournamentId);
  }

  /**
   * Advance bracket progression when a match finishes
   */
  async advanceProgression(tournamentId: string, dto: AdvanceProgressionDto) {
    await this.findOne(tournamentId);
    return this.bracketService.advanceProgression(tournamentId, dto);
  }

  /**
   * Schedule or reschedule an individual match
   */
  async scheduleMatch(tournamentId: string, dto: ScheduleMatchDto): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id: dto.matchId, tournamentId },
      relations: ['homeTeam', 'awayTeam', 'venue'],
    });

    if (!match) {
      throw new NotFoundException(`Match ${dto.matchId} not found in tournament ${tournamentId}`);
    }

    match.scheduledStartTime = new Date(dto.scheduledStartTime);
    if (dto.venueId) {
      const venue = await this.venueRepository.findOne({ where: { id: dto.venueId } });
      if (!venue) {
        throw new NotFoundException(`Venue ${dto.venueId} not found`);
      }
      match.venueId = dto.venueId;
    }

    return this.matchRepository.save(match);
  }

  /**
   * Bulk schedule multiple tournament matches
   */
  async bulkSchedule(
    tournamentId: string,
    dto: BulkScheduleMatchesDto,
  ): Promise<{ updatedCount: number }> {
    await this.findOne(tournamentId);

    let count = 0;
    for (const item of dto.schedules) {
      await this.scheduleMatch(tournamentId, item);
      count++;
    }

    return { updatedCount: count };
  }

  /**
   * Get all scheduled matches for tournament in chronological order
   */
  async getSchedules(tournamentId: string): Promise<Match[]> {
    await this.findOne(tournamentId);

    return this.matchRepository.find({
      where: { tournamentId },
      relations: ['homeTeam', 'awayTeam', 'venue', 'score'],
      order: { scheduledStartTime: 'ASC' },
    });
  }

  /**
   * Admin moderate tournament (Approve, Suspend, Cancel)
   */
  async adminModerate(
    tournamentId: string,
    dto: AdminModerateTournamentDto,
  ): Promise<Tournament> {
    const tournament = await this.findOne(tournamentId);

    switch (dto.action) {
      case 'APPROVE':
        tournament.tournamentStatus = TournamentStatus.OPEN_FOR_REGISTRATION;
        break;
      case 'SUSPEND':
        tournament.tournamentStatus = TournamentStatus.CANCELLED;
        break;
      case 'CANCEL':
        tournament.tournamentStatus = TournamentStatus.CANCELLED;
        break;
    }

    this.logger.log(
      `Tournament ${tournamentId} moderated by Admin ${dto.adminId}: Action=${dto.action}, Reason=${dto.reason || 'None'}`,
    );

    return this.tournamentRepository.save(tournament);
  }

  /**
   * Admin overview / tournament report statistics
   */
  async getAdminReports() {
    const totalTournaments = await this.tournamentRepository.count();

    const draftCount = await this.tournamentRepository.count({
      where: { tournamentStatus: TournamentStatus.DRAFT },
    });
    const openCount = await this.tournamentRepository.count({
      where: { tournamentStatus: TournamentStatus.OPEN_FOR_REGISTRATION },
    });
    const ongoingCount = await this.tournamentRepository.count({
      where: { tournamentStatus: TournamentStatus.ONGOING },
    });
    const completedCount = await this.tournamentRepository.count({
      where: { tournamentStatus: TournamentStatus.COMPLETED },
    });
    const cancelledCount = await this.tournamentRepository.count({
      where: { tournamentStatus: TournamentStatus.CANCELLED },
    });

    const totalRegistrations = await this.registrationRepository.count();
    const confirmedRegistrations = await this.registrationRepository.count({
      where: { registrationStatus: RegistrationStatus.CONFIRMED },
    });

    // Approximate total registration fees
    const revenueResult = await this.tournamentRepository
      .createQueryBuilder('t')
      .innerJoin('t.registrations', 'r', 'r.registration_status = :status', {
        status: RegistrationStatus.CONFIRMED,
      })
      .select('SUM(t.registration_fee)', 'totalRevenue')
      .getRawOne();

    const recentTournaments = await this.tournamentRepository.find({
      relations: ['organizer', 'venue'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalTournaments,
      byStatus: {
        draft: draftCount,
        openForRegistration: openCount,
        ongoing: ongoingCount,
        completed: completedCount,
        cancelled: cancelledCount,
      },
      registrations: {
        total: totalRegistrations,
        confirmed: confirmedRegistrations,
      },
      totalRevenueLkr: Number(revenueResult?.totalRevenue || 0),
      recentTournaments,
    };
  }
}

