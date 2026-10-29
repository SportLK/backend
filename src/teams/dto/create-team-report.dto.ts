import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TeamReportReason } from '../../database/entities/team-report.entity';

export class CreateTeamReportDto {
  @IsNotEmpty()
  @IsString()
  teamId: string;

  @IsNotEmpty()
  @IsString()
  reporterId: string;

  @IsNotEmpty()
  @IsEnum(TeamReportReason)
  reason: TeamReportReason;

  @IsNotEmpty()
  @IsString()
  details: string;

  @IsOptional()
  @IsString()
  severity?: string;
}
