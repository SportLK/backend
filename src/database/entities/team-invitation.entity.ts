import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';

export enum InvitationType {
  MANAGER_TO_PLAYER = 'MANAGER_TO_PLAYER',
  PLAYER_REQUEST_TO_JOIN = 'PLAYER_REQUEST_TO_JOIN',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('team_invitations')
export class TeamInvitation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'team_id', type: 'bigint' })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.invitations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'invited_user_id', type: 'bigint' })
  invitedUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_user_id' })
  invitedUser: User;

  @Column({
    name: 'invite_type',
    type: 'enum',
    enum: InvitationType,
  })
  inviteType: InvitationType;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
