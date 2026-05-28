import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SocialLoginDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsString()
  captchaToken?: string;
}
