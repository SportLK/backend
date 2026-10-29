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

export enum TeamReportReason {
  MISLEADING_INFORMATION = 'MISLEADING_INFORMATION',
  ROSTER_ELIGIBILITY_DISPUTE = 'ROSTER_ELIGIBILITY_DISPUTE',
  UNSPORTSMANLIKE_CONDUCT = 'UNSPORTSMANLIKE_CONDUCT',
  INACTIVE_FORFEIT = 'INACTIVE_FORFEIT',
  HARASSMENT = 'HARASSMENT',
  OTHER = 'OTHER',
}

export enum TeamReportStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

@Entity('team_reports')
export class TeamReport {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'report_number', length: 50, unique: true })
  reportNumber: string;

  @Column({ name: 'team_id', type: 'bigint' })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'reporter_id', type: 'bigint' })
  reporterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({
    type: 'enum',
    enum: TeamReportReason,
    default: TeamReportReason.OTHER,
  })
  reason: TeamReportReason;

  @Column({ type: 'text' })
  details: string;

  @Column({ length: 50, default: 'MEDIUM' })
  severity: string;

  @Column({
    type: 'enum',
    enum: TeamReportStatus,
    default: TeamReportStatus.OPEN,
  })
  status: TeamReportStatus;

  @Column({ name: 'handled_by_admin_id', type: 'bigint', nullable: true })
  handledByAdminId: string;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
