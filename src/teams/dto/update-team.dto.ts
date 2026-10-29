import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TeamStatus } from '../../database/entities/team.entity';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  teamName?: string;

  @IsOptional()
  @IsString()
  teamBio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  primaryLocationCity?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}
