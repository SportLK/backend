import { IsEnum } from 'class-validator';
import { RegistrationStatus } from '../../database/entities/tournament-registration.entity';

export class UpdateRegistrationStatusDto {
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;
}

