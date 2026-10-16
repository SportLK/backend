import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthUser } from '../common/auth.types';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommunityService } from './community.service';
import { CreateCommentDto, CreateCommunityDto, CreatePostDto, HidePostDto } from './community.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly community: CommunityService) {}

  @Get('communities') listCommunities(@CurrentUser() user: AuthUser) {
    return this.community.listCommunities(user.id);
  }
  @Post('communities') createCommunity(@CurrentUser() user: AuthUser, @Body() dto: CreateCommunityDto) {
    return this.community.createCommunity(user.id, dto);
  }
  @Post('communities/:id/join') joinCommunity(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.community.joinCommunity(id, user.id);
  }
  @Delete('communities/:id/join') leaveCommunity(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.community.leaveCommunity(id, user.id);
  }
  @Get('community/posts') listPosts(@CurrentUser() user: AuthUser) {
    return this.community.listPosts(user.roles.includes('admin'));
  }
  @Post('community/posts') createPost(@CurrentUser() user: AuthUser, @Body() dto: CreatePostDto) {
    return this.community.createPost(user.id, dto);
  }
  @Post('community/posts/:id/like') toggleLike(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.community.toggleLike(id, user.id);
  }
  @Get('community/posts/:id/comments') listComments(@Param('id') id: string) {
    return this.community.listComments(id);
  }
  @Post('community/posts/:id/comments') comment(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCommentDto,
  ) { return this.community.addComment(id, user.id, dto); }
  @Patch('community/posts/:id/moderation')
  @Roles('admin')
  @UseGuards(RolesGuard)
  moderate(@Param('id') id: string, @Body() dto: HidePostDto) {
    return this.community.setPostStatus(id, dto.status);
  }
}
