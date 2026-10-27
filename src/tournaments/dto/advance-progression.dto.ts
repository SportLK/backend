import { IsNotEmpty, IsString } from 'class-validator';

export class AdvanceProgressionDto {
  @IsNotEmpty()
  @IsString()
  matchId: string;

  @IsNotEmpty()
  @IsString()
  winnerTeamId: string;
}

