import { UserSportsInterest } from './user-sports-interest.entity';
import { RoleApplication } from './role-application.entity';
import { Post } from './post.entity';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { Tournament } from './tournament.entity';
import { VenueBooking } from './venue-booking.entity';
import { Payment } from './payment.entity';
import { Notification } from './notification.entity';
export declare enum BaseRole {
    PLAYER = "PLAYER",
    ADMIN = "ADMIN"
}
export declare enum ActiveWorkspace {
    PLAYER = "PLAYER",
    TEAM_MANAGER = "TEAM_MANAGER",
    TOURNAMENT_ORGANIZER = "TOURNAMENT_ORGANIZER",
    ADMIN = "ADMIN"
}
export declare enum AccountStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    DEACTIVATED = "DEACTIVATED"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    phoneNumber: string;
    profileImageUrl: string;
    baseRole: BaseRole;
    isTeamManager: boolean;
    isTournamentOrganizer: boolean;
    activeWorkspace: ActiveWorkspace;
    accountStatus: AccountStatus;
    createdAt: Date;
    updatedAt: Date;
    sportsInterests: UserSportsInterest[];
    roleApplications: RoleApplication[];
    posts: Post[];
    managedTeams: Team[];
    teamMemberships: TeamMember[];
    organizedTournaments: Tournament[];
    venueBookings: VenueBooking[];
    payments: Payment[];
    notifications: Notification[];
}
