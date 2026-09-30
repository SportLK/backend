import { User } from './user.entity';
export declare enum PaymentPurpose {
    TOURNAMENT_REGISTRATION = "TOURNAMENT_REGISTRATION",
    VENUE_BOOKING = "VENUE_BOOKING"
}
export declare enum PaymentStatus {
    INITIATED = "INITIATED",
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED",
    CHARGEDBACK = "CHARGEDBACK"
}
export declare class Payment {
    id: string;
    userId: string;
    user: User;
    payhereOrderId: string;
    payherePaymentId: string;
    amount: number;
    currency: string;
    paymentPurpose: PaymentPurpose;
    paymentStatus: PaymentStatus;
    md5VerificationSignature: string;
    createdAt: Date;
}
