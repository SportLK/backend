import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../../database/entities/role-application.entity';

export class ReviewApplicationDto {
  @IsNotEmpty()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsNotEmpty()
  @IsString()
  reviewedByAdminId: string;

  @IsOptional()
  @IsString()
  adminFeedback?: string;
}

