import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  MATCH_ALERT = 'MATCH_ALERT',
  SCORE_UPDATE = 'SCORE_UPDATE',
  CHALLENGE_RECEIVED = 'CHALLENGE_RECEIVED',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
  SYSTEM = 'SYSTEM',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'recipient_id', type: 'bigint' })
  recipientId: string;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ name: 'notification_title', length: 150 })
  notificationTitle: string;

  @Column({ name: 'notification_body', type: 'text' })
  notificationBody: string;

  @Column({
    name: 'notification_type',
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  notificationType: NotificationType;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
