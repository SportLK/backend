import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { TeamReportStatus } from '../../database/entities/team-report.entity';

export class ResolveTeamReportDto {
  @IsNotEmpty()
  @IsEnum(TeamReportStatus)
  status: TeamReportStatus;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  @IsString()
  handledByAdminId?: string;

  @IsOptional()
  @IsBoolean()
  suspendTeam?: boolean;

  @IsOptional()
  @IsString()
  suspensionDuration?: string;

  @IsOptional()
  @IsString()
  suspensionReason?: string;
}
