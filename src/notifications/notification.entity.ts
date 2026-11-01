import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', length: 36 }) userId: string;
  @Column({ length: 100 }) title: string;
  @Column({ type: 'text' }) body: string;
  @Column({ length: 40, default: 'general' }) kind: string;
  @Column({ name: 'read_at', type: 'datetime', nullable: true }) readAt: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
