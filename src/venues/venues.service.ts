import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venue } from '../database/entities/venue.entity';
import { VenueFacility } from '../database/entities/venue-facility.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { NearbyVenuesQueryDto } from './dto/nearby-venues-query.dto';

@Injectable()
export class VenuesService {
  private readonly logger = new Logger(VenuesService.name);

  constructor(
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
    @InjectRepository(VenueFacility)
    private readonly facilityRepository: Repository<VenueFacility>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new venue with spatial coordinates and facilities
   */
  async create(createVenueDto: CreateVenueDto): Promise<any> {
    const {
      venueName,
      addressLine,
      city,
      district,
      province,
      contactPhone,
      latitude,
      longitude,
      hourlyBaseRate,
      facilities,
    } = createVenueDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Insert Venue using MySQL POINT(longitude, latitude) with SRID 4326
      const insertResult = await queryRunner.query(
        `INSERT INTO venues (
          venue_name,
          location_coordinates,
          address_line,
          city,
          district,
          province,
          contact_phone,
          hourly_base_rate,
          is_active
        ) VALUES (
          ?,
          ST_SRID(POINT(?, ?), 4326),
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          1
        )`,
        [
          venueName,
          longitude,
          latitude,
          addressLine,
          city,
          district || null,
          province || null,
          contactPhone || null,
          hourlyBaseRate || 0.0,
        ],
      );

      const venueId = insertResult.insertId;

      // 2. Insert Facilities if provided
      if (facilities && facilities.length > 0) {
        for (const fac of facilities) {
          await queryRunner.query(
            `INSERT INTO venue_facilities (
              venue_id,
              sport_type,
              court_or_pitch_count,
              has_floodlights,
              has_parking,
              has_changing_rooms
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              venueId,
              fac.sportType,
              fac.courtOrPitchCount || 1,
              fac.hasFloodlights ? 1 : 0,
              fac.hasParking ? 1 : 0,
              fac.hasChangingRooms ? 1 : 0,
            ],
          );
        }
      }

      await queryRunner.commitTransaction();

      return this.findOne(venueId.toString());
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create venue: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create sports venue');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find all active venues (for Organizers selecting venue or Admin catalog)
   */
  async findAll(sportType?: string, city?: string): Promise<any[]> {
    const rawVenues = await this.dataSource.query(
      `SELECT 
        v.id,
        v.venue_name as venueName,
        v.address_line as addressLine,
        v.city,
        v.district,
        v.province,
        v.contact_phone as contactPhone,
        v.hourly_base_rate as hourlyBaseRate,
        v.is_active as isActive,
        v.created_at as createdAt,
        ST_X(v.location_coordinates) as longitude,
        ST_Y(v.location_coordinates) as latitude
      FROM venues v
      WHERE v.is_active = 1
      ${city ? 'AND v.city = ?' : ''}
      ORDER BY v.venue_name ASC`,
      city ? [city] : [],
    );

    // Fetch facilities for each venue
    const venueIds = rawVenues.map((v) => v.id);
    let facilitiesByVenue: Record<string, VenueFacility[]> = {};

    if (venueIds.length > 0) {
      const allFacilities = await this.facilityRepository
        .createQueryBuilder('f')
        .where('f.venue_id IN (:...ids)', { ids: venueIds })
        .getMany();

      facilitiesByVenue = allFacilities.reduce((acc, fac) => {
        acc[fac.venueId] = acc[fac.venueId] || [];
        acc[fac.venueId].push(fac);
        return acc;
      }, {} as Record<string, VenueFacility[]>);
    }

    let results = rawVenues.map((v) => ({
      ...v,
      hourlyBaseRate: Number(v.hourlyBaseRate),
      latitude: Number(v.latitude),
      longitude: Number(v.longitude),
      facilities: facilitiesByVenue[v.id] || [],
    }));

    // Filter by sportType if requested
    if (sportType) {
      results = results.filter((v) =>
        v.facilities.some((f) => f.sportType === sportType),
      );
    }

    return results;
  }

  /**
   * Geospatial Nearby Search using MySQL ST_Distance_Sphere
   * Finds venues within radius (km) sorted from closest to farthest
   */
  async findNearby(query: NearbyVenuesQueryDto): Promise<any[]> {
    const { latitude, longitude, radiusInKm = 15, sportType, city } = query;
    const radiusInMeters = radiusInKm * 1000;

    // MySQL Spatial query using ST_Distance_Sphere(POINT1, POINT2)
    const sql = `
      SELECT 
        v.id,
        v.venue_name as venueName,
        v.address_line as addressLine,
        v.city,
        v.district,
        v.province,
        v.contact_phone as contactPhone,
        v.hourly_base_rate as hourlyBaseRate,
        v.is_active as isActive,
        ST_X(v.location_coordinates) as longitude,
        ST_Y(v.location_coordinates) as latitude,
        ROUND(ST_Distance_Sphere(v.location_coordinates, ST_SRID(POINT(?, ?), 4326))) AS distanceMeters
      FROM venues v
      WHERE v.is_active = 1
        ${city ? 'AND v.city = ?' : ''}
        AND ST_Distance_Sphere(v.location_coordinates, ST_SRID(POINT(?, ?), 4326)) <= ?
      ORDER BY distanceMeters ASC
    `;

    const params: any[] = [longitude, latitude];
    if (city) params.push(city);
    params.push(longitude, latitude, radiusInMeters);

    const rawVenues = await this.dataSource.query(sql, params);

    if (!rawVenues || rawVenues.length === 0) {
      return [];
    }

    // Attach facilities
    const venueIds = rawVenues.map((v) => v.id);
    const facilities = await this.facilityRepository
      .createQueryBuilder('f')
      .where('f.venue_id IN (:...ids)', { ids: venueIds })
      .getMany();

    const facilityMap = facilities.reduce((acc, fac) => {
      acc[fac.venueId] = acc[fac.venueId] || [];
      acc[fac.venueId].push(fac);
      return acc;
    }, {} as Record<string, VenueFacility[]>);

    let mapped = rawVenues.map((v) => ({
      ...v,
      hourlyBaseRate: Number(v.hourlyBaseRate),
      latitude: Number(v.latitude),
      longitude: Number(v.longitude),
      distanceMeters: Number(v.distanceMeters),
      distanceKm: Number((Number(v.distanceMeters) / 1000).toFixed(2)),
      facilities: facilityMap[v.id] || [],
    }));

    if (sportType) {
      mapped = mapped.filter((v) =>
        v.facilities.some((f) => f.sportType === sportType),
      );
    }

    return mapped;
  }

  /**
   * Find single venue by ID with facilities
   */
  async findOne(id: string): Promise<any> {
    const rawVenue = await this.dataSource.query(
      `SELECT 
        v.id,
        v.venue_name as venueName,
        v.address_line as addressLine,
        v.city,
        v.district,
        v.province,
        v.contact_phone as contactPhone,
        v.hourly_base_rate as hourlyBaseRate,
        v.is_active as isActive,
        v.created_at as createdAt,
        ST_X(v.location_coordinates) as longitude,
        ST_Y(v.location_coordinates) as latitude
      FROM venues v
      WHERE v.id = ?`,
      [id],
    );

    if (!rawVenue || rawVenue.length === 0) {
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    const venue = rawVenue[0];
    const facilities = await this.facilityRepository.find({
      where: { venueId: id },
    });

    return {
      ...venue,
      hourlyBaseRate: Number(venue.hourlyBaseRate),
      latitude: Number(venue.latitude),
      longitude: Number(venue.longitude),
      facilities,
    };
  }

  /**
   * Update venue details
   */
  async update(id: string, updateVenueDto: Partial<CreateVenueDto>): Promise<any> {
    await this.findOne(id); // Ensure exists

    const {
      venueName,
      addressLine,
      city,
      district,
      province,
      contactPhone,
      latitude,
      longitude,
      hourlyBaseRate,
    } = updateVenueDto;

    const updates: string[] = [];
    const params: any[] = [];

    if (venueName) { updates.push('venue_name = ?'); params.push(venueName); }
    if (addressLine) { updates.push('address_line = ?'); params.push(addressLine); }
    if (city) { updates.push('city = ?'); params.push(city); }
    if (district !== undefined) { updates.push('district = ?'); params.push(district); }
    if (province !== undefined) { updates.push('province = ?'); params.push(province); }
    if (contactPhone !== undefined) { updates.push('contact_phone = ?'); params.push(contactPhone); }
    if (hourlyBaseRate !== undefined) { updates.push('hourly_base_rate = ?'); params.push(hourlyBaseRate); }

    if (latitude !== undefined && longitude !== undefined) {
      updates.push('location_coordinates = ST_SRID(POINT(?, ?), 4326)');
      params.push(longitude, latitude);
    }

    if (updates.length > 0) {
      params.push(id);
      await this.dataSource.query(
        `UPDATE venues SET ${updates.join(', ')} WHERE id = ?`,
        params,
      );
    }

    return this.findOne(id);
  }

  /**
   * Soft-delete venue (deactivate)
   */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.dataSource.query('UPDATE venues SET is_active = 0 WHERE id = ?', [id]);
    return { message: `Venue ${id} deactivated successfully` };
  }
}
