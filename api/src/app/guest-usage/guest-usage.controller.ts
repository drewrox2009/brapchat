import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';

import { TrackGuestDto } from './dto/track-guest.dto';
import { GuestUsageService } from './guest-usage.service';

@Controller('guest-usage')
export class GuestUsageController {
  constructor(private readonly guestUsageService: GuestUsageService) {}

  @Post('track')
  async track(@Body(new ValidationPipe()) dto: TrackGuestDto) {
    return this.guestUsageService.trackRide(dto);
  }
}
