import { IsEnum, IsNotEmpty } from 'class-validator';
import { TournamentStatus } from '../../database/entities/tournament.entity';

export class UpdateTournamentStatusDto {
  @IsNotEmpty()
  @IsEnum(TournamentStatus)
  tournamentStatus: TournamentStatus;
}

