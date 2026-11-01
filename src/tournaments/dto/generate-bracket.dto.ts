import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GenerateBracketDto {
  @IsOptional()
  @IsString()
  venueId?: string;

  @IsOptional()
  @IsBoolean()
  seedRandomly?: boolean = true;

  @IsOptional()
  @IsInt()
  @Min(15)
  matchIntervalMinutes?: number = 90;
}

