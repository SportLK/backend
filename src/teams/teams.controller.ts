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
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { RespondChallengeDto } from './dto/respond-challenge.dto';
import { SportType } from '../database/entities/user-sports-interest.entity';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // =========================================================================
  // 1. TEAMS CRUD & SEARCH
  // =========================================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTeam(@Body() dto: CreateTeamDto) {
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

  @Get('manager/:managerId')
  findTeamsByManager(@Param('managerId') managerId: string) {
    return this.teamsService.findTeamsByManager(managerId);
  }

  @Get('challenges/open')
  getOpenChallenges() {
    return this.teamsService.getOpenChallenges();
  }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  seedDemoData() {
    return this.teamsService.seedDemoData();
  }

  @Get(':id')
  findTeamById(@Param('id') id: string) {
    return this.teamsService.findTeamById(id);
  }

  @Patch(':id')
  updateTeam(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
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
  @HttpCode(HttpStatus.CREATED)
  addTeamMember(@Param('id') teamId: string, @Body() dto: AddTeamMemberDto) {
    return this.teamsService.addTeamMember(teamId, dto);
  }

  @Patch(':id/members/:memberId')
  updateMemberRole(
    @Param('id') teamId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.teamsService.updateMemberRole(teamId, memberId, dto);
  }

  @Delete(':id/members/:memberId')
  removeTeamMember(@Param('id') teamId: string, @Param('memberId') memberId: string) {
    return this.teamsService.removeTeamMember(teamId, memberId);
  }

  // =========================================================================
  // 3. JOIN REQUESTS (Player -> Team)
  // =========================================================================

  @Get(':id/join-requests')
  getJoinRequests(@Param('id') teamId: string) {
    return this.teamsService.getJoinRequests(teamId);
  }

  @Post(':id/join-requests')
  @HttpCode(HttpStatus.CREATED)
  createJoinRequest(@Param('id') teamId: string, @Body() dto: CreateJoinRequestDto) {
    return this.teamsService.createJoinRequest(teamId, dto);
  }

  @Post(':id/join-requests/:requestId/accept')
  @HttpCode(HttpStatus.OK)
  acceptJoinRequest(@Param('id') teamId: string, @Param('requestId') requestId: string) {
    return this.teamsService.acceptJoinRequest(teamId, requestId);
  }

  @Post(':id/join-requests/:requestId/reject')
  @HttpCode(HttpStatus.OK)
  rejectJoinRequest(@Param('id') teamId: string, @Param('requestId') requestId: string) {
    return this.teamsService.rejectJoinRequest(teamId, requestId);
  }

  // =========================================================================
  // 4. INVITATIONS (Manager -> Player)
  // =========================================================================

  @Get(':id/invitations')
  getTeamInvitations(@Param('id') teamId: string) {
    return this.teamsService.getTeamInvitations(teamId);
  }

  @Post(':id/invitations')
  @HttpCode(HttpStatus.CREATED)
  createInvitation(@Param('id') teamId: string, @Body() dto: CreateInvitationDto) {
    return this.teamsService.createInvitation(teamId, dto);
  }

  @Delete(':id/invitations/:invitationId')
  cancelInvitation(@Param('id') teamId: string, @Param('invitationId') invitationId: string) {
    return this.teamsService.cancelInvitation(teamId, invitationId);
  }

  // =========================================================================
  // 5. TEAM CHALLENGES & RESPONSES
  // =========================================================================

  @Post(':id/challenges')
  @HttpCode(HttpStatus.CREATED)
  createChallenge(@Param('id') challengerTeamId: string, @Body() dto: CreateChallengeDto) {
    return this.teamsService.createChallenge(challengerTeamId, dto);
  }

  @Get(':id/challenges/received')
  getReceivedChallenges(@Param('id') teamId: string) {
    return this.teamsService.getReceivedChallenges(teamId);
  }

  @Get(':id/challenges/sent')
  getSentChallenges(@Param('id') teamId: string) {
    return this.teamsService.getSentChallenges(teamId);
  }

  @Post(':id/challenges/:challengeId/respond')
  @HttpCode(HttpStatus.OK)
  respondToChallenge(
    @Param('id') teamId: string,
    @Param('challengeId') challengeId: string,
    @Body() dto: RespondChallengeDto,
  ) {
    return this.teamsService.respondToChallenge(teamId, challengeId, dto);
  }
}
