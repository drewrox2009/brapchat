import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Position, Ride, RideMember } from '@motorcycle-group-app/data';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { JoinRideDto } from './dto/join-ride.dto';
import { SetMemberStateDto } from './dto/set-member-state.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

type RideWithMembers = Ride & { members: RideMember[] };

type PublicRide = Ride & {
  host: { id: string; screenName: string };
  members: RideMember[];
};

@Injectable()
export class RidesService {
  constructor(private readonly prisma: PrismaService) {}

  async createRide(userId: string, dto: CreateRideDto): Promise<RideWithMembers> {
    return this.prisma.ride.create({
      data: {
        code: dto.code,
        hostId: userId,
        visibility: dto.visibility,
        members: {
          create: {
            userId,
            role: 'HOST',
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async joinRide(userId: string, dto: JoinRideDto): Promise<RideWithMembers> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: dto.rideId },
      include: { members: true },
    });

    if (!ride || ride.status !== 'ACTIVE') {
      throw new NotFoundException('Ride not found');
    }

    const existing = ride.members.find((member) => member.userId === userId);
    if (existing) {
      return ride;
    }

    return this.prisma.ride.update({
      where: { id: ride.id },
      data: {
        members: {
          create: {
            userId,
            role: 'MEMBER',
          },
        },
      },
      include: { members: true },
    });
  }

  async updatePosition(
    userId: string,
    dto: UpdatePositionDto
  ): Promise<Position> {
    const member = await this.prisma.rideMember.findUnique({
      where: {
        rideId_userId: {
          rideId: dto.rideId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Ride membership not found');
    }

    return this.prisma.position.create({
      data: {
        rideId: dto.rideId,
        userId,
        ts: new Date(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        speed: dto.speed,
        heading: dto.heading,
        accuracy: dto.accuracy,
      },
    });
  }

  async setMemberState(
    userId: string,
    dto: SetMemberStateDto
  ): Promise<RideMember> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: dto.rideId },
      include: { members: true },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    const host = ride.members.find(
      (member) => member.userId === userId && member.role === 'HOST'
    );
    if (!host) {
      throw new BadRequestException('Only host can update members');
    }

    return this.prisma.rideMember.update({
      where: { id: dto.memberId },
      data: { muted: dto.muted },
    });
  }

  async endRide(userId: string, rideId: string): Promise<Ride> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: { members: true },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    const host = ride.members.find(
      (member) => member.userId === userId && member.role === 'HOST'
    );
    if (!host) {
      throw new BadRequestException('Only host can end ride');
    }

    return this.prisma.ride.update({
      where: { id: rideId },
      data: { status: 'ENDED', endedAt: new Date() },
    });
  }

  async listPublicRides(): Promise<PublicRide[]> {
    return this.prisma.ride.findMany({
      where: {
        status: 'ACTIVE',
        visibility: 'OPEN',
      },
      include: {
        host: true,
        members: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
