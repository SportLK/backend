import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum RequestedRole {
  TEAM_MANAGER = 'TEAM_MANAGER',
  TOURNAMENT_ORGANIZER = 'TOURNAMENT_ORGANIZER',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('role_applications')
export class RoleApplication {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => User, (user) => user.roleApplications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: RequestedRole })
  requestedRole: RequestedRole;

  @Column({ name: 'justification_notes', type: 'text', nullable: true })
  justificationNotes: string;

  @Column({ name: 'supporting_document_url', type: 'text', nullable: true })
  supportingDocumentUrl: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ name: 'reviewed_by_admin_id', type: 'bigint', nullable: true })
  reviewedByAdminId: string;

  @Column({ name: 'admin_feedback', type: 'text', nullable: true })
  adminFeedback: string;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
