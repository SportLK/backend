import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tournament } from './tournament.entity';
import { User } from './user.entity';

export enum TournamentReportReason {
  RULES_VIOLATION = 'RULES_VIOLATION',
  ORGANIZER_MISCONDUCT = 'ORGANIZER_MISCONDUCT',
  SCHEDULE_FRAUD = 'SCHEDULE_FRAUD',
  PRIZE_DISPUTE = 'PRIZE_DISPUTE',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  OTHER = 'OTHER',
}

export enum TournamentReportStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

@Entity('tournament_reports')
export class TournamentReport {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'report_number', length: 50, unique: true })
  reportNumber: string;

  @Column({ name: 'tournament_id', type: 'bigint' })
  tournamentId: string;

  @ManyToOne(() => Tournament, (tournament) => tournament.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @Column({ name: 'reporter_id', type: 'bigint' })
  reporterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({
    type: 'enum',
    enum: TournamentReportReason,
    default: TournamentReportReason.OTHER,
  })
  reason: TournamentReportReason;

  @Column({ type: 'text' })
  details: string;

  @Column({ length: 50, default: 'MEDIUM' })
  severity: string;

  @Column({
    type: 'enum',
    enum: TournamentReportStatus,
    default: TournamentReportStatus.OPEN,
  })
  status: TournamentReportStatus;

  @Column({ name: 'handled_by_admin_id', type: 'bigint', nullable: true })
  handledByAdminId: string | null;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

