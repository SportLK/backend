import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Notification } from '../notifications/notification.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/user.entity';
import { RoleApplication } from './role-application.entity';
import { RoleApplicationsController } from './role-applications.controller';
import { RoleApplicationsService } from './role-applications.service';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    TypeOrmModule.forFeature([RoleApplication, User, Notification]),
  ],
  controllers: [RoleApplicationsController],
  providers: [RoleApplicationsService],
})
export class RoleApplicationsModule {}
