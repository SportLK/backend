import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../../database/entities/role-application.entity';

export class OrganizerApplicationQueryDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  userId?: string;
}

