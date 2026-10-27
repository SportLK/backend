import { IsEnum, IsNotEmpty } from 'class-validator';
import { RegistrationStatus } from '../../database/entities/tournament-registration.entity';

export class UpdateRegistrationStatusDto {
  @IsNotEmpty()
  @IsEnum(RegistrationStatus)
  registrationStatus: RegistrationStatus;
}

