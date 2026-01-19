import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { VoiceMetricDto } from './dto/voice-metric.dto';
import { VoiceMetricsService } from './voice-metrics.service';

@UseGuards(SupabaseAuthGuard)
@Controller('voice-metrics')
export class VoiceMetricsController {
  constructor(private readonly voiceMetricsService: VoiceMetricsService) {}

  @Post()
  async record(@Body(new ValidationPipe()) dto: VoiceMetricDto, @Req() request) {
    return this.voiceMetricsService.recordMetric(request.user.id, dto);
  }
}
