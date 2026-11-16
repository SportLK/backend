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
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthUser } from '../common/auth.types';
import { SuspendTeamDto } from './dto/suspend-team.dto';
import { ResolveTeamReportDto } from './dto/resolve-team-report.dto';
import { SportType } from '../database/entities/user-sports-interest.entity';
import { TeamStatus } from '../database/entities/team.entity';
import { TeamReportStatus } from '../database/entities/team-report.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { CreateAdminTeamReportDto } from './dto/create-admin-team-report.dto';

@Controller('admin/teams')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTeam(@Body() dto: CreateTeamDto) {
    return this.teamsService.createTeam(dto);
  }

  @Get('players')
  searchRegisteredPlayers(@Query('search') search?: string) {
    return this.teamsService.searchRegisteredPlayers(search ?? '');
  }

  @Post(':id/join-requests')
  @HttpCode(HttpStatus.CREATED)
  requestPlayerToJoin(@Param('id') id: string, @Body() dto: CreateJoinRequestDto) {
    return this.teamsService.createJoinRequest(id, dto);
  }

  @Get(':id/join-requests')
  getJoinRequests(@Param('id') id: string) {
    return this.teamsService.getJoinRequests(id);
  }

  @Post(':id/join-requests/:requestId/accept')
  acceptJoinRequest(@Param('id') id: string, @Param('requestId') requestId: string) {
    return this.teamsService.acceptJoinRequest(id, requestId);
  }

  @Post(':id/join-requests/:requestId/reject')
  rejectJoinRequest(@Param('id') id: string, @Param('requestId') requestId: string) {
    return this.teamsService.rejectJoinRequest(id, requestId);
  }

  @Get('analytics')
  getTeamAnalytics() {
    return this.teamsService.getTeamAnalytics();
  }

  @Post('seed-demo')
  @HttpCode(HttpStatus.OK)
  seedDemoData() {
    return this.teamsService.seedDemoData();
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
  createTeamReport(@Body() dto: CreateAdminTeamReportDto, @CurrentUser() admin: AuthUser) {
    return this.teamsService.createTeamReport({ ...dto, reporterId: admin.id });
  }

  @Patch('reports/:id')
  resolveTeamReport(
    @Param('id') id: string,
    @CurrentUser() admin: AuthUser,
    @Body() dto: ResolveTeamReportDto,
  ) {
    return this.teamsService.resolveTeamReport(id, { ...dto, handledByAdminId: admin.id });
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
  suspendTeam(@Param('id') id: string, @CurrentUser() admin: AuthUser, @Body() dto: SuspendTeamDto) {
    return this.teamsService.suspendTeam(id, { ...dto, adminId: admin.id });
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
