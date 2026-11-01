import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateProfileDto } from './user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL?.toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password || await this.findByEmail(email)) return;
    await this.users.save(this.users.create({
      email,
      passwordHash: await hash(password, 12),
      displayName: process.env.ADMIN_NAME ?? 'SportLK Admin',
      bio: null,
      city: null,
      sports: [],
      roles: ['admin'],
      status: 'active',
    }));
  }

  findById(id: string) {
    return this.users.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  async findForLogin(email: string) {
    return this.users.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async list() {
    return this.users.find({ order: { createdAt: 'DESC' } });
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    return this.users.save(user);
  }

  async updateStatus(id: string, status: 'active' | 'suspended' | 'disabled') {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.status = status;
    if (status !== 'active') user.refreshTokenHash = null;
    return this.users.save(user);
  }
}
