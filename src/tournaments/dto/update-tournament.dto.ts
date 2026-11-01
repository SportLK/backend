import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { SportType } from '../../database/entities/user-sports-interest.entity';
import { TournamentFormat, TournamentStatus } from '../../database/entities/tournament.entity';

export class UpdateTournamentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  tournamentName?: string;

  @IsOptional()
  @IsEnum(SportType)
  sportType?: SportType;

  @IsOptional()
  @IsEnum(TournamentFormat)
  tournamentFormat?: TournamentFormat;

  @IsOptional()
  @IsEnum(TournamentStatus)
  tournamentStatus?: TournamentStatus;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(64)
  maxParticipatingTeams?: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  minParticipatingTeams?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  registrationFee?: number;

  @IsOptional()
  @IsString()
  prizePool?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  registrationDeadline?: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  rules?: string;

  @IsOptional()
  @IsString()
  bannerImageUrl?: string;
}

