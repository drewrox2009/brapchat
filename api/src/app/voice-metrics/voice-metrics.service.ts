import { Injectable } from '@nestjs/common';
import type { VoiceMetric } from '@motorcycle-group-app/data';

import { PrismaService } from '../prisma/prisma.service';
import { VoiceMetricDto } from './dto/voice-metric.dto';

@Injectable()
export class VoiceMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordMetric(userId: string, dto: VoiceMetricDto): Promise<VoiceMetric> {
    return this.prisma.voiceMetric.create({
      data: {
        rideId: dto.rideId,
        userId,
        rttMs: dto.rttMs,
        jitterMs: dto.jitterMs,
        packetLoss: dto.packetLoss,
        bitrateKbps: dto.bitrateKbps,
        reconnectCount: dto.reconnectCount,
      },
    });
  }
}
