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
  // 6. DEVELOPMENT SEEDING (Helper for immediate end-to-end testing)
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

    // 2. Create sample players
    const samplePlayersData = [
      { name: 'Kavindu Perera', email: 'kavindu@sportlk.com' },
      { name: 'Chamath Silva', email: 'chamath@sportlk.com' },
      { name: 'Malith Bandara', email: 'malith@sportlk.com' },
      { name: 'Ravindu Fernando', email: 'ravindu@sportlk.com' },
      { name: 'Sahan Wickramasinghe', email: 'sahan@sportlk.com' },
      { name: 'Dilshan Fernando', email: 'dilshan@sportlk.com' },
      { name: 'Nuwan Pradeep', email: 'nuwan@sportlk.com' },
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

    // 3. Create or find Primary Team (Colombo Strikers)
    let team1 = await this.teamRepository.findOne({
      where: { teamName: 'Colombo Strikers' },
    });

    if (!team1) {
      team1 = this.teamRepository.create({
        managerId: manager.id,
        teamName: 'Colombo Strikers',
        sportType: SportType.FUTSAL,
        primaryLocationCity: 'Colombo',
        teamBio:
          'A Colombo-based squad united by a love for futsal. Training every Sunday at Colombo Sports Arena.',
        status: TeamStatus.ACTIVE,
      });
      team1 = await this.teamRepository.save(team1);

      // Add Manager as Captain
      await this.memberRepository.save(
        this.memberRepository.create({
          teamId: team1.id,
          userId: manager.id,
          memberRole: TeamMemberRole.CAPTAIN,
          jerseyNumber: 7,
        }),
      );

      // Add other players
      const rosterRoles = [
        { user: players[0], role: TeamMemberRole.SQUAD_PLAYER, jersey: 10 },
        { user: players[1], role: TeamMemberRole.SQUAD_PLAYER, jersey: 1 },
        { user: players[2], role: TeamMemberRole.VICE_CAPTAIN, jersey: 8 },
        { user: players[3], role: TeamMemberRole.SQUAD_PLAYER, jersey: 4 },
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

    // 4. Create Opponent Team (Kandy United)
    let team2 = await this.teamRepository.findOne({
      where: { teamName: 'Kandy United' },
    });

    if (!team2) {
      team2 = this.teamRepository.create({
        managerId: players[4].id, // Sahan as manager
        teamName: 'Kandy United',
        sportType: SportType.FUTSAL,
        primaryLocationCity: 'Kandy',
        teamBio: 'Central Province futsal champions 2025.',
        status: TeamStatus.ACTIVE,
      });
      team2 = await this.teamRepository.save(team2);
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

    return {
      success: true,
      message: 'Demo seed data for Member 2 Team & Squad Management created successfully',
      data: {
        managerId: manager.id,
        teamId: team1.id,
        teamName: team1.teamName,
      },
    };
  }
}
