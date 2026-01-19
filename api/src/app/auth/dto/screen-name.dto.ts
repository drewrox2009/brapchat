import { IsString, MinLength } from 'class-validator';

export class ScreenNameDto {
  @IsString()
  @MinLength(3)
  screenName: string;
}
