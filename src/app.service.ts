import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus() {
    return {
      status: 'UP',
      service: 'SportLK Backend API',
      timestamp: new Date().toISOString(),
      platform: 'NestJS + MySQL + TypeORM',
      version: '1.0.0',
    };
  }
}
