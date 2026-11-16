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
  ForbiddenException,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { RespondChallengeDto } from './dto/respond-challenge.dto';
import { SportType } from '../database/entities/user-sports-interest.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthUser } from '../common/auth.types';
import { CreatePublicTeamReportDto } from './dto/create-public-team-report.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // =========================================================================
  // 1. TEAMS CRUD & SEARCH
  // =========================================================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  @HttpCode(HttpStatus.CREATED)
  createTeam(@CurrentUser() user: AuthUser, @Body() dto: CreateTeamDto) {
    if (dto.managerId !== user.id) throw new ForbiddenException('A team manager can only create a team for their own account');
    return this.teamsService.createTeam(dto);
  }

  @Get()
  findAllTeams(
    @Query('sportType') sportType?: SportType,
    @Query('city') city?: string,
    @Query('search') search?: string,
  ) {
    return this.teamsService.findAllTeams(sportType, city, search);
  }

  @Get('players')
  @UseGuards(JwtAuthGuard)
  searchRegisteredPlayers(@Query('search') search?: string) {
    return this.teamsService.searchRegisteredPlayers(search ?? '');
  }

  @Get('manager/:managerId')
  findTeamsByManager(@Param('managerId') managerId: string) {
    return this.teamsService.findTeamsByManager(managerId);
  }

  @Get('challenges/open')
  getOpenChallenges() {
    return this.teamsService.getOpenChallenges();
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  seedDemoData() {
    return this.teamsService.seedDemoData();
  }

  @Get(':id')
  findTeamById(@Param('id') id: string) {
    return this.teamsService.findTeamById(id);
  }

  @Post(':id/reports')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createTeamReport(@Param('id') teamId: string, @CurrentUser() user: AuthUser, @Body() dto: CreatePublicTeamReportDto) {
    return this.teamsService.createTeamReport({ ...dto, teamId, reporterId: user.id });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  async updateTeam(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateTeamDto) {
    await this.teamsService.assertTeamManager(id, user.id);
    return this.teamsService.updateTeam(id, dto);
  }

  // =========================================================================
  // 2. SQUAD & ROSTER
  // =========================================================================

  @Get(':id/members')
  getTeamMembers(@Param('id') teamId: string) {
    return this.teamsService.getTeamMembers(teamId);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  @HttpCode(HttpStatus.CREATED)
  async addTeamMember(@Param('id') teamId: string, @CurrentUser() user: AuthUser, @Body() dto: AddTeamMemberDto) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.addTeamMember(teamId, dto);
  }

  @Patch(':id/members/:memberId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  async updateMemberRole(
    @Param('id') teamId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.updateMemberRole(teamId, memberId, dto);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  async removeTeamMember(@Param('id') teamId: string, @Param('memberId') memberId: string, @CurrentUser() user: AuthUser) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.removeTeamMember(teamId, memberId);
  }

  // =========================================================================
  // 3. JOIN REQUESTS (Player -> Team)
  // =========================================================================

  @Get(':id/join-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  async getJoinRequests(@Param('id') teamId: string, @CurrentUser() user: AuthUser) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.getJoinRequests(teamId);
  }

  @Post(':id/join-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('player')
  @HttpCode(HttpStatus.CREATED)
  createJoinRequest(@Param('id') teamId: string, @CurrentUser() user: AuthUser) {
    return this.teamsService.createJoinRequest(teamId, { userId: user.id });
  }

  @Post(':id/join-requests/:requestId/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  @HttpCode(HttpStatus.OK)
  async acceptJoinRequest(@Param('id') teamId: string, @Param('requestId') requestId: string, @CurrentUser() user: AuthUser) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.acceptJoinRequest(teamId, requestId);
  }

  @Post(':id/join-requests/:requestId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  @HttpCode(HttpStatus.OK)
  async rejectJoinRequest(@Param('id') teamId: string, @Param('requestId') requestId: string, @CurrentUser() user: AuthUser) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.rejectJoinRequest(teamId, requestId);
  }

  // =========================================================================
  // 4. INVITATIONS (Manager -> Player)
  // =========================================================================

  @Get(':id/invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  async getTeamInvitations(@Param('id') teamId: string, @CurrentUser() user: AuthUser) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.getTeamInvitations(teamId);
  }

  @Post(':id/invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  @HttpCode(HttpStatus.CREATED)
  async createInvitation(@Param('id') teamId: string, @CurrentUser() user: AuthUser, @Body() dto: CreateInvitationDto) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.createInvitation(teamId, dto);
  }

  @Delete(':id/invitations/:invitationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  async cancelInvitation(@Param('id') teamId: string, @Param('invitationId') invitationId: string, @CurrentUser() user: AuthUser) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.cancelInvitation(teamId, invitationId);
  }

  // =========================================================================
  // 5. TEAM CHALLENGES & RESPONSES
  // =========================================================================

  @Post(':id/challenges')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  @HttpCode(HttpStatus.CREATED)
  async createChallenge(@Param('id') challengerTeamId: string, @CurrentUser() user: AuthUser, @Body() dto: CreateChallengeDto) {
    await this.teamsService.assertTeamManager(challengerTeamId, user.id);
    return this.teamsService.createChallenge(challengerTeamId, dto);
  }

  @Get(':id/challenges/received')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  async getReceivedChallenges(@Param('id') teamId: string, @CurrentUser() user: AuthUser) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.getReceivedChallenges(teamId);
  }

  @Get(':id/challenges/sent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  async getSentChallenges(@Param('id') teamId: string, @CurrentUser() user: AuthUser) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.getSentChallenges(teamId);
  }

  @Post(':id/challenges/:challengeId/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('team_manager')
  @HttpCode(HttpStatus.OK)
  async respondToChallenge(
    @Param('id') teamId: string,
    @Param('challengeId') challengeId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RespondChallengeDto,
  ) {
    await this.teamsService.assertTeamManager(teamId, user.id);
    return this.teamsService.respondToChallenge(teamId, challengeId, dto);
  }
}
