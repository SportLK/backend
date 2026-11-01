import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountStatus, SportLKRole } from '../common/auth.types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true, length: 255 }) email: string;
  @Column({ name: 'password_hash', length: 255, select: false }) passwordHash: string;
  @Column({ name: 'display_name', length: 100 }) displayName: string;
  @Column({ type: 'text', nullable: true }) bio: string | null;
  @Column({ length: 100, nullable: true }) city: string | null;
  @Column({ type: 'simple-json' }) sports: string[];
  @Column({ type: 'simple-json' }) roles: SportLKRole[];
  @Column({ length: 20, default: 'active' }) status: AccountStatus;
  @Column({ name: 'refresh_token_hash', length: 64, nullable: true, select: false })
  refreshTokenHash: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
