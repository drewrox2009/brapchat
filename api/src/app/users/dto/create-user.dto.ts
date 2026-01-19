import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  screenName: string;

  @IsString()
  @MinLength(8)
  password: string;
}

