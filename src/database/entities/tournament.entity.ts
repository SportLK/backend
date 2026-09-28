import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Venue } from './venue.entity';
import { SportType } from './user-sports-interest.entity';
import { TournamentRegistration } from './tournament-registration.entity';
import { TournamentBracket } from './tournament-bracket.entity';
import { Match } from './match.entity';

export enum TournamentFormat {
  KNOCKOUT_SINGLE = 'KNOCKOUT_SINGLE',
  ROUND_ROBIN = 'ROUND_ROBIN',
  GROUP_AND_KNOCKOUT = 'GROUP_AND_KNOCKOUT',
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  OPEN_FOR_REGISTRATION = 'OPEN_FOR_REGISTRATION',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'organizer_id', type: 'bigint' })
  organizerId: string;

  @ManyToOne(() => User, (user) => user.organizedTournaments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column({ name: 'venue_id', type: 'bigint', nullable: true })
  venueId: string;

  @ManyToOne(() => Venue, (venue) => venue.tournaments, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ name: 'tournament_name', length: 150 })
  tournamentName: string;

  @Column({ type: 'enum', enum: SportType })
  sportType: SportType;

  @Column({
    name: 'tournament_format',
    type: 'enum',
    enum: TournamentFormat,
    default: TournamentFormat.KNOCKOUT_SINGLE,
  })
  tournamentFormat: TournamentFormat;

  @Column({ name: 'max_participating_teams', type: 'int', default: 16 })
  maxParticipatingTeams: number;

  @Column({
    name: 'registration_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  registrationFee: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({
    name: 'tournament_status',
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.DRAFT,
  })
  tournamentStatus: TournamentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => TournamentRegistration, (reg) => reg.tournament)
  registrations: TournamentRegistration[];

  @OneToMany(() => TournamentBracket, (bracket) => bracket.tournament)
  brackets: TournamentBracket[];

  @OneToMany(() => Match, (match) => match.tournament)
  matches: Match[];
}
