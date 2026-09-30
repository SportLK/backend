import { VenueFacility } from './venue-facility.entity';
import { VenueBooking } from './venue-booking.entity';
import { Tournament } from './tournament.entity';
export declare class Venue {
    id: string;
    venueName: string;
    locationCoordinates: string;
    addressLine: string;
    city: string;
    district: string;
    province: string;
    contactPhone: string;
    hourlyBaseRate: number;
    isActive: boolean;
    createdAt: Date;
    facilities: VenueFacility[];
    bookings: VenueBooking[];
    tournaments: Tournament[];
}
