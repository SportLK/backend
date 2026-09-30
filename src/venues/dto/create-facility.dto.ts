import { IsEnum, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';
import { SportType } from '../../database/entities/user-sports-interest.entity';

export class CreateFacilityDto {
  @IsEnum(SportType, {
    message: 'sportType must be one of CRICKET, FUTSAL, BADMINTON, BASKETBALL',
  })
  sportType: SportType;

  @IsOptional()
  @IsInt()
  @Min(1)
  courtOrPitchCount?: number = 1;

  @IsOptional()
  @IsBoolean()
  hasFloodlights?: boolean = false;

  @IsOptional()
  @IsBoolean()
  hasParking?: boolean = false;

  @IsOptional()
  @IsBoolean()
  hasChangingRooms?: boolean = false;
}
