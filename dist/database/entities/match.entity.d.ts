import { Tournament } from './tournament.entity';
import { Team } from './team.entity';
import { Venue } from './venue.entity';
import { MatchScore } from './match-score.entity';
export declare enum MatchStatus {
    SCHEDULED = "SCHEDULED",
    LIVE = "LIVE",
    COMPLETED = "COMPLETED",
    ABANDONED = "ABANDONED",
    POSTPONED = "POSTPONED"
}
export declare class Match {
    id: string;
    tournamentId: string;
    tournament: Tournament;
    homeTeamId: string;
    homeTeam: Team;
    awayTeamId: string;
    awayTeam: Team;
    venueId: string;
    venue: Venue;
    scheduledStartTime: Date;
    matchStatus: MatchStatus;
    winnerTeamId: string;
    winnerTeam: Team;
    createdAt: Date;
    score: MatchScore;
}
