import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  TournamentFormat,
  TournamentStatus,
} from '../../database/entities/tournament.entity';
import { SportType } from '../../database/entities/user-sports-interest.entity';

export class TournamentQueryDto {
  @IsOptional()
  @IsEnum(SportType)
  sportType?: SportType;

  @IsOptional()
  @IsEnum(TournamentStatus)
  tournamentStatus?: TournamentStatus;

  @IsOptional()
  @IsEnum(TournamentFormat)
  tournamentFormat?: TournamentFormat;

  @IsOptional()
  @IsString()
  organizerId?: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

