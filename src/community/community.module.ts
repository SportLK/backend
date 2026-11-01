import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommunityController } from './community.controller';
import { Community, CommunityComment, CommunityLike, CommunityMembership, CommunityPost } from './community.entity';
import { CommunityService } from './community.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Community, CommunityPost, CommunityComment, CommunityLike, CommunityMembership])],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
