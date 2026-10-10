import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * GET /api/v1/statistics/overview
   * Platform overview KPIs for Next.js Admin Dashboard (FR-30, UC-17)
   */
  @Get('overview')
  getOverview() {
    return this.statisticsService.getOverview();
  }

  /**
   * GET /api/v1/statistics/matches
   * Sports breakdown & recent match performance metrics
   */
  @Get('matches')
  getMatchStatistics() {
    return this.statisticsService.getMatchStatistics();
  }

  /**
   * GET /api/v1/statistics/venues
   * Venue hosting frequency, city distribution, and facility metrics
   */
  @Get('venues')
  getVenueStatistics() {
    return this.statisticsService.getVenueStatistics();
  }

  /**
   * GET /api/v1/statistics/teams/:id
   * Performance analytics for a specific team (win rate, head-to-head)
   */
  @Get('teams/:id')
  getTeamStatistics(@Param('id') id: string) {
    return this.statisticsService.getTeamStatistics(id);
  }

  /**
   * GET /api/v1/statistics/players/:id
   * Individual player participation & team metrics
   */
  @Get('players/:id')
  getPlayerStatistics(@Param('id') id: string) {
    return this.statisticsService.getPlayerStatistics(id);
  }
}
