import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password too short' })
  @MaxLength(128)
  password: string;
}
