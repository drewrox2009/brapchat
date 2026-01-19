import { IsString } from 'class-validator';

export class TrackGuestDto {
  @IsString()
  deviceId: string;

  @IsString()
  installId: string;

  @IsString()
  rideId: string;
}
