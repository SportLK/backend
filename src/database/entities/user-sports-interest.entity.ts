import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum SportType {
  CRICKET = 'CRICKET',
  FUTSAL = 'FUTSAL',
  BADMINTON = 'BADMINTON',
  BASKETBALL = 'BASKETBALL',
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

@Entity('user_sports_interests')
export class UserSportsInterest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @ManyToOne(() => User, (user) => user.sportsInterests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: SportType })
  sportType: SportType;

  @Column({
    type: 'enum',
    enum: SkillLevel,
    default: SkillLevel.BEGINNER,
  })
  skillLevel: SkillLevel;
}
