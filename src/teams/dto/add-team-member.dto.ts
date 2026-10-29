import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TeamMemberRole } from '../../database/entities/team-member.entity';

export class AddTeamMemberDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(TeamMemberRole)
  memberRole?: TeamMemberRole = TeamMemberRole.SQUAD_PLAYER;

  @IsOptional()
  @IsInt()
  jerseyNumber?: number;
}
