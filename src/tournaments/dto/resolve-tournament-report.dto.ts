import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TournamentReportStatus } from '../../database/entities/tournament-report.entity';

export class ResolveTournamentReportDto {
  @IsEnum(TournamentReportStatus)
  status: TournamentReportStatus;

  @IsNotEmpty()
  @IsString()
  resolutionNotes: string;
}

