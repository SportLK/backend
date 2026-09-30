import { User } from './user.entity';
import { TeamMember } from './team-member.entity';
import { TeamInvitation } from './team-invitation.entity';
import { SportType } from './user-sports-interest.entity';
import { TournamentRegistration } from './tournament-registration.entity';
export declare enum TeamStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare class Team {
    id: string;
    managerId: string;
    manager: User;
    teamName: string;
    sportType: SportType;
    logoUrl: string;
    teamBio: string;
    primaryLocationCity: string;
    status: TeamStatus;
    createdAt: Date;
    members: TeamMember[];
    invitations: TeamInvitation[];
    tournamentRegistrations: TournamentRegistration[];
}
