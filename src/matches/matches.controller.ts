import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { MatchQueryDto } from './dto/match-query.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  /**
   * POST /api/v1/matches
   * Schedule a new match at a venue
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  /**
   * GET /api/v1/matches/live
   * Get all live matches with real-time score display
   */
  @Get('live')
  findLiveMatches() {
    return this.matchesService.findLiveMatches();
  }

  /**
   * GET /api/v1/matches
   * Get all matches with optional filters (status, tournament, team, venue, date)
   */
  @Get()
  findAll(@Query() query: MatchQueryDto) {
    return this.matchesService.findAll(query);
  }

  /**
   * GET /api/v1/matches/:id
   * Get full details of a specific match (scorecard, teams, venue)
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  /**
   * PATCH /api/v1/matches/:id/status
   * Update match lifecycle state (SCHEDULED -> LIVE -> COMPLETED)
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateMatchStatusDto,
  ) {
    return this.matchesService.updateStatus(id, updateDto);
  }

  /**
   * PUT /api/v1/matches/:id/score
   * Update current score display and ball-by-ball JSON
   */
  @Put(':id/score')
  updateScore(
    @Param('id') id: string,
    @Body() scoreDto: UpdateScoreDto,
  ) {
    return this.matchesService.updateScore(id, scoreDto);
  }

  /**
   * DELETE /api/v1/matches/:id
   * Delete or cancel a match
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchesService.remove(id);
  }
}
