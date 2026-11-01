import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../common/auth.types';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CreateRoleApplicationDto, ReviewRoleApplicationDto } from './role-application.dto';
import { RoleApplicationsService } from './role-applications.service';

@Controller('role-applications')
@UseGuards(JwtAuthGuard)
export class RoleApplicationsController {
  constructor(private readonly applications: RoleApplicationsService) {}

  @Post() create(@CurrentUser() user: AuthUser, @Body() dto: CreateRoleApplicationDto) {
    return this.applications.create(user.id, dto);
  }
  @Get('mine') mine(@CurrentUser() user: AuthUser) { return this.applications.listMine(user.id); }
  @Get('pending')
  @Roles('admin')
  @UseGuards(RolesGuard)
  pending() { return this.applications.listPending(); }
  @Patch(':id/review')
  @Roles('admin')
  @UseGuards(RolesGuard)
  review(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: ReviewRoleApplicationDto) {
    return this.applications.review(id, user.id, dto);
  }
}
