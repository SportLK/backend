import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from '../database/entities/match.entity';
import { MatchScore } from '../database/entities/match-score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchScore])],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
