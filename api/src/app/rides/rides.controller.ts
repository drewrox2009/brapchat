import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

import { CreateRideDto } from './dto/create-ride.dto';
import { JoinRideDto } from './dto/join-ride.dto';
import { SetMemberStateDto } from './dto/set-member-state.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { RidesService } from './rides.service';

@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async createRide(
    @Body(new ValidationPipe()) dto: CreateRideDto,
    @Req() request
  ) {
    return this.ridesService.createRide(request.user.id, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('join')
  async joinRide(
    @Body(new ValidationPipe()) dto: JoinRideDto,
    @Req() request
  ) {
    return this.ridesService.joinRide(request.user.id, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('position')
  async updatePosition(
    @Body(new ValidationPipe()) dto: UpdatePositionDto,
    @Req() request
  ) {
    return this.ridesService.updatePosition(request.user.id, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('members')
  async setMemberState(
    @Body(new ValidationPipe()) dto: SetMemberStateDto,
    @Req() request
  ) {
    return this.ridesService.setMemberState(request.user.id, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':rideId/end')
  async endRide(@Param('rideId') rideId: string, @Req() request) {
    return this.ridesService.endRide(request.user.id, rideId);
  }

  @Get('public')
  async listPublicRides() {
    return this.ridesService.listPublicRides();
  }
}
