import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { Venue } from '../database/entities/venue.entity';
import { VenueFacility } from '../database/entities/venue-facility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venue, VenueFacility])],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}
