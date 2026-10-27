import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrganizersService } from './organizers.service';
import { ApplyOrganizerDto } from './dto/apply-organizer.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { OrganizerApplicationQueryDto } from './dto/organizer-application-query.dto';

@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) {}

  /**
   * POST /api/v1/organizers/apply
   * User submits an application to become a Tournament Organizer
   */
  @Post('apply')
  @HttpCode(HttpStatus.CREATED)
  apply(@Body() dto: ApplyOrganizerDto) {
    return this.organizersService.apply(dto);
  }

  /**
   * GET /api/v1/organizers/applications
   * Admin retrieves organizer applications (supports ?status=PENDING&userId=...)
   */
  @Get('applications')
  findAllApplications(@Query() query: OrganizerApplicationQueryDto) {
    return this.organizersService.findAllApplications(query);
  }

  /**
   * GET /api/v1/organizers/applications/:id
   * Admin or applicant retrieves details of a specific application
   */
  @Get('applications/:id')
  findApplicationById(@Param('id') id: string) {
    return this.organizersService.findApplicationById(id);
  }

  /**
   * PATCH /api/v1/organizers/applications/:id/review
   * Admin approves or rejects organizer application
   */
  @Patch('applications/:id/review')
  reviewApplication(
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.organizersService.reviewApplication(id, dto);
  }

  /**
   * GET /api/v1/organizers/check-status/:userId
   * Check organizer privileges and latest application status for a user
   */
  @Get('check-status/:userId')
  checkOrganizerStatus(@Param('userId') userId: string) {
    return this.organizersService.checkOrganizerStatus(userId);
  }

  /**
   * GET /api/v1/organizers
   * List all approved tournament organizers
   */
  @Get()
  findAllOrganizers() {
    return this.organizersService.findAllOrganizers();
  }

  /**
   * GET /api/v1/organizers/:id/tournaments
   * Get all tournaments created by a specific organizer
   */
  @Get(':id/tournaments')
  findOrganizerTournaments(@Param('id') id: string) {
    return this.organizersService.findOrganizerTournaments(id);
  }
}

