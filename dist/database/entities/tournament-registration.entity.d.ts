import { Tournament } from './tournament.entity';
import { Team } from './team.entity';
import { Payment } from './payment.entity';
export declare enum RegistrationStatus {
    PAYMENT_PENDING = "PAYMENT_PENDING",
    CONFIRMED = "CONFIRMED",
    DISQUALIFIED = "DISQUALIFIED"
}
export declare class TournamentRegistration {
    id: string;
    tournamentId: string;
    tournament: Tournament;
    teamId: string;
    team: Team;
    paymentId: string;
    payment: Payment;
    registrationStatus: RegistrationStatus;
    registeredAt: Date;
}
