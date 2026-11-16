import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateRoleApplicationDto, ReviewRoleApplicationDto } from './role-application.dto';
import { RoleApplication, RequestedRole, ApplicationStatus } from './role-application.entity';

@Injectable()
export class RoleApplicationsService {
  constructor(
    @InjectRepository(RoleApplication) private readonly applications: Repository<RoleApplication>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly notifications: NotificationsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateRoleApplicationDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (user?.roles.includes(dto.requestedRole)) {
      throw new ConflictException('You already have this workspace role');
    }

    const requestedRole = dto.requestedRole === 'organizer'
      ? RequestedRole.TOURNAMENT_ORGANIZER
      : RequestedRole.TEAM_MANAGER;

    let assignedOrganizerId: string | null = null;
    let organization = dto.organization?.trim() ?? '';
    if (requestedRole === RequestedRole.TEAM_MANAGER) {
      assignedOrganizerId = dto.organizerId!;
      const organizer = await this.users.findOne({ where: { id: assignedOrganizerId, isTournamentOrganizer: true } });
      if (!organizer) throw new NotFoundException('The selected organizer is no longer available');
      const approvedApplication = await this.applications.findOne({
        where: { userId: assignedOrganizerId, requestedRole: RequestedRole.TOURNAMENT_ORGANIZER, status: ApplicationStatus.APPROVED },
        order: { createdAt: 'DESC' },
      });
      organization = (approvedApplication?.justificationNotes ?? organizer.displayName ?? organizer.fullName).split(' | ')[0];
    }

    const pending = await this.applications.findOne({
      where: { userId, requestedRole, status: ApplicationStatus.PENDING },
    });
    if (pending) throw new ConflictException('An application for this role is already pending');

    const application = this.applications.create({
      userId,
      requestedRole,
      assignedOrganizerId,
      justificationNotes: `${organization} | ${dto.experience.trim()}`,
      status: ApplicationStatus.PENDING,
    });

    return this.applications.save(application);
  }

  listMine(userId: string) {
    return this.applications.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async listApprovedOrganizers() {
    const rows = await this.applications.find({
      where: { requestedRole: RequestedRole.TOURNAMENT_ORGANIZER, status: ApplicationStatus.APPROVED },
      order: { reviewedAt: 'DESC', createdAt: 'DESC' },
    });
    const organizationByUser = new Map<string, string>();
    for (const application of rows) {
      if (organizationByUser.has(application.userId)) continue;
      const [organization = ''] = (application.justificationNotes ?? '').split(' | ');
      organizationByUser.set(application.userId, organization);
    }
    const organizers = await this.users.find({ where: { isTournamentOrganizer: true }, order: { fullName: 'ASC' } });
    return organizers.map((organizer) => ({
      id: organizer.id,
      organization: organizationByUser.get(organizer.id) || organizer.displayName || organizer.fullName,
      name: organizer.displayName || organizer.fullName,
    }));
  }

  async listPending() {
    return this.listAll(ApplicationStatus.PENDING);
  }

  async listPendingTeamManagers(organizerId: string) {
    return this.listAll(ApplicationStatus.PENDING, RequestedRole.TEAM_MANAGER, organizerId);
  }

  async listAll(status?: ApplicationStatus, requestedRole?: RequestedRole, organizerId?: string) {
    const query = this.applications.createQueryBuilder('application')
      .leftJoinAndSelect('application.user', 'applicant')
      .orderBy('application.created_at', 'DESC');
    if (status) query.where('application.status = :status', { status });
    if (requestedRole) query.andWhere('application.requested_role = :requestedRole', { requestedRole });
    if (organizerId) query.andWhere('application.assigned_organizer_id = :organizerId', { organizerId });
    const rows = await query.getMany();
    return rows.map((application) => {
      const [organization = '', ...experience] = (application.justificationNotes ?? '').split(' | ');
      return {
        ...application,
        organization,
        experience: experience.join(' | '),
        user: application.user ? {
          id: application.user.id,
          fullName: application.user.fullName,
          displayName: application.user.displayName,
          email: application.user.email,
          city: application.user.city,
        } : undefined,
      };
    });
  }

  async review(id: string, reviewerId: string, dto: ReviewRoleApplicationDto, reviewerRole: 'admin' | 'organizer' = 'admin') {
    const { application, roleName } = await this.dataSource.transaction(async (manager) => {
      const applications = manager.getRepository(RoleApplication);
      const application = await applications.findOne({ where: { id } });
      if (!application) throw new NotFoundException('Application not found');
      if (reviewerRole === 'organizer' && application.requestedRole !== RequestedRole.TEAM_MANAGER) {
        throw new NotFoundException('Team manager application not found');
      }
      if (reviewerRole === 'organizer' && application.assignedOrganizerId !== reviewerId) {
        throw new NotFoundException('This application belongs to another organizer');
      }
      if (application.status !== ApplicationStatus.PENDING) {
        throw new NotFoundException('This application has already been reviewed');
      }

      application.status = dto.status === 'approved' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;
      if (reviewerRole === 'organizer') application.reviewedByOrganizerId = reviewerId;
      else application.reviewedByAdminId = reviewerId;
      application.adminFeedback = dto.reviewNote ?? null;
      application.reviewedAt = new Date();
      await applications.save(application);

      if (dto.status === 'approved') {
        const user = await manager.getRepository(User).findOne({ where: { id: application.userId } });
        if (user) {
          if (application.requestedRole === RequestedRole.TEAM_MANAGER) {
            user.isTeamManager = true;
          } else if (application.requestedRole === RequestedRole.TOURNAMENT_ORGANIZER) {
            user.isTournamentOrganizer = true;
          }
          await manager.getRepository(User).save(user);
        }
      }

      const roleName = application.requestedRole === RequestedRole.TEAM_MANAGER ? 'Team Manager' : 'Tournament Organizer';
      return { application, roleName };
    });
    // A notification failure must not roll back a completed approval/rejection.
    await this.notifications.create(
      application.userId,
      dto.status === 'approved' ? 'Application approved' : 'Application update',
      dto.status === 'approved'
        ? `Your ${roleName} application is approved. You can now switch to that workspace.`
        : dto.reviewNote ?? `Your ${roleName} application was not approved this time.`,
      'role_application',
    ).catch(() => undefined);
    return application;
  }
}
