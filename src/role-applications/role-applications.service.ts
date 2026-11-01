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

    const pending = await this.applications.findOne({
      where: { userId, requestedRole, status: ApplicationStatus.PENDING },
    });
    if (pending) throw new ConflictException('An application for this role is already pending');

    const application = this.applications.create({
      userId,
      requestedRole,
      justificationNotes: `${dto.organization} | ${dto.experience}`,
      status: ApplicationStatus.PENDING,
    });

    return this.applications.save(application);
  }

  listMine(userId: string) {
    return this.applications.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  listPending() {
    return this.applications.createQueryBuilder('application')
      .leftJoin('users', 'applicant', 'applicant.id = application.user_id')
      .addSelect(['applicant.full_name', 'applicant.email'])
      .where('application.status = :status', { status: ApplicationStatus.PENDING })
      .orderBy('application.created_at', 'ASC')
      .getMany();
  }

  async review(id: string, reviewerId: string, dto: ReviewRoleApplicationDto) {
    return this.dataSource.transaction(async (manager) => {
      const applications = manager.getRepository(RoleApplication);
      const application = await applications.findOne({ where: { id } });
      if (!application) throw new NotFoundException('Application not found');
      if (application.status !== ApplicationStatus.PENDING) {
        throw new NotFoundException('This application has already been reviewed');
      }

      application.status = dto.status === 'approved' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;
      application.reviewedByAdminId = reviewerId;
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
      await this.notifications.create(
        application.userId,
        dto.status === 'approved' ? 'Application approved' : 'Application update',
        dto.status === 'approved'
          ? `Your ${roleName} application is approved. You can now switch to that workspace.`
          : dto.reviewNote ?? `Your ${roleName} application was not approved this time.`,
        'role_application',
      );
      return application;
    });
  }
}
