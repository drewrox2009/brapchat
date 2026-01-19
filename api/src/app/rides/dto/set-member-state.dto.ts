import { IsBoolean, IsString } from 'class-validator';

export class SetMemberStateDto {
  @IsString()
  rideId: string;

  @IsString()
  memberId: string;

  @IsBoolean()
  muted: boolean;
}
