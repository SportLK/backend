import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { BracketService } from './bracket.service';
import { Tournament } from '../database/entities/tournament.entity';
import { TournamentRegistration } from '../database/entities/tournament-registration.entity';
import { TournamentBracket } from '../database/entities/tournament-bracket.entity';
import { Match } from '../database/entities/match.entity';
import { MatchScore } from '../database/entities/match-score.entity';
import { Venue } from '../database/entities/venue.entity';
import { User } from '../database/entities/user.entity';
import { Team } from '../database/entities/team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tournament,
      TournamentRegistration,
      TournamentBracket,
      Match,
      MatchScore,
      Venue,
      User,
      Team,
    ]),
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService, BracketService],
  exports: [TournamentsService, BracketService],
})
export class TournamentsModule {}

