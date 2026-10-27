import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TournamentFormat,
  TournamentStatus,
} from '../../database/entities/tournament.entity';
import { SportType } from '../../database/entities/user-sports-interest.entity';

export class UpdateTournamentDto {
  @IsOptional()
  @IsString()
  tournamentName?: string;

  @IsOptional()
  @IsEnum(SportType)
  sportType?: SportType;

  @IsOptional()
  @IsEnum(TournamentFormat)
  tournamentFormat?: TournamentFormat;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  maxParticipatingTeams?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  registrationFee?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be in YYYY-MM-DD format' })
  startDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be in YYYY-MM-DD format' })
  endDate?: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsEnum(TournamentStatus)
  tournamentStatus?: TournamentStatus;
}

