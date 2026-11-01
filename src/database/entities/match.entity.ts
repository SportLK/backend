import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Tournament } from './tournament.entity';
import { Team } from './team.entity';
import { Venue } from './venue.entity';
import { MatchScore } from './match-score.entity';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
  POSTPONED = 'POSTPONED',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'tournament_id', type: 'bigint', nullable: true })
  tournamentId: string;

  @ManyToOne(() => Tournament, (t) => t.matches, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @Column({ name: 'home_team_id', type: 'bigint' })
  homeTeamId: string;

  @ManyToOne(() => Team, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'home_team_id' })
  homeTeam: Team;

  @Column({ name: 'away_team_id', type: 'bigint' })
  awayTeamId: string;

  @ManyToOne(() => Team, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'away_team_id' })
  awayTeam: Team;

  @Column({ name: 'venue_id', type: 'bigint', nullable: true })
  venueId: string;

  @ManyToOne(() => Venue, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ name: 'scheduled_start_time', type: 'datetime' })
  scheduledStartTime: Date;

  @Column({
    name: 'match_status',
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  matchStatus: MatchStatus;

  @Column({ name: 'winner_team_id', type: 'bigint', nullable: true })
  winnerTeamId: string;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'winner_team_id' })
  winnerTeam: Team;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => MatchScore, (score) => score.match)
  score: MatchScore;
}
