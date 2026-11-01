import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterTeamDto {
  @IsNotEmpty()
  @IsString()
  teamId: string;
}

