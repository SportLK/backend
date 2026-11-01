import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venue } from './venue.entity';
import { User } from './user.entity';
import { Payment } from './payment.entity';

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity('venue_bookings')
export class VenueBooking {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'venue_id', type: 'bigint' })
  venueId: string;

  @ManyToOne(() => Venue, (venue) => venue.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ name: 'booked_by_user_id', type: 'bigint' })
  bookedByUserId: string;

  @ManyToOne(() => User, (user) => user.venueBookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booked_by_user_id' })
  bookedByUser: User;

  @Column({ name: 'booking_date', type: 'date' })
  bookingDate: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalPrice: number;

  @Column({
    name: 'booking_status',
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING_PAYMENT,
  })
  bookingStatus: BookingStatus;

  @Column({ name: 'payment_id', type: 'bigint', nullable: true })
  paymentId: string;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
