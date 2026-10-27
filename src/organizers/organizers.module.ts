import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizersController } from './organizers.controller';
import { OrganizersService } from './organizers.service';
import { RoleApplication } from '../database/entities/role-application.entity';
import { User } from '../database/entities/user.entity';
import { Tournament } from '../database/entities/tournament.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleApplication, User, Tournament]),
  ],
  controllers: [OrganizersController],
  providers: [OrganizersService],
  exports: [OrganizersService],
})
export class OrganizersModule {}

