import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminModerateTournamentDto {
  @IsNotEmpty()
  @IsIn(['APPROVE', 'SUSPEND', 'CANCEL'])
  action: 'APPROVE' | 'SUSPEND' | 'CANCEL';

  @IsOptional()
  @IsString()
  reason?: string;

  @IsNotEmpty()
  @IsString()
  adminId: string;
}

