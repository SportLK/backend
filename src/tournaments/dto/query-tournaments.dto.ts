import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SportType } from '../../database/entities/user-sports-interest.entity';
import { TournamentFormat, TournamentStatus } from '../../database/entities/tournament.entity';

export class QueryTournamentsDto {
  @IsOptional()
  @IsEnum(SportType)
  sportType?: SportType;

  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @IsOptional()
  @IsEnum(TournamentFormat)
  format?: TournamentFormat;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsString()
  organizerId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

