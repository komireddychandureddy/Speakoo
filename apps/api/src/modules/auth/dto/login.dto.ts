import { IsEmail, IsOptional, IsString, ValidateIf, Matches } from 'class-validator';

export class LoginDto {
  /** Email address (required if phone is not provided) */
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  email?: string;

  /** Phone number in E.164 format: +12025550100 (required if email is not provided) */
  @ValidateIf((o) => !o.email)
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'phone must be in E.164 format, e.g. +12025550100' })
  phone?: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  captchaToken?: string;
}
