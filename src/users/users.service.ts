import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User, BaseRole, ActiveWorkspace, AccountStatus } from './user.entity';
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
      fullName: process.env.ADMIN_NAME ?? 'SportLK Admin',
      baseRole: BaseRole.ADMIN,
      activeWorkspace: ActiveWorkspace.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      bio: null,
      city: null,
      sports: [],
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
    if (dto.displayName !== undefined) user.fullName = dto.displayName;
    if (dto.city !== undefined) user.city = dto.city;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.sports !== undefined) user.sports = dto.sports;
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
