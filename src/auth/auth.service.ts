import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { createHash } from 'node:crypto';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UsersService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.users.findByEmail(email)) throw new ConflictException('Email is already registered');
    const user = await this.userRepo.save(this.userRepo.create({
      email,
      passwordHash: await hash(dto.password, 12),
      displayName: dto.displayName,
      city: dto.city ?? null,
      sports: [],
      roles: ['player'],
      status: 'active',
    }));
    return this.issue(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findForLogin(dto.email);
    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
    if (user.status !== 'active') throw new UnauthorizedException('This account is not active');
    return this.issue(user);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-key-change-this-before-deploying-000000',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.userRepo.createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id: payload.sub })
      .getOne();
    if (!user || user.status !== 'active' || user.refreshTokenHash !== this.digest(refreshToken)) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    return this.issue(user);
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshTokenHash: null });
    return { success: true };
  }

  private async issue(user: User) {
    const claims = { sub: user.id, email: user.email, roles: user.roles };
    const accessToken = await this.jwt.signAsync(claims, { expiresIn: '15m' });
    const refreshToken = await this.jwt.signAsync(claims, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-key-change-this-before-deploying-000000',
      expiresIn: '30d',
    });
    user.refreshTokenHash = this.digest(refreshToken);
    await this.userRepo.save(user);
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles,
        status: user.status,
        sports: user.sports,
        city: user.city,
      },
    };
  }

  private digest(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
