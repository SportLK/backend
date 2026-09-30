import { Match } from './match.entity';
export declare class MatchScore {
    id: string;
    matchId: string;
    match: Match;
    homeTeamScoreDisplay: string;
    awayTeamScoreDisplay: string;
    detailedScorecardJson: Record<string, any>;
    lastUpdatedByUserId: string;
    updatedAt: Date;
}
