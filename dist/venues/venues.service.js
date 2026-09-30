"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VenuesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenuesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const venue_entity_1 = require("../database/entities/venue.entity");
const venue_facility_entity_1 = require("../database/entities/venue-facility.entity");
let VenuesService = VenuesService_1 = class VenuesService {
    constructor(venueRepository, facilityRepository, dataSource) {
        this.venueRepository = venueRepository;
        this.facilityRepository = facilityRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(VenuesService_1.name);
    }
    async create(createVenueDto) {
        const { venueName, addressLine, city, district, province, contactPhone, latitude, longitude, hourlyBaseRate, facilities, } = createVenueDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const insertResult = await queryRunner.query(`INSERT INTO venues (
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
        )`, [
                venueName,
                longitude,
                latitude,
                addressLine,
                city,
                district || null,
                province || null,
                contactPhone || null,
                hourlyBaseRate || 0.0,
            ]);
            const venueId = insertResult.insertId;
            if (facilities && facilities.length > 0) {
                for (const fac of facilities) {
                    await queryRunner.query(`INSERT INTO venue_facilities (
              venue_id,
              sport_type,
              court_or_pitch_count,
              has_floodlights,
              has_parking,
              has_changing_rooms
            ) VALUES (?, ?, ?, ?, ?, ?)`, [
                        venueId,
                        fac.sportType,
                        fac.courtOrPitchCount || 1,
                        fac.hasFloodlights ? 1 : 0,
                        fac.hasParking ? 1 : 0,
                        fac.hasChangingRooms ? 1 : 0,
                    ]);
                }
            }
            await queryRunner.commitTransaction();
            return this.findOne(venueId.toString());
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to create venue: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to create sports venue');
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(sportType, city) {
        const rawVenues = await this.dataSource.query(`SELECT 
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
      ORDER BY v.venue_name ASC`, city ? [city] : []);
        const venueIds = rawVenues.map((v) => v.id);
        let facilitiesByVenue = {};
        if (venueIds.length > 0) {
            const allFacilities = await this.facilityRepository
                .createQueryBuilder('f')
                .where('f.venue_id IN (:...ids)', { ids: venueIds })
                .getMany();
            facilitiesByVenue = allFacilities.reduce((acc, fac) => {
                acc[fac.venueId] = acc[fac.venueId] || [];
                acc[fac.venueId].push(fac);
                return acc;
            }, {});
        }
        let results = rawVenues.map((v) => ({
            ...v,
            hourlyBaseRate: Number(v.hourlyBaseRate),
            latitude: Number(v.latitude),
            longitude: Number(v.longitude),
            facilities: facilitiesByVenue[v.id] || [],
        }));
        if (sportType) {
            results = results.filter((v) => v.facilities.some((f) => f.sportType === sportType));
        }
        return results;
    }
    async findNearby(query) {
        const { latitude, longitude, radiusInKm = 15, sportType, city } = query;
        const radiusInMeters = radiusInKm * 1000;
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
        const params = [longitude, latitude];
        if (city)
            params.push(city);
        params.push(longitude, latitude, radiusInMeters);
        const rawVenues = await this.dataSource.query(sql, params);
        if (!rawVenues || rawVenues.length === 0) {
            return [];
        }
        const venueIds = rawVenues.map((v) => v.id);
        const facilities = await this.facilityRepository
            .createQueryBuilder('f')
            .where('f.venue_id IN (:...ids)', { ids: venueIds })
            .getMany();
        const facilityMap = facilities.reduce((acc, fac) => {
            acc[fac.venueId] = acc[fac.venueId] || [];
            acc[fac.venueId].push(fac);
            return acc;
        }, {});
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
            mapped = mapped.filter((v) => v.facilities.some((f) => f.sportType === sportType));
        }
        return mapped;
    }
    async findOne(id) {
        const rawVenue = await this.dataSource.query(`SELECT 
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
      WHERE v.id = ?`, [id]);
        if (!rawVenue || rawVenue.length === 0) {
            throw new common_1.NotFoundException(`Venue with ID ${id} not found`);
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
    async update(id, updateVenueDto) {
        await this.findOne(id);
        const { venueName, addressLine, city, district, province, contactPhone, latitude, longitude, hourlyBaseRate, } = updateVenueDto;
        const updates = [];
        const params = [];
        if (venueName) {
            updates.push('venue_name = ?');
            params.push(venueName);
        }
        if (addressLine) {
            updates.push('address_line = ?');
            params.push(addressLine);
        }
        if (city) {
            updates.push('city = ?');
            params.push(city);
        }
        if (district !== undefined) {
            updates.push('district = ?');
            params.push(district);
        }
        if (province !== undefined) {
            updates.push('province = ?');
            params.push(province);
        }
        if (contactPhone !== undefined) {
            updates.push('contact_phone = ?');
            params.push(contactPhone);
        }
        if (hourlyBaseRate !== undefined) {
            updates.push('hourly_base_rate = ?');
            params.push(hourlyBaseRate);
        }
        if (latitude !== undefined && longitude !== undefined) {
            updates.push('location_coordinates = ST_SRID(POINT(?, ?), 4326)');
            params.push(longitude, latitude);
        }
        if (updates.length > 0) {
            params.push(id);
            await this.dataSource.query(`UPDATE venues SET ${updates.join(', ')} WHERE id = ?`, params);
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.dataSource.query('UPDATE venues SET is_active = 0 WHERE id = ?', [id]);
        return { message: `Venue ${id} deactivated successfully` };
    }
};
exports.VenuesService = VenuesService;
exports.VenuesService = VenuesService = VenuesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(venue_entity_1.Venue)),
    __param(1, (0, typeorm_1.InjectRepository)(venue_facility_entity_1.VenueFacility)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], VenuesService);
//# sourceMappingURL=venues.service.js.map