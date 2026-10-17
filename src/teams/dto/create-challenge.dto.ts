import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SportType } from '../../database/entities/user-sports-interest.entity';

export class CreateChallengeDto {
  @IsNotEmpty()
  @IsString()
  challengedTeamId: string;

  @IsNotEmpty()
  @IsEnum(SportType)
  sportType: SportType;

  @IsNotEmpty()
  @IsDateString()
  proposedMatchDate: string;

  @IsOptional()
  @IsString()
  venueId?: string;
}
