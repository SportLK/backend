import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthUser } from '../common/auth.types';
import { TournamentStatus } from '../database/entities/tournament.entity';
import { TournamentReportStatus } from '../database/entities/tournament-report.entity';
import {
  QueryTournamentsDto,
  ResolveTournamentReportDto,
} from './dto';

@Controller('admin/tournaments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminTournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  // =========================================================================
  // 1. ADMIN TOURNAMENT MANAGEMENT & MODERATION
  // =========================================================================

  @Get()
  getAllTournaments(@Query() query: QueryTournamentsDto) {
    return this.tournamentsService.findAll(query);
  }

  @Patch(':id/status')
  updateTournamentStatus(
    @Param('id') id: string,
    @CurrentUser() admin: AuthUser,
    @Body('status') status: TournamentStatus,
  ) {
    return this.tournamentsService.updateTournament(
      id,
      admin.id,
      { tournamentStatus: status },
      true,
    );
  }

  @Delete(':id')
  deleteTournament(@Param('id') id: string, @CurrentUser() admin: AuthUser) {
    return this.tournamentsService.deleteTournament(id, admin.id, true);
  }

  // =========================================================================
  // 2. ADMIN TOURNAMENT REPORTS & DISPUTES
  // =========================================================================

  @Get('reports')
  listReports(@Query('status') status?: TournamentReportStatus) {
    return this.tournamentsService.listReports(status);
  }

  @Patch('reports/:reportId/resolve')
  resolveReport(
    @Param('reportId') reportId: string,
    @CurrentUser() admin: AuthUser,
    @Body() dto: ResolveTournamentReportDto,
  ) {
    return this.tournamentsService.resolveReport(reportId, admin.id, dto);
  }

  @Post('seed-demo')
  @HttpCode(HttpStatus.OK)
  seedDemo() {
    return this.tournamentsService.seedDemoData();
  }
}

