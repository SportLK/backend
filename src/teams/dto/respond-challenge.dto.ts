import { IsEnum, IsNotEmpty } from 'class-validator';
import { ChallengeStatus } from '../../database/entities/team-challenge.entity';

export class RespondChallengeDto {
  @IsNotEmpty()
  @IsEnum(ChallengeStatus)
  status: ChallengeStatus; // ACCEPTED or DECLINED
}
