import { Injectable } from '@nestjs/common';
import type { GuestUsage } from '@motorcycle-group-app/data';

import { PrismaService } from '../prisma/prisma.service';
import { TrackGuestDto } from './dto/track-guest.dto';

const RIDE_LIMIT = 5;
const ROLLING_DAYS = 30;

@Injectable()
export class GuestUsageService {
  constructor(private readonly prisma: PrismaService) {}

  async trackRide(dto: TrackGuestDto): Promise<GuestUsage> {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() - ROLLING_DAYS);

    const existing = await this.prisma.guestUsage.findFirst({
      where: { deviceId: dto.deviceId, installId: dto.installId },
    });

    if (!existing) {
      return this.prisma.guestUsage.create({
        data: {
          deviceId: dto.deviceId,
          installId: dto.installId,
          rideCount: 1,
          windowStart: now,
          lastRideAt: now,
          lastRideId: dto.rideId,
        },
      });
    }

    const withinWindow = existing.windowStart >= windowStart;
    const rideCount = withinWindow ? existing.rideCount + 1 : 1;
    const cooldownUntil =
      rideCount > RIDE_LIMIT ? this.addDays(now, ROLLING_DAYS) : null;

    return this.prisma.guestUsage.update({
      where: { id: existing.id },
      data: {
        rideCount,
        windowStart: withinWindow ? existing.windowStart : now,
        cooldownUntil,
        lastRideAt: now,
        lastRideId: dto.rideId,
      },
    });
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }
}
