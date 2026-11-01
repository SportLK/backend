import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';

export enum TeamMemberRole {
  CAPTAIN = 'CAPTAIN',
  VICE_CAPTAIN = 'VICE_CAPTAIN',
  SQUAD_PLAYER = 'SQUAD_PLAYER',
}

@Entity('team_members')
@Unique(['teamId', 'userId'])
export class TeamMember {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'team_id', type: 'bigint' })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => User, (user) => user.teamMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'member_role',
    type: 'enum',
    enum: TeamMemberRole,
    default: TeamMemberRole.SQUAD_PLAYER,
  })
  memberRole: TeamMemberRole;

  @Column({ name: 'jersey_number', type: 'int', nullable: true })
  jerseyNumber: number;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
