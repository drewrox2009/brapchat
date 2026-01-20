import { IsString } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  rideCode: string;

  @IsString()
  participantName: string;
}
