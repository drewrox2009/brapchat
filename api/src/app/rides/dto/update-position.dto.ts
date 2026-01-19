import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePositionDto {
  @IsString()
  rideId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;
}
