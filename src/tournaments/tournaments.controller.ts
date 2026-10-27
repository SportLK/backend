import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentQueryDto } from './dto/tournament-query.dto';
import { UpdateTournamentStatusDto } from './dto/update-tournament-status.dto';
import { RegisterTeamDto } from './dto/register-team.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';
import { GenerateBracketsDto } from './dto/generate-brackets.dto';
import { ScheduleMatchDto, BulkScheduleMatchesDto } from './dto/schedule-match.dto';
import { AdvanceProgressionDto } from './dto/advance-progression.dto';
import { AdminModerateTournamentDto } from './dto/admin-moderate-tournament.dto';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  /**
   * POST /api/v1/tournaments
   * Create a new tournament
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentsService.create(createTournamentDto);
  }

  /**
   * GET /api/v1/tournaments
   * List tournaments with filters (sport, status, organizer, search)
   */
  @Get()
  findAll(@Query() query: TournamentQueryDto) {
    return this.tournamentsService.findAll(query);
  }

  /**
   * GET /api/v1/tournaments/admin/reports
   * Admin dashboard tournament analytics & overview
   */
  @Get('admin/reports')
  getAdminReports() {
    return this.tournamentsService.getAdminReports();
  }

  /**
   * GET /api/v1/tournaments/:id
   * Get tournament details with venue, registrations, matches
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  /**
   * PATCH /api/v1/tournaments/:id
   * Update tournament details
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.update(id, updateTournamentDto);
  }

  /**
   * DELETE /api/v1/tournaments/:id
   * Cancel or delete tournament
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentsService.remove(id);
  }

  /**
   * PATCH /api/v1/tournaments/:id/status
   * Change tournament status (DRAFT, OPEN_FOR_REGISTRATION, ONGOING, COMPLETED, CANCELLED)
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTournamentStatusDto,
  ) {
    return this.tournamentsService.updateStatus(id, dto);
  }

  /**
   * PATCH /api/v1/tournaments/:id/moderate
   * Admin moderation action (APPROVE, SUSPEND, CANCEL)
   */
  @Patch(':id/moderate')
  adminModerate(
    @Param('id') id: string,
    @Body() dto: AdminModerateTournamentDto,
  ) {
    return this.tournamentsService.adminModerate(id, dto);
  }

  /**
   * GET /api/v1/tournaments/:id/venue
   * Get assigned venue details for tournament
   */
  @Get(':id/venue')
  getVenue(@Param('id') id: string) {
    return this.tournamentsService.getVenue(id);
  }

  /**
   * PATCH /api/v1/tournaments/:id/venue/:venueId
   * Assign or change tournament venue
   */
  @Patch(':id/venue/:venueId')
  assignVenue(
    @Param('id') id: string,
    @Param('venueId') venueId: string,
  ) {
    return this.tournamentsService.assignVenue(id, venueId);
  }

  /**
   * POST /api/v1/tournaments/:id/registrations
   * Register a team for the tournament
   */
  @Post(':id/registrations')
  @HttpCode(HttpStatus.CREATED)
  registerTeam(
    @Param('id') id: string,
    @Body() dto: RegisterTeamDto,
  ) {
    return this.tournamentsService.registerTeam(id, dto);
  }

  /**
   * GET /api/v1/tournaments/:id/registrations
   * List all registrations for tournament
   */
  @Get(':id/registrations')
  findAllRegistrations(@Param('id') id: string) {
    return this.tournamentsService.findAllRegistrations(id);
  }

  /**
   * PATCH /api/v1/tournaments/:id/registrations/:registrationId/status
   * Update team registration status (CONFIRMED, PAYMENT_PENDING, DISQUALIFIED)
   */
  @Patch(':id/registrations/:registrationId/status')
  updateRegistrationStatus(
    @Param('id') id: string,
    @Param('registrationId') registrationId: string,
    @Body() dto: UpdateRegistrationStatusDto,
  ) {
    return this.tournamentsService.updateRegistrationStatus(id, registrationId, dto);
  }

  /**
   * DELETE /api/v1/tournaments/:id/registrations/:registrationId
   * Withdraw or remove a registration
   */
  @Delete(':id/registrations/:registrationId')
  removeRegistration(
    @Param('id') id: string,
    @Param('registrationId') registrationId: string,
  ) {
    return this.tournamentsService.removeRegistration(id, registrationId);
  }

  /**
   * GET /api/v1/tournaments/:id/teams
   * List confirmed participating teams
   */
  @Get(':id/teams')
  getConfirmedTeams(@Param('id') id: string) {
    return this.tournamentsService.getConfirmedTeams(id);
  }

  /**
   * POST /api/v1/tournaments/:id/brackets/generate
   * Generate tournament brackets and initial round fixtures
   */
  @Post(':id/brackets/generate')
  @HttpCode(HttpStatus.CREATED)
  generateBrackets(
    @Param('id') id: string,
    @Body() dto: GenerateBracketsDto,
  ) {
    return this.tournamentsService.generateBrackets(id, dto);
  }

  /**
   * GET /api/v1/tournaments/:id/brackets
   * Retrieve bracket tree with rounds and match scores
   */
  @Get(':id/brackets')
  getBracketTree(@Param('id') id: string) {
    return this.tournamentsService.getBracketTree(id);
  }

  /**
   * POST /api/v1/tournaments/:id/progression/advance
   * Advance winner to next round when a tournament match concludes
   */
  @Post(':id/progression/advance')
  advanceProgression(
    @Param('id') id: string,
    @Body() dto: AdvanceProgressionDto,
  ) {
    return this.tournamentsService.advanceProgression(id, dto);
  }

  /**
   * POST /api/v1/tournaments/:id/schedules
   * Bulk schedule tournament matches
   */
  @Post(':id/schedules')
  bulkSchedule(
    @Param('id') id: string,
    @Body() dto: BulkScheduleMatchesDto,
  ) {
    return this.tournamentsService.bulkSchedule(id, dto);
  }

  /**
   * PATCH /api/v1/tournaments/:id/schedules/match
   * Schedule or reschedule an individual tournament match
   */
  @Patch(':id/schedules/match')
  scheduleMatch(
    @Param('id') id: string,
    @Body() dto: ScheduleMatchDto,
  ) {
    return this.tournamentsService.scheduleMatch(id, dto);
  }

  /**
   * GET /api/v1/tournaments/:id/schedules
   * Get all scheduled matches for tournament in chronological order
   */
  @Get(':id/schedules')
  getSchedules(@Param('id') id: string) {
    return this.tournamentsService.getSchedules(id);
  }
}

