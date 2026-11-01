import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tournament } from './tournament.entity';
import { Match } from './match.entity';

@Entity('tournament_brackets')
export class TournamentBracket {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'tournament_id', type: 'bigint' })
  tournamentId: string;

  @ManyToOne(() => Tournament, (t) => t.brackets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournament_id' })
  tournament: Tournament;

  @Column({ name: 'round_number', type: 'int' })
  roundNumber: number;

  @Column({ name: 'match_sequence_in_round', type: 'int' })
  matchSequenceInRound: number;

  @Column({ name: 'match_id', type: 'bigint', nullable: true })
  matchId: string;

  @ManyToOne(() => Match, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'next_bracket_id', type: 'bigint', nullable: true })
  nextBracketId: string;
}
