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
import { TournamentFormat } from '../../database/entities/tournament.entity';

export class CreateTournamentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  tournamentName: string;

  @IsEnum(SportType)
  sportType: SportType;

  @IsOptional()
  @IsEnum(TournamentFormat)
  tournamentFormat?: TournamentFormat = TournamentFormat.KNOCKOUT_SINGLE;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(64)
  maxParticipatingTeams?: number = 16;

  @IsOptional()
  @IsInt()
  @Min(2)
  minParticipatingTeams?: number = 2;

  @IsOptional()
  @IsNumber()
  @Min(0)
  registrationFee?: number = 0;

  @IsOptional()
  @IsString()
  prizePool?: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

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

