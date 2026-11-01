import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJoinRequestDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
