import { IsString, MinLength } from 'class-validator';

export class JoinRideDto {
  @IsString()
  @MinLength(4)
  code: string;
}
