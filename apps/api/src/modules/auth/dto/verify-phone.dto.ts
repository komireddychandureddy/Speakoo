import { IsString, Matches, Length } from 'class-validator';

export class VerifyPhoneDto {
  /** E.164 format: +12025550100 */
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'phone must be in E.164 format, e.g. +12025550100' })
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'otp must be exactly 6 digits' })
  otp: string;
}
