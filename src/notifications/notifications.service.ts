import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notifications: Repository<Notification>) {}

  listForUser(userId: string) {
    return this.notifications.find({ where: { recipientId: userId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  create(userId: string, title: string, body: string, kind = 'SYSTEM') {
    const notificationType = (kind?.toUpperCase() in NotificationType)
      ? (kind.toUpperCase() as NotificationType)
      : NotificationType.SYSTEM;

    return this.notifications.save(this.notifications.create({
      recipientId: userId,
      notificationTitle: title,
      notificationBody: body,
      notificationType,
      isRead: false,
    }));
  }

  async markRead(id: string, userId: string) {
    const notification = await this.notifications.findOne({ where: { id, recipientId: userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.isRead = true;
    return this.notifications.save(notification);
  }

  async markAllRead(userId: string) {
    await this.notifications.createQueryBuilder().update()
      .set({ isRead: true })
      .where('recipient_id = :userId AND is_read = false', { userId })
      .execute();
    return { success: true };
  }
}
