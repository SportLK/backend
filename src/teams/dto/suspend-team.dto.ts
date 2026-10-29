import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SuspendTeamDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}
