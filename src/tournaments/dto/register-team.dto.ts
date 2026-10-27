import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterTeamDto {
  @IsNotEmpty()
  @IsString()
  teamId: string;

  @IsOptional()
  @IsString()
  paymentId?: string;
}

