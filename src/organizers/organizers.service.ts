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
  RoleApplication,
  RequestedRole,
  ApplicationStatus,
} from '../database/entities/role-application.entity';
import { User, ActiveWorkspace } from '../database/entities/user.entity';
import { Tournament } from '../database/entities/tournament.entity';
import { ApplyOrganizerDto } from './dto/apply-organizer.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { OrganizerApplicationQueryDto } from './dto/organizer-application-query.dto';

@Injectable()
export class OrganizersService {
  private readonly logger = new Logger(OrganizersService.name);

  constructor(
    @InjectRepository(RoleApplication)
    private readonly applicationRepository: Repository<RoleApplication>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
  ) {}

  /**
   * Submit an application to become a Tournament Organizer
   */
  async apply(dto: ApplyOrganizerDto): Promise<RoleApplication> {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    if (user.isTournamentOrganizer) {
      throw new BadRequestException('User is already an approved Tournament Organizer');
    }

    // Check for an existing pending application
    const existingPending = await this.applicationRepository.findOne({
      where: {
        userId: dto.userId,
        requestedRole: RequestedRole.TOURNAMENT_ORGANIZER,
        status: ApplicationStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new ConflictException(
        'You already have a pending Tournament Organizer application under review',
      );
    }

    const application = this.applicationRepository.create({
      userId: dto.userId,
      requestedRole: RequestedRole.TOURNAMENT_ORGANIZER,
      justificationNotes: dto.justificationNotes,
      supportingDocumentUrl: dto.supportingDocumentUrl || null,
      status: ApplicationStatus.PENDING,
    });

    return this.applicationRepository.save(application);
  }

  /**
   * Get all organizer applications with optional status / user filters
   */
  async findAllApplications(query: OrganizerApplicationQueryDto): Promise<RoleApplication[]> {
    const qb = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.user', 'user')
      .where('app.requestedRole = :role', { role: RequestedRole.TOURNAMENT_ORGANIZER });

    if (query.status) {
      qb.andWhere('app.status = :status', { status: query.status });
    }

    if (query.userId) {
      qb.andWhere('app.userId = :userId', { userId: query.userId });
    }

    qb.orderBy('app.createdAt', 'DESC');
    return qb.getMany();
  }

  /**
   * Get a single organizer application by ID
   */
  async findApplicationById(id: string): Promise<RoleApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!application) {
      throw new NotFoundException(`Organizer application with ID ${id} not found`);
    }

    return application;
  }

  /**
   * Admin approves or rejects an organizer application
   */
  async reviewApplication(
    id: string,
    dto: ReviewApplicationDto,
  ): Promise<RoleApplication> {
    const application = await this.findApplicationById(id);

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        `Application has already been resolved with status: ${application.status}`,
      );
    }

    // Verify reviewer admin
    const admin = await this.userRepository.findOne({ where: { id: dto.reviewedByAdminId } });
    if (!admin) {
      throw new NotFoundException(`Admin user with ID ${dto.reviewedByAdminId} not found`);
    }

    application.status = dto.status;
    application.reviewedByAdminId = dto.reviewedByAdminId;
    application.adminFeedback = dto.adminFeedback || null;
    application.reviewedAt = new Date();

    const savedApp = await this.applicationRepository.save(application);

    // If approved, elevate user permissions to TOURNAMENT_ORGANIZER
    if (dto.status === ApplicationStatus.APPROVED) {
      await this.userRepository.update(application.userId, {
        isTournamentOrganizer: true,
        activeWorkspace: ActiveWorkspace.TOURNAMENT_ORGANIZER,
      });
      this.logger.log(
        `User ${application.userId} promoted to TOURNAMENT_ORGANIZER by Admin ${dto.reviewedByAdminId}`,
      );
    }

    return savedApp;
  }

  /**
   * Check organizer eligibility and application status for a given user
   */
  async checkOrganizerStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const latestApplication = await this.applicationRepository.findOne({
      where: {
        userId,
        requestedRole: RequestedRole.TOURNAMENT_ORGANIZER,
      },
      order: { createdAt: 'DESC' },
    });

    return {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      isTournamentOrganizer: user.isTournamentOrganizer,
      activeWorkspace: user.activeWorkspace,
      latestApplication: latestApplication || null,
    };
  }

  /**
   * List all approved tournament organizers
   */
  async findAllOrganizers(): Promise<User[]> {
    return this.userRepository.find({
      where: { isTournamentOrganizer: true },
      select: [
        'id',
        'fullName',
        'email',
        'phoneNumber',
        'profileImageUrl',
        'activeWorkspace',
        'accountStatus',
        'createdAt',
      ],
      order: { fullName: 'ASC' },
    });
  }

  /**
   * Get all tournaments created by a specific organizer
   */
  async findOrganizerTournaments(organizerId: string): Promise<Tournament[]> {
    const user = await this.userRepository.findOne({ where: { id: organizerId } });
    if (!user) {
      throw new NotFoundException(`Organizer with ID ${organizerId} not found`);
    }

    return this.tournamentRepository.find({
      where: { organizerId },
      relations: ['venue', 'registrations'],
      order: { startDate: 'DESC' },
    });
  }
}

