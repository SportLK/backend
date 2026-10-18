import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

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

  @IsNotEmpty()
  @IsDateString()
  scheduledStartTime: string;
}
