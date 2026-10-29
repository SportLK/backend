import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, TeamStatus } from '../database/entities/team.entity';
import { TeamMember, TeamMemberRole } from '../database/entities/team-member.entity';
import {
  TeamInvitation,
  InvitationType,
  InvitationStatus,
} from '../database/entities/team-invitation.entity';
import { TeamChallenge, ChallengeStatus } from '../database/entities/team-challenge.entity';
import { TeamReport, TeamReportReason, TeamReportStatus } from '../database/entities/team-report.entity';
import { User, BaseRole, ActiveWorkspace } from '../database/entities/user.entity';
import { SportType } from '../database/entities/user-sports-interest.entity';

import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { RespondChallengeDto } from './dto/respond-challenge.dto';
import { SuspendTeamDto } from './dto/suspend-team.dto';
import { CreateTeamReportDto } from './dto/create-team-report.dto';
import { ResolveTeamReportDto } from './dto/resolve-team-report.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,

    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,

    @InjectRepository(TeamInvitation)
    private readonly invitationRepository: Repository<TeamInvitation>,

    @InjectRepository(TeamChallenge)
    private readonly challengeRepository: Repository<TeamChallenge>,

    @InjectRepository(TeamReport)
    private readonly reportRepository: Repository<TeamReport>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // =========================================================================
  // 1. TEAMS MANAGEMENT
  // =========================================================================

  async createTeam(dto: CreateTeamDto): Promise<Team> {
    const manager = await this.userRepository.findOne({ where: { id: dto.managerId } });
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${dto.managerId} not found`);
    }

    const existing = await this.teamRepository.findOne({ where: { teamName: dto.teamName } });
    if (existing) {
      throw new ConflictException(`Team with name "${dto.teamName}" already exists`);
    }

    const team = this.teamRepository.create({
      managerId: dto.managerId,
      teamName: dto.teamName,
      sportType: dto.sportType,
      logoUrl: dto.logoUrl,
      teamBio: dto.teamBio,
      primaryLocationCity: dto.primaryLocationCity,
      status: TeamStatus.ACTIVE,
    });

    const savedTeam = await this.teamRepository.save(team);

    // Auto-add manager as Captain in the roster
    const captainMember = this.memberRepository.create({
      teamId: savedTeam.id,
      userId: manager.id,
      memberRole: TeamMemberRole.CAPTAIN,
      jerseyNumber: 1,
    });
    await this.memberRepository.save(captainMember);

    // Ensure manager has isTeamManager flag set
    if (!manager.isTeamManager) {
      manager.isTeamManager = true;
      await this.userRepository.save(manager);
    }

    return this.findTeamById(savedTeam.id);
  }

  async findAllTeams(sportType?: SportType, city?: string, search?: string): Promise<any[]> {
    const query = this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.manager', 'manager')
      .leftJoinAndSelect('team.members', 'members')
      .where('team.status = :status', { status: TeamStatus.ACTIVE });

    if (sportType) {
      query.andWhere('team.sportType = :sportType', { sportType });
    }

    if (city) {
      query.andWhere('team.primaryLocationCity LIKE :city', { city: `%${city}%` });
    }

    if (search) {
      query.andWhere('team.teamName LIKE :search', { search: `%${search}%` });
    }

    const teams = await query.getMany();

    return teams.map((t) => ({
      ...t,
      playersCount: t.members ? t.members.length : 0,
    }));
  }

  async findTeamsByManager(managerId: string): Promise<any[]> {
    const teams = await this.teamRepository.find({
      where: { managerId },
      relations: ['members', 'members.user'],
      order: { createdAt: 'DESC' },
    });

    return teams.map((t) => ({
      ...t,
      playersCount: t.members ? t.members.length : 0,
    }));
  }

  async findTeamById(id: string): Promise<any> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['manager', 'members', 'members.user'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return {
      ...team,
      playersCount: team.members ? team.members.length : 0,
    };
  }

  async updateTeam(id: string, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    if (dto.teamName && dto.teamName !== team.teamName) {
      const existing = await this.teamRepository.findOne({ where: { teamName: dto.teamName } });
      if (existing) {
        throw new ConflictException(`Team with name "${dto.teamName}" already exists`);
      }
      team.teamName = dto.teamName;
    }

    if (dto.teamBio !== undefined) team.teamBio = dto.teamBio;
    if (dto.primaryLocationCity !== undefined) team.primaryLocationCity = dto.primaryLocationCity;
    if (dto.logoUrl !== undefined) team.logoUrl = dto.logoUrl;
    if (dto.status !== undefined) team.status = dto.status;

    await this.teamRepository.save(team);
    return this.findTeamById(id);
  }

  // =========================================================================
  // 2. SQUAD & ROSTER MANAGEMENT
  // =========================================================================

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    await this.findTeamById(teamId);

    return this.memberRepository.find({
      where: { teamId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  async addTeamMember(teamId: string, dto: AddTeamMemberDto): Promise<TeamMember> {
    await this.findTeamById(teamId);

    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const existingMember = await this.memberRepository.findOne({
      where: { teamId, userId: dto.userId },
    });

    if (existingMember) {
      throw new ConflictException(`User is already a member of this team`);
    }

    const member = this.memberRepository.create({
      teamId,
      userId: dto.userId,
      memberRole: dto.memberRole || TeamMemberRole.SQUAD_PLAYER,
      jerseyNumber: dto.jerseyNumber,
    });

    const saved = await this.memberRepository.save(member);
    return this.memberRepository.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
  }

  async updateMemberRole(
    teamId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<TeamMember> {
    const member = await this.memberRepository.findOne({
      where: { id: memberId, teamId },
      relations: ['user'],
    });

    if (!member) {
      throw new NotFoundException(`Team member not found`);
    }

    if (dto.memberRole !== undefined) member.memberRole = dto.memberRole;
    if (dto.jerseyNumber !== undefined) member.jerseyNumber = dto.jerseyNumber;

    return this.memberRepository.save(member);
  }

  async removeTeamMember(teamId: string, memberId: string): Promise<{ success: boolean; message: string }> {
    const member = await this.memberRepository.findOne({
      where: { id: memberId, teamId },
    });

    if (!member) {
      throw new NotFoundException(`Team member not found`);
    }

    await this.memberRepository.remove(member);
    return { success: true, message: 'Member removed from team roster' };
  }

  // =========================================================================
  // 3. JOIN REQUESTS (Player -> Team)
  // =========================================================================

  async getJoinRequests(teamId: string): Promise<TeamInvitation[]> {
    await this.findTeamById(teamId);

    return this.invitationRepository.find({
      where: {
        teamId,
        inviteType: InvitationType.PLAYER_REQUEST_TO_JOIN,
        status: InvitationStatus.PENDING,
      },
      relations: ['invitedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async createJoinRequest(teamId: string, dto: CreateJoinRequestDto): Promise<TeamInvitation> {
    await this.findTeamById(teamId);

    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const existingMember = await this.memberRepository.findOne({
      where: { teamId, userId: dto.userId },
    });
    if (existingMember) {
      throw new ConflictException(`User is already a member of this squad`);
    }

    const existingRequest = await this.invitationRepository.findOne({
      where: {
        teamId,
        invitedUserId: dto.userId,
        inviteType: InvitationType.PLAYER_REQUEST_TO_JOIN,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException(`A join request is already pending for this player`);
    }

    const request = this.invitationRepository.create({
      teamId,
      invitedUserId: dto.userId,
      inviteType: InvitationType.PLAYER_REQUEST_TO_JOIN,
      status: InvitationStatus.PENDING,
    });

    return this.invitationRepository.save(request);
  }

  async acceptJoinRequest(
    teamId: string,
    requestId: string,
  ): Promise<{ success: boolean; member: TeamMember }> {
    const request = await this.invitationRepository.findOne({
      where: {
        id: requestId,
        teamId,
        inviteType: InvitationType.PLAYER_REQUEST_TO_JOIN,
      },
      relations: ['invitedUser'],
    });

    if (!request) {
      throw new NotFoundException(`Join request not found`);
    }

    if (request.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`Join request has already been ${request.status.toLowerCase()}`);
    }

    // Add to squad roster
    const newMember = await this.addTeamMember(teamId, {
      userId: request.invitedUserId,
      memberRole: TeamMemberRole.SQUAD_PLAYER,
    });

    // Mark invitation accepted
    request.status = InvitationStatus.ACCEPTED;
    await this.invitationRepository.save(request);

    return { success: true, member: newMember };
  }

  async rejectJoinRequest(
    teamId: string,
    requestId: string,
  ): Promise<{ success: boolean; message: string }> {
    const request = await this.invitationRepository.findOne({
      where: {
        id: requestId,
        teamId,
        inviteType: InvitationType.PLAYER_REQUEST_TO_JOIN,
      },
    });

    if (!request) {
      throw new NotFoundException(`Join request not found`);
    }

    request.status = InvitationStatus.REJECTED;
    await this.invitationRepository.save(request);

    return { success: true, message: 'Join request declined' };
  }

  // =========================================================================
  // 4. INVITATIONS (Manager -> Player)
  // =========================================================================

  async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    await this.findTeamById(teamId);

    return this.invitationRepository.find({
      where: {
        teamId,
        inviteType: InvitationType.MANAGER_TO_PLAYER,
      },
      relations: ['invitedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async createInvitation(teamId: string, dto: CreateInvitationDto): Promise<TeamInvitation> {
    await this.findTeamById(teamId);

    const user = await this.userRepository.findOne({ where: { id: dto.invitedUserId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.invitedUserId} not found`);
    }

    const existingMember = await this.memberRepository.findOne({
      where: { teamId, userId: dto.invitedUserId },
    });
    if (existingMember) {
      throw new ConflictException(`User is already a member of this squad`);
    }

    const pendingInvite = await this.invitationRepository.findOne({
      where: {
        teamId,
        invitedUserId: dto.invitedUserId,
        inviteType: InvitationType.MANAGER_TO_PLAYER,
        status: InvitationStatus.PENDING,
      },
    });

    if (pendingInvite) {
      throw new ConflictException(`An invitation has already been sent to this player`);
    }

    const invitation = this.invitationRepository.create({
      teamId,
      invitedUserId: dto.invitedUserId,
      inviteType: InvitationType.MANAGER_TO_PLAYER,
      status: InvitationStatus.PENDING,
    });

    return this.invitationRepository.save(invitation);
  }

  async cancelInvitation(
    teamId: string,
    invitationId: string,
  ): Promise<{ success: boolean; message: string }> {
    const invite = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
        teamId,
        inviteType: InvitationType.MANAGER_TO_PLAYER,
      },
    });

    if (!invite) {
      throw new NotFoundException(`Invitation not found`);
    }

    await this.invitationRepository.remove(invite);
    return { success: true, message: 'Invitation cancelled' };
  }

  // =========================================================================
  // 5. TEAM CHALLENGES & RESPONSES
  // =========================================================================

  async createChallenge(challengerTeamId: string, dto: CreateChallengeDto): Promise<TeamChallenge> {
    if (challengerTeamId === dto.challengedTeamId) {
      throw new BadRequestException('A team cannot challenge itself');
    }

    const challenger = await this.findTeamById(challengerTeamId);
    const challenged = await this.findTeamById(dto.challengedTeamId);

    const challenge = this.challengeRepository.create({
      challengerTeamId,
      challengedTeamId: dto.challengedTeamId,
      sportType: dto.sportType,
      proposedMatchDate: new Date(dto.proposedMatchDate),
      venueId: dto.venueId,
      status: ChallengeStatus.PENDING,
    });

    return this.challengeRepository.save(challenge);
  }

  async getReceivedChallenges(teamId: string): Promise<TeamChallenge[]> {
    await this.findTeamById(teamId);

    return this.challengeRepository.find({
      where: { challengedTeamId: teamId },
      relations: ['challengerTeam', 'challengerTeam.manager'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSentChallenges(teamId: string): Promise<TeamChallenge[]> {
    await this.findTeamById(teamId);

    return this.challengeRepository.find({
      where: { challengerTeamId: teamId },
      relations: ['challengedTeam', 'challengedTeam.manager'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOpenChallenges(): Promise<TeamChallenge[]> {
    return this.challengeRepository.find({
      where: { status: ChallengeStatus.PENDING },
      relations: ['challengerTeam'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async respondToChallenge(
    teamId: string,
    challengeId: string,
    dto: RespondChallengeDto,
  ): Promise<TeamChallenge> {
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId, challengedTeamId: teamId },
      relations: ['challengerTeam', 'challengedTeam'],
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge not found for this team`);
    }

    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException(`Challenge has already been ${challenge.status.toLowerCase()}`);
    }

    challenge.status = dto.status;
    return this.challengeRepository.save(challenge);
  }

  // =========================================================================
  // 6. ADMIN WORKFLOWS (MEMBER 2 ADMIN DASHBOARD)
  // =========================================================================

  private formatMember(m: TeamMember) {
    const roleMap: Record<string, string> = {
      CAPTAIN: 'Captain',
      VICE_CAPTAIN: 'Vice-Captain',
      FORWARD: 'Forward',
      MIDFIELDER: 'Midfielder',
      DEFENDER: 'Defender',
      GOALKEEPER: 'Goalkeeper',
      SQUAD_PLAYER: 'Squad Player',
    };
    return {
      id: m.id,
      fullName: m.user?.fullName || `Player ${m.userId}`,
      role: roleMap[m.memberRole] || 'Squad Player',
      jerseyNumber: m.jerseyNumber,
      email: m.user?.email || `player${m.userId}@sportlk.com`,
      phoneNumber: m.user?.phoneNumber || '+94 77 000 0000',
      joinedDate: m.joinedAt
        ? new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Oct 2026',
      status: 'Active',
    };
  }

  async getAdminTeams(params?: {
    sportType?: SportType;
    status?: TeamStatus;
    city?: string;
    search?: string;
  }): Promise<any[]> {
    const query = this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.manager', 'manager')
      .leftJoinAndSelect('team.members', 'members')
      .leftJoinAndSelect('members.user', 'memberUser')
      .orderBy('team.createdAt', 'DESC');

    if (params?.sportType) {
      query.andWhere('team.sportType = :sportType', { sportType: params.sportType });
    }

    if (params?.status) {
      query.andWhere('team.status = :status', { status: params.status });
    }

    if (params?.city) {
      query.andWhere('team.primaryLocationCity LIKE :city', { city: `%${params.city}%` });
    }

    if (params?.search) {
      query.andWhere(
        '(team.teamName LIKE :search OR manager.fullName LIKE :search OR team.primaryLocationCity LIKE :search)',
        { search: `%${params.search}%` },
      );
    }

    const teams = await query.getMany();

    return teams.map((team) => ({
      id: team.id,
      name: team.teamName,
      location: team.primaryLocationCity || 'Sri Lanka',
      sport: team.sportType
        ? team.sportType.charAt(0) + team.sportType.slice(1).toLowerCase()
        : 'Futsal',
      sportType: team.sportType,
      status: team.status === TeamStatus.SUSPENDED ? 'Suspended' : 'Active',
      statusEnum: team.status,
      membersCount: team.members ? team.members.length : 0,
      matchesPlayed: 18,
      winsCount: 12,
      bio: team.teamBio || '',
      initials: team.teamName
        ? team.teamName
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'TM',
      createdAt: team.createdAt
        ? new Date(team.createdAt).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '2026',
      manager: {
        id: team.manager?.id || team.managerId,
        name: team.manager?.fullName || 'Manager',
        email: team.manager?.email || '',
        phone: team.manager?.phoneNumber || '+94 77 123 4567',
        joinedDate: team.manager?.createdAt
          ? new Date(team.manager.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })
          : 'Jan 2026',
      },
      suspensionDetails:
        team.status === TeamStatus.SUSPENDED
          ? {
              suspendedAt: team.suspendedAt
                ? new Date(team.suspendedAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recently',
              suspendedBy: team.suspendedBy || 'SportLK Admin',
              reason: team.suspensionReason || 'Violation of code of conduct',
              duration: team.suspensionDuration || '30 Days',
              notes: team.suspensionNotes || '',
            }
          : undefined,
      squad: team.members ? team.members.map((m) => this.formatMember(m)) : [],
    }));
  }

  async getAdminTeamDetail(id: string): Promise<any> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['manager', 'members', 'members.user', 'reports'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return {
      id: team.id,
      name: team.teamName,
      location: team.primaryLocationCity || 'Sri Lanka',
      sport: team.sportType
        ? team.sportType.charAt(0) + team.sportType.slice(1).toLowerCase()
        : 'Futsal',
      sportType: team.sportType,
      status: team.status === TeamStatus.SUSPENDED ? 'Suspended' : 'Active',
      statusEnum: team.status,
      membersCount: team.members ? team.members.length : 0,
      matchesPlayed: 18,
      winsCount: 12,
      bio: team.teamBio || '',
      initials: team.teamName
        ? team.teamName
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'TM',
      createdAt: team.createdAt
        ? new Date(team.createdAt).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '2026',
      manager: {
        id: team.manager?.id || team.managerId,
        name: team.manager?.fullName || 'Manager',
        email: team.manager?.email || '',
        phone: team.manager?.phoneNumber || '+94 77 123 4567',
        joinedDate: team.manager?.createdAt
          ? new Date(team.manager.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })
          : 'Jan 2026',
      },
      suspensionDetails:
        team.status === TeamStatus.SUSPENDED
          ? {
              suspendedAt: team.suspendedAt
                ? new Date(team.suspendedAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recently',
              suspendedBy: team.suspendedBy || 'SportLK Admin',
              reason: team.suspensionReason || 'Violation of code of conduct',
              duration: team.suspensionDuration || '30 Days',
              notes: team.suspensionNotes || '',
            }
          : undefined,
      squad: team.members ? team.members.map((m) => this.formatMember(m)) : [],
    };
  }

  async suspendTeam(id: string, dto: SuspendTeamDto): Promise<any> {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    team.status = TeamStatus.SUSPENDED;
    team.suspensionReason = dto.reason;
    team.suspensionDuration = dto.duration || '30 Days';
    team.suspensionNotes = dto.notes || '';
    team.suspendedAt = new Date();
    team.suspendedBy = dto.adminId || 'SportLK Admin';

    await this.teamRepository.save(team);
    return this.getAdminTeamDetail(id);
  }

  async reactivateTeam(id: string): Promise<any> {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    team.status = TeamStatus.ACTIVE;
    team.suspensionReason = null as any;
    team.suspensionDuration = null as any;
    team.suspensionNotes = null as any;
    team.suspendedAt = null as any;
    team.suspendedBy = null as any;

    await this.teamRepository.save(team);
    return this.getAdminTeamDetail(id);
  }

  async getTeamReports(status?: TeamReportStatus): Promise<any[]> {
    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.team', 'team')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .orderBy('report.createdAt', 'DESC');

    if (status) {
      query.andWhere('report.status = :status', { status });
    }

    const reports = await query.getMany();

    const reasonFormatMap: Record<string, string> = {
      MISLEADING_INFORMATION: 'Misleading information',
      ROSTER_ELIGIBILITY_DISPUTE: 'Roster eligibility dispute',
      UNSPORTSMANLIKE_CONDUCT: 'Unsportsmanlike conduct',
      INACTIVE_FORFEIT: 'Inactive / Forfeit',
      HARASSMENT: 'Harassment',
      OTHER: 'Other Concern',
    };

    const statusFormatMap: Record<string, string> = {
      OPEN: 'Open',
      IN_REVIEW: 'In Review',
      RESOLVED: 'Resolved',
      DISMISSED: 'Dismissed',
    };

    return reports.map((r) => ({
      id: r.id,
      reportNumber: r.reportNumber,
      teamId: r.teamId,
      teamName: r.team?.teamName || `Team #${r.teamId}`,
      reportedBy: r.reporter?.fullName || `User #${r.reporterId}`,
      reporterRole: r.reporter?.isTeamManager ? 'Team Manager' : 'Player',
      reason: reasonFormatMap[r.reason] || r.reason,
      reasonEnum: r.reason,
      details: r.details,
      receivedDate: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'Recent',
      status: statusFormatMap[r.status] || r.status,
      statusEnum: r.status,
      severity: r.severity || 'Medium',
      resolutionNotes: r.resolutionNotes,
    }));
  }

  async createTeamReport(dto: CreateTeamReportDto): Promise<TeamReport> {
    const team = await this.teamRepository.findOne({ where: { id: dto.teamId } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${dto.teamId} not found`);
    }

    const count = await this.reportRepository.count();
    const reportNumber = `TR-${101 + count}`;

    const report = this.reportRepository.create({
      reportNumber,
      teamId: dto.teamId,
      reporterId: dto.reporterId,
      reason: dto.reason,
      details: dto.details,
      severity: dto.severity || 'Medium',
      status: TeamReportStatus.OPEN,
    });

    return this.reportRepository.save(report);
  }

  async resolveTeamReport(id: string, dto: ResolveTeamReportDto): Promise<any> {
    const report = await this.reportRepository.findOne({ where: { id }, relations: ['team'] });
    if (!report) {
      throw new NotFoundException(`Team report with ID ${id} not found`);
    }

    report.status = dto.status;
    if (dto.resolutionNotes !== undefined) report.resolutionNotes = dto.resolutionNotes;
    if (dto.handledByAdminId !== undefined) report.handledByAdminId = dto.handledByAdminId;

    await this.reportRepository.save(report);

    if (dto.suspendTeam && report.teamId) {
      await this.suspendTeam(report.teamId, {
        reason: dto.suspensionReason || report.reason,
        duration: dto.suspensionDuration || '30 Days',
        notes: dto.resolutionNotes || 'Suspended via report resolution',
      });
    }

    return this.getTeamReports();
  }

  async getTeamAnalytics(): Promise<any> {
    const totalTeams = await this.teamRepository.count();
    const activeTeams = await this.teamRepository.count({ where: { status: TeamStatus.ACTIVE } });
    const suspendedTeams = await this.teamRepository.count({
      where: { status: TeamStatus.SUSPENDED },
    });
    const totalMembers = await this.memberRepository.count();
    const totalReports = await this.reportRepository.count();
    const openReports = await this.reportRepository.count({
      where: { status: TeamReportStatus.OPEN },
    });

    const avgSquadSize = totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : '0';

    return {
      totalTeams,
      activeTeams,
      suspendedTeams,
      totalMembers,
      avgSquadSize,
      complianceRate: totalTeams > 0 ? Math.round((activeTeams / totalTeams) * 100) : 100,
      totalReports,
      openReports,
    };
  }

  // =========================================================================
  // 7. DEVELOPMENT SEEDING (Helper for immediate end-to-end testing)
  // =========================================================================

  async seedDemoData(): Promise<{ success: boolean; message: string; data: any }> {
    // 1. Create or find Manager User
    let manager = await this.userRepository.findOne({
      where: { email: 'manager@sportlk.com' },
    });

    if (!manager) {
      manager = this.userRepository.create({
        email: 'manager@sportlk.com',
        passwordHash: '$2b$10$demohashedpasswordforlocaltesting1234567890',
        fullName: 'Dasun Praveena',
        phoneNumber: '+94771234567',
        baseRole: BaseRole.PLAYER,
        isTeamManager: true,
        activeWorkspace: ActiveWorkspace.TEAM_MANAGER,
      });
      manager = await this.userRepository.save(manager);
    }

    // 2. Create sample players & managers
    const samplePlayersData = [
      { name: 'Kavindu Perera', email: 'kavindu@sportlk.com' },
      { name: 'Chamath Silva', email: 'chamath@sportlk.com' },
      { name: 'Malith Bandara', email: 'malith@sportlk.com' },
      { name: 'Ravindu Fernando', email: 'ravindu@sportlk.com' },
      { name: 'Sahan Wickramasinghe', email: 'sahan@sportlk.com' },
      { name: 'Dilshan Fernando', email: 'dilshan@sportlk.com' },
      { name: 'Nuwan Pradeep', email: 'nuwan@sportlk.com' },
      { name: 'Ashen Bandara', email: 'ashen@sportlk.com' },
      { name: 'Nimal Jayasinghe', email: 'nimal@sportlk.com' },
      { name: 'Sahan Perera', email: 'sahan.p@sportlk.com' },
      { name: 'Mahesh Theekshana', email: 'mahesh@sportlk.com' },
      { name: 'Tharindu Fernando', email: 'tharindu@sportlk.com' },
    ];

    const players: User[] = [];
    for (const p of samplePlayersData) {
      let u = await this.userRepository.findOne({ where: { email: p.email } });
      if (!u) {
        u = this.userRepository.create({
          email: p.email,
          passwordHash: '$2b$10$demohashedpasswordforlocaltesting1234567890',
          fullName: p.name,
          phoneNumber: '+94719876543',
          baseRole: BaseRole.PLAYER,
          activeWorkspace: ActiveWorkspace.PLAYER,
        });
        u = await this.userRepository.save(u);
      }
      players.push(u);
    }

    // 3. Seed Teams (Colombo Strikers, Kandy United, Galle Warriors, Negombo FC, Colombo Kings, Moratuwa Ballers)
    const teamsToCreate = [
      {
        name: 'Colombo Strikers',
        manager: manager,
        sport: SportType.FUTSAL,
        city: 'Colombo',
        bio: 'A Colombo-based squad united by a love for futsal. Training every Sunday at Colombo Sports Arena.',
        status: TeamStatus.ACTIVE,
      },
      {
        name: 'Kandy United',
        manager: players[4], // Sahan Wickramasinghe
        sport: SportType.FUTSAL,
        city: 'Kandy',
        bio: 'Central Province futsal champions 2025. Competing in the National Futsal League.',
        status: TeamStatus.ACTIVE,
      },
      {
        name: 'Galle Warriors',
        manager: players[8], // Nimal Jayasinghe
        sport: SportType.FUTSAL,
        city: 'Galle',
        bio: 'Southern coastal squad with premier tournament honors at Galle Indoor Complex.',
        status: TeamStatus.ACTIVE,
      },
      {
        name: 'Negombo FC',
        manager: players[9], // Sahan Perera
        sport: SportType.FUTSAL,
        city: 'Negombo',
        bio: 'Western coastal champions specializing in fast-paced 5-a-side indoor competitions.',
        status: TeamStatus.ACTIVE,
      },
      {
        name: 'Colombo Kings',
        manager: players[10], // Mahesh Theekshana
        sport: SportType.CRICKET,
        city: 'Colombo',
        bio: 'Premier club division weekend 10-overs cricket team playing across Colombo venues.',
        status: TeamStatus.ACTIVE,
      },
      {
        name: 'Moratuwa Ballers',
        manager: players[11], // Tharindu Fernando
        sport: SportType.FUTSAL,
        city: 'Moratuwa',
        bio: 'Suburban futsal squad currently under administrative disciplinary review.',
        status: TeamStatus.SUSPENDED,
        suspensionReason: 'Misleading information / Fake roster participant',
        suspensionDuration: '30 Days',
        suspensionNotes:
          'Team fielded unregistered player during Western Province qualifier without organizer verification.',
        suspendedAt: new Date('2026-10-05T10:00:00Z'),
        suspendedBy: 'SportLK Admin',
      },
    ];

    const createdTeams: Team[] = [];
    for (const t of teamsToCreate) {
      let team = await this.teamRepository.findOne({ where: { teamName: t.name } });
      if (!team) {
        team = this.teamRepository.create({
          managerId: t.manager.id,
          teamName: t.name,
          sportType: t.sport,
          primaryLocationCity: t.city,
          teamBio: t.bio,
          status: t.status,
          suspensionReason: (t as any).suspensionReason || null,
          suspensionDuration: (t as any).suspensionDuration || null,
          suspensionNotes: (t as any).suspensionNotes || null,
          suspendedAt: (t as any).suspendedAt || null,
          suspendedBy: (t as any).suspendedBy || null,
        });
        team = await this.teamRepository.save(team);
      }
      createdTeams.push(team);
    }

    const team1 = createdTeams[0]; // Colombo Strikers
    const team2 = createdTeams[1]; // Kandy United

    // 4. Populate Roster for Colombo Strikers
    const team1MembersCount = await this.memberRepository.count({ where: { teamId: team1.id } });
    if (team1MembersCount === 0) {
      await this.memberRepository.save(
        this.memberRepository.create({
          teamId: team1.id,
          userId: manager.id,
          memberRole: TeamMemberRole.CAPTAIN,
          jerseyNumber: 7,
        }),
      );

      const rosterRoles = [
        { user: players[0], role: TeamMemberRole.SQUAD_PLAYER, jersey: 10 },
        { user: players[1], role: TeamMemberRole.SQUAD_PLAYER, jersey: 1 },
        { user: players[2], role: TeamMemberRole.VICE_CAPTAIN, jersey: 8 },
        { user: players[3], role: TeamMemberRole.SQUAD_PLAYER, jersey: 4 },
        { user: players[4], role: TeamMemberRole.SQUAD_PLAYER, jersey: 6 },
        { user: players[5], role: TeamMemberRole.SQUAD_PLAYER, jersey: 11 },
      ];

      for (const r of rosterRoles) {
        await this.memberRepository.save(
          this.memberRepository.create({
            teamId: team1.id,
            userId: r.user.id,
            memberRole: r.role,
            jerseyNumber: r.jersey,
          }),
        );
      }
    }

    // 5. Add pending Join Requests to Colombo Strikers
    const existingReq = await this.invitationRepository.findOne({
      where: {
        teamId: team1.id,
        invitedUserId: players[4].id,
        inviteType: InvitationType.PLAYER_REQUEST_TO_JOIN,
      },
    });

    if (!existingReq) {
      await this.invitationRepository.save(
        this.invitationRepository.create({
          teamId: team1.id,
          invitedUserId: players[4].id,
          inviteType: InvitationType.PLAYER_REQUEST_TO_JOIN,
          status: InvitationStatus.PENDING,
        }),
      );
      await this.invitationRepository.save(
        this.invitationRepository.create({
          teamId: team1.id,
          invitedUserId: players[5].id,
          inviteType: InvitationType.PLAYER_REQUEST_TO_JOIN,
          status: InvitationStatus.PENDING,
        }),
      );
    }

    // 6. Add Challenges
    const existingChallenge = await this.challengeRepository.findOne({
      where: { challengerTeamId: team2.id, challengedTeamId: team1.id },
    });

    if (!existingChallenge) {
      await this.challengeRepository.save(
        this.challengeRepository.create({
          challengerTeamId: team2.id,
          challengedTeamId: team1.id,
          sportType: SportType.FUTSAL,
          proposedMatchDate: new Date('2026-10-25T17:00:00Z'),
          status: ChallengeStatus.PENDING,
        }),
      );
    }

    // 7. Seed Team Reports matching Figma 09 / Reports
    const reportsCount = await this.reportRepository.count();
    if (reportsCount === 0) {
      const demoReports = [
        {
          reportNumber: 'TR-102',
          teamId: team1.id,
          reporterId: players[4].id,
          reason: TeamReportReason.MISLEADING_INFORMATION,
          details:
            'Opponent roster list displayed a player who had not formally completed transfer verification.',
          severity: 'Medium',
          status: TeamReportStatus.OPEN,
        },
        {
          reportNumber: 'TR-105',
          teamId: createdTeams[5].id, // Moratuwa Ballers
          reporterId: manager.id,
          reason: TeamReportReason.ROSTER_ELIGIBILITY_DISPUTE,
          details:
            'Player was not registered on the SportLK platform before match start time.',
          severity: 'High',
          status: TeamReportStatus.IN_REVIEW,
        },
        {
          reportNumber: 'TR-109',
          teamId: createdTeams[3].id, // Negombo FC
          reporterId: players[8].id,
          reason: TeamReportReason.UNSPORTSMANLIKE_CONDUCT,
          details:
            'Dispute occurred during late substitution in 2nd half. Requested referee review of roster roles.',
          severity: 'Low',
          status: TeamReportStatus.RESOLVED,
          resolutionNotes:
            'Reviewed referee scorecard. Clarified substitution protocol with Negombo FC manager.',
        },
        {
          reportNumber: 'TR-114',
          teamId: createdTeams[2].id, // Galle Warriors
          reporterId: players[9].id,
          reason: TeamReportReason.INACTIVE_FORFEIT,
          details:
            'Team arrived 30 minutes after scheduled kickoff date for friendly challenge.',
          severity: 'Low',
          status: TeamReportStatus.DISMISSED,
          resolutionNotes:
            'Adverse weather conditions confirmed along Southern Expressway. Rescheduled challenge.',
        },
      ];

      for (const dr of demoReports) {
        await this.reportRepository.save(
          this.reportRepository.create({
            reportNumber: dr.reportNumber,
            teamId: dr.teamId,
            reporterId: dr.reporterId,
            reason: dr.reason,
            details: dr.details,
            severity: dr.severity,
            status: dr.status,
            resolutionNotes: (dr as any).resolutionNotes || null,
          }),
        );
      }
    }

    return {
      success: true,
      message: 'Demo seed data for Member 2 Team & Squad Management created successfully',
      data: {
        managerId: manager.id,
        teamId: team1.id,
        teamName: team1.teamName,
        teamsCount: createdTeams.length,
      },
    };
  }
}
