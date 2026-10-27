import {
  IsEnum,
  IsInt,
  IsNotEmpty,
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

export class CreateTournamentDto {
  @IsNotEmpty()
  @IsString()
  organizerId: string;

  @IsNotEmpty()
  @IsString()
  tournamentName: string;

  @IsNotEmpty()
  @IsEnum(SportType)
  sportType: SportType;

  @IsOptional()
  @IsEnum(TournamentFormat)
  tournamentFormat?: TournamentFormat = TournamentFormat.KNOCKOUT_SINGLE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  maxParticipatingTeams?: number = 16;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  registrationFee?: number = 0;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be in YYYY-MM-DD format' })
  startDate: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be in YYYY-MM-DD format' })
  endDate: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsEnum(TournamentStatus)
  tournamentStatus?: TournamentStatus = TournamentStatus.DRAFT;
}

