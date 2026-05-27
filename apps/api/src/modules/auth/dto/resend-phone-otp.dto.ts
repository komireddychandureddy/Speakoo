import { IsString, Matches } from 'class-validator';

export class ResendPhoneOtpDto {
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, {
    message: 'phone must be E.164 format (e.g. +12125551234)',
  })
  phone: string;
}
