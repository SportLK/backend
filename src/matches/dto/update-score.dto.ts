import {
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export class UpdateScoreDto {
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
