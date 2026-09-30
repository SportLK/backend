import { Team } from './team.entity';
import { User } from './user.entity';
export declare enum InvitationType {
    MANAGER_TO_PLAYER = "MANAGER_TO_PLAYER",
    PLAYER_REQUEST_TO_JOIN = "PLAYER_REQUEST_TO_JOIN"
}
export declare enum InvitationStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
export declare class TeamInvitation {
    id: string;
    teamId: string;
    team: Team;
    invitedUserId: string;
    invitedUser: User;
    inviteType: InvitationType;
    status: InvitationStatus;
    createdAt: Date;
}
