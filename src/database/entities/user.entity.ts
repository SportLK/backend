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

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl: string;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

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
