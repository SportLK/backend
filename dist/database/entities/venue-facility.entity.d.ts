import { Venue } from './venue.entity';
import { SportType } from './user-sports-interest.entity';
export declare class VenueFacility {
    id: string;
    venueId: string;
    venue: Venue;
    sportType: SportType;
    courtOrPitchCount: number;
    hasFloodlights: boolean;
    hasParking: boolean;
    hasChangingRooms: boolean;
}
