import { IsEmail, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsString()
  displayName: string;

  /** Optional phone number in E.164 format: +12025550100 */
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'phone must be in E.164 format, e.g. +12025550100' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  captchaToken?: string;
}
