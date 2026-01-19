import { Module } from '@nestjs/common';

import { GuestUsageController } from './guest-usage.controller';
import { GuestUsageService } from './guest-usage.service';

@Module({
  controllers: [GuestUsageController],
  providers: [GuestUsageService],
})
export class GuestUsageModule {}
