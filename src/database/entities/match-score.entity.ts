import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Match } from './match.entity';

@Entity('match_scores')
export class MatchScore {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'match_id', type: 'bigint', unique: true })
  matchId: string;

  @OneToOne(() => Match, (match) => match.score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'home_team_score_display', length: 100, nullable: true })
  homeTeamScoreDisplay: string;

  @Column({ name: 'away_team_score_display', length: 100, nullable: true })
  awayTeamScoreDisplay: string;

  // Real-time JSON scorecard payload (overs, balls, sets, goals, foul stats)
  @Column({ name: 'detailed_scorecard_json', type: 'json', nullable: true })
  detailedScorecardJson: Record<string, any>;

  @Column({ name: 'last_updated_by_user_id', type: 'bigint', nullable: true })
  lastUpdatedByUserId: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
