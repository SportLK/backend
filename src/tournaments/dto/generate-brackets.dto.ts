import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateBracketsDto {
  @IsOptional()
  @IsIn(['REGISTRATION_ORDER', 'RANDOM', 'MANUAL'])
  seedingType?: 'REGISTRATION_ORDER' | 'RANDOM' | 'MANUAL' = 'REGISTRATION_ORDER';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seedTeamIds?: string[];

  @IsOptional()
  @IsDateString()
  initialMatchStartTime?: string;

  @IsOptional()
  @IsString()
  defaultVenueId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  matchIntervalMinutes?: number = 90;
}

