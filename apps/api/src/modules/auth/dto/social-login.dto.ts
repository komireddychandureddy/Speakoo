import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class SocialLoginDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'captchaToken must not be empty' })
  captchaToken?: string;
}
