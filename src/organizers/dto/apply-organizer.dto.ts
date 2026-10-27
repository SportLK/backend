import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class ApplyOrganizerDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  justificationNotes: string;

  @IsOptional()
  @IsString()
  supportingDocumentUrl?: string;
}

