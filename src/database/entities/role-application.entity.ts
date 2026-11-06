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

  @Column({ name: 'requested_role', type: 'enum', enum: RequestedRole })
  requestedRole: RequestedRole;

  @Column({ name: 'justification_notes', type: 'text', nullable: true })
  justificationNotes: string | null;

  @Column({ name: 'supporting_document_url', type: 'text', nullable: true })
  supportingDocumentUrl: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ name: 'reviewed_by_admin_id', type: 'bigint', nullable: true })
  reviewedByAdminId: string | null;

  @Column({ name: 'admin_feedback', type: 'text', nullable: true })
  adminFeedback: string | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Compatibility getters/setters
  get organization(): string {
    return this.justificationNotes ?? '';
  }
  set organization(val: string) {
    if (!this.justificationNotes) this.justificationNotes = val;
    else this.justificationNotes = `${val} | ${this.justificationNotes}`;
  }

  get experience(): string {
    return this.justificationNotes ?? '';
  }
  set experience(val: string) {
    if (!this.justificationNotes) this.justificationNotes = val;
    else this.justificationNotes = `${this.justificationNotes} | ${val}`;
  }

  get reviewNote(): string | null {
    return this.adminFeedback;
  }
  set reviewNote(val: string | null) {
    this.adminFeedback = val;
  }

  get reviewedById(): string | null {
    return this.reviewedByAdminId;
  }
  set reviewedById(val: string | null) {
    this.reviewedByAdminId = val;
  }
}
