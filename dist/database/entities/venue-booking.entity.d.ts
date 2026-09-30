import { Venue } from './venue.entity';
import { User } from './user.entity';
import { Payment } from './payment.entity';
export declare enum BookingStatus {
    PENDING_PAYMENT = "PENDING_PAYMENT",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare class VenueBooking {
    id: string;
    venueId: string;
    venue: Venue;
    bookedByUserId: string;
    bookedByUser: User;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    bookingStatus: BookingStatus;
    paymentId: string;
    payment: Payment;
    createdAt: Date;
}
