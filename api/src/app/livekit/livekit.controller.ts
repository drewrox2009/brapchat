import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common';

import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CreateTokenDto } from './dto/create-token.dto';
import { LivekitService } from './livekit.service';

@Controller('livekit')
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post('token')
  async createToken(@Body(new ValidationPipe()) body: CreateTokenDto) {
    const roomName = body.rideCode.trim().toUpperCase();
    const participant = body.participantName.trim();
    return this.livekitService.createToken(roomName, participant);
  }
}
