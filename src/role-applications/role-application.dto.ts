import { IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class CreateRoleApplicationDto {
  @IsIn(['team_manager', 'organizer']) requestedRole: 'team_manager' | 'organizer';
  @ValidateIf((dto: CreateRoleApplicationDto) => dto.requestedRole === 'organizer')
  @IsString() @MinLength(2) @MaxLength(140) organization?: string;
  @ValidateIf((dto: CreateRoleApplicationDto) => dto.requestedRole === 'team_manager')
  @IsString() @MinLength(1) @MaxLength(36) organizerId?: string;
  @IsString() @MinLength(20) @MaxLength(2000) experience: string;
}

export class ReviewRoleApplicationDto {
  @IsIn(['approved', 'rejected']) status: 'approved' | 'rejected';
  @IsOptional() @IsString() @MaxLength(500) reviewNote?: string;
}
