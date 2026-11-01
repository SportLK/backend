import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSportsInterest } from './user-sports-interest.entity';
import { RoleApplication } from './role-application.entity';
import { Post } from './post.entity';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { Tournament } from './tournament.entity';
import { VenueBooking } from './venue-booking.entity';
import { Payment } from './payment.entity';
import { Notification } from './notification.entity';
import { SportLKRole } from '../../common/auth.types';

export enum BaseRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
}

export enum ActiveWorkspace {
  PLAYER = 'PLAYER',
  TEAM_MANAGER = 'TEAM_MANAGER',
  TOURNAMENT_ORGANIZER = 'TOURNAMENT_ORGANIZER',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl: string | null;

  @Column({
    name: 'base_role',
    type: 'enum',
    enum: BaseRole,
    default: BaseRole.PLAYER,
  })
  baseRole: BaseRole;

  @Column({ name: 'is_team_manager', type: 'boolean', default: false })
  isTeamManager: boolean;

  @Column({ name: 'is_tournament_organizer', type: 'boolean', default: false })
  isTournamentOrganizer: boolean;

  @Column({
    name: 'active_workspace',
    type: 'enum',
    enum: ActiveWorkspace,
    default: ActiveWorkspace.PLAYER,
  })
  activeWorkspace: ActiveWorkspace;

  @Column({
    name: 'account_status',
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  accountStatus: AccountStatus;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 64, nullable: true, select: false })
  refreshTokenHash: string | null;

  @Column({ type: 'simple-json', nullable: true })
  sports: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial?: Partial<User>) {
    if (partial) {
      Object.assign(this, partial);
      if ((partial as any).displayName && !this.fullName) {
        this.fullName = (partial as any).displayName;
      }
    }
  }

  // Compatibility getters/setters for frontend and legacy services
  get displayName(): string {
    return this.fullName;
  }

  set displayName(val: string) {
    this.fullName = val;
  }

  get status(): 'active' | 'suspended' | 'disabled' {
    if (this.accountStatus === AccountStatus.SUSPENDED) return 'suspended';
    if (this.accountStatus === AccountStatus.DEACTIVATED) return 'disabled';
    return 'active';
  }

  set status(val: 'active' | 'suspended' | 'disabled') {
    if (val === 'suspended') this.accountStatus = AccountStatus.SUSPENDED;
    else if (val === 'disabled') this.accountStatus = AccountStatus.DEACTIVATED;
    else this.accountStatus = AccountStatus.ACTIVE;
  }

  get roles(): SportLKRole[] {
    const list: SportLKRole[] = ['player'];
    if (this.baseRole === BaseRole.ADMIN) list.push('admin');
    if (this.isTeamManager) list.push('team_manager');
    if (this.isTournamentOrganizer) list.push('organizer');
    return list;
  }

  set roles(val: SportLKRole[]) {
    if (Array.isArray(val)) {
      if (val.includes('admin')) this.baseRole = BaseRole.ADMIN;
      this.isTeamManager = val.includes('team_manager');
      this.isTournamentOrganizer = val.includes('organizer');
    }
  }

  @OneToMany(() => UserSportsInterest, (interest) => interest.user)
  sportsInterests: UserSportsInterest[];

  @OneToMany(() => RoleApplication, (app) => app.user)
  roleApplications: RoleApplication[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Team, (team) => team.manager)
  managedTeams: Team[];

  @OneToMany(() => TeamMember, (member) => member.user)
  teamMemberships: TeamMember[];

  @OneToMany(() => Tournament, (tournament) => tournament.organizer)
  organizedTournaments: Tournament[];

  @OneToMany(() => VenueBooking, (booking) => booking.bookedByUser)
  venueBookings: VenueBooking[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Notification, (notif) => notif.recipient)
  notifications: Notification[];
}
