import { IsNumber, Min, Max, IsOptional, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { SportType } from '../../database/entities/user-sports-interest.entity';

export class NearbyVenuesQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  radiusInKm?: number = 15;

  @IsOptional()
  @IsEnum(SportType)
  sportType?: SportType;

  @IsOptional()
  @IsString()
  city?: string;
}
