import { IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(100) displayName?: string;
  @IsOptional() @IsString() @MaxLength(500) bio?: string;
  @IsOptional() @IsString() @MaxLength(100) city?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) sports?: string[];
  @IsOptional() @IsIn(['PLAYER', 'TEAM_MANAGER', 'TOURNAMENT_ORGANIZER']) activeWorkspace?: 'PLAYER' | 'TEAM_MANAGER' | 'TOURNAMENT_ORGANIZER';
}

export class UpdateAccountStatusDto {
  @IsIn(['active', 'suspended', 'disabled']) status: 'active' | 'suspended' | 'disabled';
}
