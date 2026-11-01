import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { TournamentReportReason } from '../../database/entities/tournament-report.entity';

export class CreateTournamentReportDto {
  @IsEnum(TournamentReportReason)
  reason: TournamentReportReason;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  details: string;

  @IsOptional()
  @IsString()
  severity?: string = 'MEDIUM';
}

