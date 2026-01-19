import { Module } from '@nestjs/common';

import { VoiceMetricsController } from './voice-metrics.controller';
import { VoiceMetricsService } from './voice-metrics.service';

@Module({
  controllers: [VoiceMetricsController],
  providers: [VoiceMetricsService],
})
export class VoiceMetricsModule {}
