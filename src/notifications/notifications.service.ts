import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notifications: Repository<Notification>) {}

  listForUser(userId: string) {
    return this.notifications.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  create(userId: string, title: string, body: string, kind: string) {
    return this.notifications.save(this.notifications.create({ userId, title, body, kind }));
  }

  async markRead(id: string, userId: string) {
    const notification = await this.notifications.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.readAt = new Date();
    return this.notifications.save(notification);
  }

  async markAllRead(userId: string) {
    await this.notifications.createQueryBuilder().update()
      .set({ readAt: new Date() })
      .where('user_id = :userId AND read_at IS NULL', { userId })
      .execute();
    return { success: true };
  }
}
