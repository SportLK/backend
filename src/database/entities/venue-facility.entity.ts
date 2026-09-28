import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venue } from './venue.entity';
import { SportType } from './user-sports-interest.entity';

@Entity('venue_facilities')
export class VenueFacility {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'venue_id', type: 'bigint' })
  venueId: string;

  @ManyToOne(() => Venue, (venue) => venue.facilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ type: 'enum', enum: SportType })
  sportType: SportType;

  @Column({ name: 'court_or_pitch_count', type: 'int', default: 1 })
  courtOrPitchCount: number;

  @Column({ name: 'has_floodlights', type: 'boolean', default: false })
  hasFloodlights: boolean;

  @Column({ name: 'has_parking', type: 'boolean', default: false })
  hasParking: boolean;

  @Column({ name: 'has_changing_rooms', type: 'boolean', default: false })
  hasChangingRooms: boolean;
}
