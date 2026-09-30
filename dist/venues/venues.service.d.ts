import { Repository, DataSource } from 'typeorm';
import { Venue } from '../database/entities/venue.entity';
import { VenueFacility } from '../database/entities/venue-facility.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { NearbyVenuesQueryDto } from './dto/nearby-venues-query.dto';
export declare class VenuesService {
    private readonly venueRepository;
    private readonly facilityRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(venueRepository: Repository<Venue>, facilityRepository: Repository<VenueFacility>, dataSource: DataSource);
    create(createVenueDto: CreateVenueDto): Promise<any>;
    findAll(sportType?: string, city?: string): Promise<any[]>;
    findNearby(query: NearbyVenuesQueryDto): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateVenueDto: Partial<CreateVenueDto>): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
