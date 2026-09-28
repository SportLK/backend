import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TeamMember } from './team-member.entity';
import { TeamInvitation } from './team-invitation.entity';
import { SportType } from './user-sports-interest.entity';
import { TournamentRegistration } from './tournament-registration.entity';

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'manager_id', type: 'bigint' })
  managerId: string;

  @ManyToOne(() => User, (user) => user.managedTeams, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @Column({ name: 'team_name', unique: true, length: 100 })
  teamName: string;

  @Column({ type: 'enum', enum: SportType })
  sportType: SportType;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @Column({ name: 'team_bio', type: 'text', nullable: true })
  teamBio: string;

  @Column({ name: 'primary_location_city', length: 100, nullable: true })
  primaryLocationCity: string;

  @Column({
    type: 'enum',
    enum: TeamStatus,
    default: TeamStatus.ACTIVE,
  })
  status: TeamStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => TeamMember, (member) => member.team)
  members: TeamMember[];

  @OneToMany(() => TeamInvitation, (invitation) => invitation.team)
  invitations: TeamInvitation[];

  @OneToMany(() => TournamentRegistration, (reg) => reg.team)
  tournamentRegistrations: TournamentRegistration[];
}
