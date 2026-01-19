import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class VoiceMetricDto {
  @IsString()
  rideId: string;

  @IsInt()
  @IsOptional()
  rttMs?: number;

  @IsInt()
  @IsOptional()
  jitterMs?: number;

  @IsNumber()
  @IsOptional()
  packetLoss?: number;

  @IsInt()
  @IsOptional()
  bitrateKbps?: number;

  @IsInt()
  @IsOptional()
  reconnectCount?: number;
}
