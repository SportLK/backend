import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { NearbyVenuesQueryDto } from './dto/nearby-venues-query.dto';
export declare class VenuesController {
    private readonly venuesService;
    constructor(venuesService: VenuesService);
    create(createVenueDto: CreateVenueDto): Promise<any>;
    findNearby(query: NearbyVenuesQueryDto): Promise<any[]>;
    findAll(sportType?: string, city?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateVenueDto: Partial<CreateVenueDto>): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
