import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { CommunityModule } from './community/community.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { RoleApplicationsModule } from './role-applications/role-applications.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        if (config.NODE_ENV === 'production') {
          if (!config.JWT_ACCESS_SECRET || config.JWT_ACCESS_SECRET.length < 32) {
            throw new Error('Set JWT_ACCESS_SECRET to a random value of at least 32 characters.');
          }
          if (!config.JWT_REFRESH_SECRET || config.JWT_REFRESH_SECRET.length < 32) {
            throw new Error('Set JWT_REFRESH_SECRET to a separate random value of at least 32 characters.');
          }
        }
        return config;
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'sportlk',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      retryAttempts: 3,
    }),
    UsersModule,
    CommonModule,
    AuthModule,
    CommunityModule,
    RoleApplicationsModule,
    ReportsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
