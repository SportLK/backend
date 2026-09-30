import { Team } from './team.entity';
import { User } from './user.entity';
export declare enum TeamMemberRole {
    CAPTAIN = "CAPTAIN",
    VICE_CAPTAIN = "VICE_CAPTAIN",
    SQUAD_PLAYER = "SQUAD_PLAYER"
}
export declare class TeamMember {
    id: string;
    teamId: string;
    team: Team;
    userId: string;
    user: User;
    memberRole: TeamMemberRole;
    jerseyNumber: number;
    joinedAt: Date;
}
