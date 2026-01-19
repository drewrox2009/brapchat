import { ConflictException, Injectable } from '@nestjs/common';
import type { User } from '@motorcycle-group-app/data';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

type CreatedUser = Pick<User, 'id' | 'email' | 'screenName' | 'createdAt'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(createUserDto: CreateUserDto): Promise<CreatedUser> {
    const { email, password, screenName } = createUserDto;

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingScreenName = await this.prisma.user.findUnique({
      where: { screenName },
    });
    if (existingScreenName) {
      throw new ConflictException('Screen name is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        screenName,
        authProviders: ['email'],
      },
      select: {
        id: true,
        email: true,
        screenName: true,
        createdAt: true,
      },
    });
  }
}

