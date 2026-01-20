import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePositionDto {
  @IsString()
  @MinLength(4)
  code: string;

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
