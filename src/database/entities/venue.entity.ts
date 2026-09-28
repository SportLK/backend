import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { VenueFacility } from './venue-facility.entity';
import { VenueBooking } from './venue-booking.entity';
import { Tournament } from './tournament.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'venue_name', length: 150 })
  venueName: string;

  // MySQL 8.0 spatial POINT column for geospatial radius queries
  @Column({
    name: 'location_coordinates',
    type: 'point',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  locationCoordinates: string;

  @Column({ name: 'address_line', length: 255 })
  addressLine: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100, nullable: true })
  district: string;

  @Column({ length: 100, nullable: true })
  province: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true })
  contactPhone: string;

  @Column({
    name: 'hourly_base_rate',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  hourlyBaseRate: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => VenueFacility, (facility) => facility.venue)
  facilities: VenueFacility[];

  @OneToMany(() => VenueBooking, (booking) => booking.venue)
  bookings: VenueBooking[];

  @OneToMany(() => Tournament, (tournament) => tournament.venue)
  tournaments: Tournament[];
}
