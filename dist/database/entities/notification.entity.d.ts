import { User } from './user.entity';
export declare enum NotificationType {
    MATCH_ALERT = "MATCH_ALERT",
    SCORE_UPDATE = "SCORE_UPDATE",
    CHALLENGE_RECEIVED = "CHALLENGE_RECEIVED",
    PAYMENT_RECEIPT = "PAYMENT_RECEIPT",
    SYSTEM = "SYSTEM"
}
export declare class Notification {
    id: string;
    recipientId: string;
    recipient: User;
    notificationTitle: string;
    notificationBody: string;
    notificationType: NotificationType;
    isRead: boolean;
    createdAt: Date;
}
