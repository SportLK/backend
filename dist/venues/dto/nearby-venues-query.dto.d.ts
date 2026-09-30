import { SportType } from '../../database/entities/user-sports-interest.entity';
export declare class NearbyVenuesQueryDto {
    latitude: number;
    longitude: number;
    radiusInKm?: number;
    sportType?: SportType;
    city?: string;
}
