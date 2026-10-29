import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInvitationDto {
  @IsNotEmpty()
  @IsString()
  invitedUserId: string;
}
