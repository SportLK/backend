import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { TeamMemberRole } from '../../database/entities/team-member.entity';

export class UpdateMemberRoleDto {
  @IsOptional()
  @IsEnum(TeamMemberRole)
  memberRole?: TeamMemberRole;

  @IsOptional()
  @IsInt()
  jerseyNumber?: number;
}
