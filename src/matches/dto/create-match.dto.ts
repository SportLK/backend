import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { SportType } from '../../database/entities/user-sports-interest.entity';

export class CreateMatchDto {
  @IsOptional()
  @IsString()
  tournamentId?: string;

  @IsNotEmpty()
  @IsString()
  homeTeamId: string;

  @IsNotEmpty()
  @IsString()
  awayTeamId: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsEnum(SportType)
  sportType?: SportType;

  @IsNotEmpty()
  @IsDateString()
  scheduledStartTime: string;
}
