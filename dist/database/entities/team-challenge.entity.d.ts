import { Team } from './team.entity';
import { SportType } from './user-sports-interest.entity';
export declare enum ChallengeStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    DECLINED = "DECLINED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class TeamChallenge {
    id: string;
    challengerTeamId: string;
    challengerTeam: Team;
    challengedTeamId: string;
    challengedTeam: Team;
    venueId: string;
    proposedMatchDate: Date;
    sportType: SportType;
    status: ChallengeStatus;
    createdAt: Date;
}
