import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum RideVisibilityDto {
  OPEN = 'OPEN',
  FRIENDS = 'FRIENDS',
  PREVIOUS_RIDERS = 'PREVIOUS_RIDERS',
  REQUEST_TO_JOIN = 'REQUEST_TO_JOIN',
  PRIVATE = 'PRIVATE',
}

export class CreateRideDto {
  @IsString()
  code: string;

  @IsEnum(RideVisibilityDto)
  visibility: RideVisibilityDto;

  @IsOptional()
  @IsString()
  endpointLabel?: string;
}
