import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('role_applications')
export class RoleApplication {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', length: 36 }) userId: string;
  @Column({ name: 'requested_role', length: 30 }) requestedRole: 'team_manager' | 'organizer';
  @Column({ length: 140 }) organization: string;
  @Column({ type: 'text' }) experience: string;
  @Column({ length: 20, default: 'pending' }) status: 'pending' | 'approved' | 'rejected';
  @Column({ name: 'reviewed_by_id', length: 36, nullable: true }) reviewedById: string | null;
  @Column({ name: 'review_note', type: 'text', nullable: true }) reviewNote: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
