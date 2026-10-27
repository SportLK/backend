import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleMatchDto {
  @IsNotEmpty()
  @IsString()
  matchId: string;

  @IsNotEmpty()
  @IsDateString()
  scheduledStartTime: string;

  @IsOptional()
  @IsString()
  venueId?: string;
}

export class BulkScheduleMatchesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleMatchDto)
  schedules: ScheduleMatchDto[];
}

