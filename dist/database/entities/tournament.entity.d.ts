import { User } from './user.entity';
import { Venue } from './venue.entity';
import { SportType } from './user-sports-interest.entity';
import { TournamentRegistration } from './tournament-registration.entity';
import { TournamentBracket } from './tournament-bracket.entity';
import { Match } from './match.entity';
export declare enum TournamentFormat {
    KNOCKOUT_SINGLE = "KNOCKOUT_SINGLE",
    ROUND_ROBIN = "ROUND_ROBIN",
    GROUP_AND_KNOCKOUT = "GROUP_AND_KNOCKOUT"
}
export declare enum TournamentStatus {
    DRAFT = "DRAFT",
    OPEN_FOR_REGISTRATION = "OPEN_FOR_REGISTRATION",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Tournament {
    id: string;
    organizerId: string;
    organizer: User;
    venueId: string;
    venue: Venue;
    tournamentName: string;
    sportType: SportType;
    tournamentFormat: TournamentFormat;
    maxParticipatingTeams: number;
    registrationFee: number;
    startDate: string;
    endDate: string;
    tournamentStatus: TournamentStatus;
    createdAt: Date;
    registrations: TournamentRegistration[];
    brackets: TournamentBracket[];
    matches: Match[];
}
