import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { SportType } from '../../database/entities/user-sports-interest.entity';

export class CreateTeamDto {
  @IsNotEmpty()
  @IsString()
  managerId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  teamName: string;

  @IsNotEmpty()
  @IsEnum(SportType)
  sportType: SportType;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  teamBio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  primaryLocationCity?: string;
}
