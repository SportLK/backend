import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Tournament } from './tournament.entity';
import { Team } from './team.entity';
import { Payment } from './payment.entity';

export enum RegistrationStatus {
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  CONFIRMED = 'CONFIRMED',
  DISQUALIFIED = 'DISQUALIFIED',
}

@Entity('tournament_registrations')
@Unique(['tournamentId', 'teamId'])
export class TournamentRegistration {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'tournament_id', type: 'bigint' })
  tournamentId: string;

  @ManyToOne(() => Tournament, (tournament) => tournament.registrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @Column({ name: 'team_id', type: 'bigint' })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.tournamentRegistrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'payment_id', type: 'bigint', nullable: true })
  paymentId: string;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({
    name: 'registration_status',
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PAYMENT_PENDING,
  })
  registrationStatus: RegistrationStatus;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt: Date;
}
