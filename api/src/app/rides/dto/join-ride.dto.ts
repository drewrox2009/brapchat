import { IsString } from 'class-validator';

export class JoinRideDto {
  @IsString()
  rideId: string;
}
