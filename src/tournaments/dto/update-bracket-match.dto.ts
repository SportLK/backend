import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBracketMatchDto {
  @IsNotEmpty()
  @IsString()
  winnerTeamId: string;
}

