import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthUser } from '../common/auth.types';
import {
  CreateTournamentDto,
  UpdateTournamentDto,
  QueryTournamentsDto,
  RegisterTeamDto,
  UpdateRegistrationStatusDto,
  GenerateBracketDto,
  UpdateBracketMatchDto,
  CreateTournamentReportDto,
} from './dto';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  // =========================================================================
  // 1. TOURNAMENT CRUD & SEARCH
  // =========================================================================

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createTournament(@CurrentUser() user: AuthUser, @Body() dto: CreateTournamentDto) {
    return this.tournamentsService.createTournament(user.id, dto);
  }

  @Get()
  findAll(@Query() query: QueryTournamentsDto) {
    return this.tournamentsService.findAll(query);
  }

  @Get('workspace/mine')
  @UseGuards(JwtAuthGuard)
  getOrganizerWorkspace(@CurrentUser() user: AuthUser) {
    return this.tournamentsService.getOrganizerWorkspace(user.id);
  }

  @Post('seed-demo')
  @HttpCode(HttpStatus.OK)
  seedDemoData() {
    return this.tournamentsService.seedDemoData();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateTournament(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateTournamentDto,
  ) {
    const isAdmin = user.roles.includes('admin');
    return this.tournamentsService.updateTournament(id, user.id, dto, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteTournament(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const isAdmin = user.roles.includes('admin');
    return this.tournamentsService.deleteTournament(id, user.id, isAdmin);
  }

  // =========================================================================
  // 2. REGISTRATIONS
  // =========================================================================

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  registerTeam(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RegisterTeamDto,
  ) {
    return this.tournamentsService.registerTeam(id, user.id, dto);
  }

  @Get(':id/registrations')
  listRegistrations(@Param('id') id: string) {
    return this.tournamentsService.listRegistrations(id);
  }

  @Patch(':id/registrations/:regId')
  @UseGuards(JwtAuthGuard)
  updateRegistrationStatus(
    @Param('id') id: string,
    @Param('regId') regId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateRegistrationStatusDto,
  ) {
    const isAdmin = user.roles.includes('admin');
    return this.tournamentsService.updateRegistrationStatus(id, regId, user.id, dto, isAdmin);
  }

  // =========================================================================
  // 3. BRACKETS, SCHEDULES & PROGRESSION
  // =========================================================================

  @Post(':id/generate-bracket')
  @UseGuards(JwtAuthGuard)
  generateBracket(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: GenerateBracketDto,
  ) {
    const isAdmin = user.roles.includes('admin');
    return this.tournamentsService.generateBracket(id, user.id, dto, isAdmin);
  }

  @Get(':id/bracket')
  getBracketTree(@Param('id') id: string) {
    return this.tournamentsService.getBracketTree(id);
  }

  @Patch(':id/bracket/:bracketId/winner')
  @UseGuards(JwtAuthGuard)
  advanceMatchWinner(
    @Param('id') id: string,
    @Param('bracketId') bracketId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateBracketMatchDto,
  ) {
    const isAdmin = user.roles.includes('admin');
    return this.tournamentsService.advanceMatchWinner(id, bracketId, dto.winnerTeamId, user.id, isAdmin);
  }

  @Get(':id/schedules')
  getSchedules(@Param('id') id: string) {
    return this.tournamentsService.getSchedules(id);
  }

  // =========================================================================
  // 4. TOURNAMENT REPORTS (USER INITIATED)
  // =========================================================================

  @Post(':id/reports')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createReport(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTournamentReportDto,
  ) {
    return this.tournamentsService.createReport(id, user.id, dto);
  }
}

