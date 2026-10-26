import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { SuspendTeamDto } from './dto/suspend-team.dto';
import { CreateTeamReportDto } from './dto/create-team-report.dto';
import { ResolveTeamReportDto } from './dto/resolve-team-report.dto';
import { SportType } from '../database/entities/user-sports-interest.entity';
import { TeamStatus } from '../database/entities/team.entity';
import { TeamReportStatus } from '../database/entities/team-report.entity';

@Controller('admin/teams')
export class AdminTeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // =========================================================================
  // 1. ADMIN VIEW & MANAGE TEAMS
  // =========================================================================

  @Get()
  getAdminTeams(
    @Query('sportType') sportType?: SportType,
    @Query('status') status?: TeamStatus,
    @Query('city') city?: string,
    @Query('search') search?: string,
  ) {
    return this.teamsService.getAdminTeams({ sportType, status, city, search });
  }

  @Get('analytics')
  getTeamAnalytics() {
    return this.teamsService.getTeamAnalytics();
  }

  // =========================================================================
  // 2. TEAM-RELATED REPORTS
  // =========================================================================

  @Get('reports')
  getTeamReports(@Query('status') status?: TeamReportStatus) {
    return this.teamsService.getTeamReports(status);
  }

  @Post('reports')
  @HttpCode(HttpStatus.CREATED)
  createTeamReport(@Body() dto: CreateTeamReportDto) {
    return this.teamsService.createTeamReport(dto);
  }

  @Patch('reports/:id')
  resolveTeamReport(
    @Param('id') id: string,
    @Body() dto: ResolveTeamReportDto,
  ) {
    return this.teamsService.resolveTeamReport(id, dto);
  }

  // =========================================================================
  // 3. TEAM DETAILS & SQUAD ROSTER
  // =========================================================================

  @Get(':id')
  getAdminTeamDetail(@Param('id') id: string) {
    return this.teamsService.getAdminTeamDetail(id);
  }

  // =========================================================================
  // 4. TEAM SUSPENSION & REACTIVATION
  // =========================================================================

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  suspendTeam(@Param('id') id: string, @Body() dto: SuspendTeamDto) {
    return this.teamsService.suspendTeam(id, dto);
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  reactivateTeam(@Param('id') id: string) {
    return this.teamsService.reactivateTeam(id);
  }

  // =========================================================================
  // 5. ADMINISTRATIVE ROSTER MODERATION
  // =========================================================================

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  removeMember(
    @Param('id') teamId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.removeTeamMember(teamId, memberId);
  }
}
