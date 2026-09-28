import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { SportType } from './user-sports-interest.entity';

export enum ChallengeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('team_challenges')
export class TeamChallenge {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'challenger_team_id', type: 'bigint' })
  challengerTeamId: string;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenger_team_id' })
  challengerTeam: Team;

  @Column({ name: 'challenged_team_id', type: 'bigint' })
  challengedTeamId: string;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenged_team_id' })
  challengedTeam: Team;

  @Column({ name: 'venue_id', type: 'bigint', nullable: true })
  venueId: string;

  @Column({ name: 'proposed_match_date', type: 'datetime' })
  proposedMatchDate: Date;

  @Column({ type: 'enum', enum: SportType })
  sportType: SportType;

  @Column({
    type: 'enum',
    enum: ChallengeStatus,
    default: ChallengeStatus.PENDING,
  })
  status: ChallengeStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
