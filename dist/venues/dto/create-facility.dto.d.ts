import { SportType } from '../../database/entities/user-sports-interest.entity';
export declare class CreateFacilityDto {
    sportType: SportType;
    courtOrPitchCount?: number;
    hasFloodlights?: boolean;
    hasParking?: boolean;
    hasChangingRooms?: boolean;
}
