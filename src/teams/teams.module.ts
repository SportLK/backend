import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../database/entities/team.entity';
import { TeamMember } from '../database/entities/team-member.entity';
import { TeamInvitation } from '../database/entities/team-invitation.entity';
import { TeamChallenge } from '../database/entities/team-challenge.entity';
import { User } from '../database/entities/user.entity';

import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Team,
      TeamMember,
      TeamInvitation,
      TeamChallenge,
      User,
    ]),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
