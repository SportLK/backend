import { User } from './user.entity';
export declare enum RequestedRole {
    TEAM_MANAGER = "TEAM_MANAGER",
    TOURNAMENT_ORGANIZER = "TOURNAMENT_ORGANIZER"
}
export declare enum ApplicationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class RoleApplication {
    id: string;
    userId: string;
    user: User;
    requestedRole: RequestedRole;
    justificationNotes: string;
    supportingDocumentUrl: string;
    status: ApplicationStatus;
    reviewedByAdminId: string;
    adminFeedback: string;
    reviewedAt: Date;
    createdAt: Date;
}
