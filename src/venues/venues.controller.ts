import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { NearbyVenuesQueryDto } from './dto/nearby-venues-query.dto';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  /**
   * POST /api/v1/venues
   * Admin adds a new venue with facilities & GPS coordinates
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVenueDto: CreateVenueDto) {
    return this.venuesService.create(createVenueDto);
  }

  /**
   * GET /api/v1/venues/nearby
   * Player location-based nearby grounds search (ST_Distance_Sphere)
   */
  @Get('nearby')
  findNearby(@Query() query: NearbyVenuesQueryDto) {
    return this.venuesService.findNearby(query);
  }

  /**
   * GET /api/v1/venues
   * Get all active venues (for Tournament Organizers selecting venues or Admin list)
   */
  @Get()
  findAll(
    @Query('sportType') sportType?: string,
    @Query('city') city?: string,
  ) {
    return this.venuesService.findAll(sportType, city);
  }

  /**
   * GET /api/v1/venues/:id
   * Get single venue details with sports facilities
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  /**
   * PATCH /api/v1/venues/:id
   * Update venue details (Admin)
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVenueDto: Partial<CreateVenueDto>,
  ) {
    return this.venuesService.update(id, updateVenueDto);
  }

  /**
   * DELETE /api/v1/venues/:id
   * Deactivate a venue (Admin)
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
