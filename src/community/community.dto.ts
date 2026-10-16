import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommunityDto {
  @IsString() @MinLength(3) @MaxLength(120) name: string;
  @IsString() @MaxLength(80) sport: string;
  @IsString() @MinLength(10) @MaxLength(500) description: string;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
}

export class CreatePostDto {
  @IsString() @MinLength(1) @MaxLength(2000) body: string;
  @IsOptional() @IsString() communityId?: string;
  @IsOptional() @IsString() @MaxLength(80) sport?: string;
}

export class CreateCommentDto {
  @IsString() @MinLength(1) @MaxLength(500) body: string;
}

export class HidePostDto {
  @IsIn(['visible', 'hidden']) status: 'visible' | 'hidden';
}
