import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@motorcycle-group-app/data';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

type AuthUser = Omit<User, 'passwordHash'>;

type AccessTokenResponse = {
  access_token: string;
};

type ScreenNameResponse = Pick<User, 'id' | 'screenName'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (user?.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: AuthUser): Promise<AccessTokenResponse> {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async setScreenName(
    userId: string,
    screenName: string
  ): Promise<ScreenNameResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { screenName },
    });

    if (existing) {
      throw new ConflictException('Screen name is already taken');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { screenName },
      select: {
        id: true,
        screenName: true,
      },
    });
  }
}

