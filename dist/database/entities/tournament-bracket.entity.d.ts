import { Tournament } from './tournament.entity';
import { Match } from './match.entity';
export declare class TournamentBracket {
    id: string;
    tournamentId: string;
    tournament: Tournament;
    roundNumber: number;
    matchSequenceInRound: number;
    matchId: string;
    match: Match;
    nextBracketId: string;
}
