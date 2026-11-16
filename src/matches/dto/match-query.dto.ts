import {
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { MatchStatus } from '../../database/entities/match.entity';
import { SportType } from '../../database/entities/user-sports-interest.entity';

export class MatchQueryDto {
  @IsOptional()
  @IsString()
  tournamentId?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsEnum(MatchStatus)
  matchStatus?: MatchStatus;

  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD

  @IsOptional()
  @IsEnum(SportType)
  sportType?: SportType;
}
