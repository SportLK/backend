import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'reporter_id', length: 36 }) reporterId: string;
  @Column({ name: 'target_type', length: 20 }) targetType: 'user' | 'post' | 'community';
  @Column({ name: 'target_id', length: 36 }) targetId: string;
  @Column({ length: 500 }) reason: string;
  @Column({ length: 20, default: 'open' }) status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  @Column({ name: 'moderator_id', length: 36, nullable: true }) moderatorId: string | null;
  @Column({ name: 'moderator_note', type: 'text', nullable: true }) moderatorNote: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
