import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum PaymentPurpose {
  TOURNAMENT_REGISTRATION = 'TOURNAMENT_REGISTRATION',
  VENUE_BOOKING = 'VENUE_BOOKING',
}

export enum PaymentStatus {
  INITIATED = 'INITIATED',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  CHARGEDBACK = 'CHARGEDBACK',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'payhere_order_id', unique: true, length: 100 })
  payhereOrderId: string;

  @Column({ name: 'payhere_payment_id', length: 100, nullable: true })
  payherePaymentId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({ length: 10, default: 'LKR' })
  currency: string;

  @Column({
    name: 'payment_purpose',
    type: 'enum',
    enum: PaymentPurpose,
  })
  paymentPurpose: PaymentPurpose;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.INITIATED,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'md5_verification_signature', length: 255, nullable: true })
  md5VerificationSignature: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
