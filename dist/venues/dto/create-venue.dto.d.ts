import { CreateFacilityDto } from './create-facility.dto';
export declare class CreateVenueDto {
    venueName: string;
    addressLine: string;
    city: string;
    district?: string;
    province?: string;
    contactPhone?: string;
    latitude: number;
    longitude: number;
    hourlyBaseRate?: number;
    facilities?: CreateFacilityDto[];
}
