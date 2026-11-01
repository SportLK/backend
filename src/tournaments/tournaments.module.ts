import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from '../database/entities/tournament.entity';
import { TournamentRegistration } from '../database/entities/tournament-registration.entity';
import { TournamentBracket } from '../database/entities/tournament-bracket.entity';
import { TournamentReport } from '../database/entities/tournament-report.entity';
import { Match } from '../database/entities/match.entity';
import { Team } from '../database/entities/team.entity';
import { Venue } from '../database/entities/venue.entity';
import { User } from '../database/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { AdminTournamentsController } from './admin-tournaments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tournament,
      TournamentRegistration,
      TournamentBracket,
      TournamentReport,
      Match,
      Team,
      Venue,
      User,
    ]),
    NotificationsModule,
  ],
  controllers: [TournamentsController, AdminTournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService],
})
export class TournamentsModule {}

