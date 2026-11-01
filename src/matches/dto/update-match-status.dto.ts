import {
  IsEnum,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';
import { MatchStatus } from '../../database/entities/match.entity';

export class UpdateMatchStatusDto {
  @IsEnum(MatchStatus, {
    message: 'matchStatus must be one of SCHEDULED, LIVE, COMPLETED, ABANDONED, POSTPONED',
  })
  matchStatus: MatchStatus;

  @IsOptional()
  @IsString()
  winnerTeamId?: string;

  @IsOptional()
  @IsString()
  homeTeamScoreDisplay?: string;

  @IsOptional()
  @IsString()
  awayTeamScoreDisplay?: string;

  @IsOptional()
  @IsObject()
  detailedScorecardJson?: Record<string, any>;

  @IsOptional()
  @IsString()
  lastUpdatedByUserId?: string;
}
