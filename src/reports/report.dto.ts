import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsIn(['user', 'post', 'community']) targetType: 'user' | 'post' | 'community';
  @IsString() targetId: string;
  @IsString() @MinLength(5) @MaxLength(500) reason: string;
}

export class UpdateReportDto {
  @IsIn(['reviewing', 'resolved', 'dismissed']) status: 'reviewing' | 'resolved' | 'dismissed';
  @IsOptional() @IsString() @MaxLength(500) moderatorNote?: string;
}
