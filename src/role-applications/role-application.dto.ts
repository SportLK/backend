import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRoleApplicationDto {
  @IsIn(['team_manager', 'organizer']) requestedRole: 'team_manager' | 'organizer';
  @IsString() @MinLength(2) @MaxLength(140) organization: string;
  @IsString() @MinLength(20) @MaxLength(2000) experience: string;
}

export class ReviewRoleApplicationDto {
  @IsIn(['approved', 'rejected']) status: 'approved' | 'rejected';
  @IsOptional() @IsString() @MaxLength(500) reviewNote?: string;
}
