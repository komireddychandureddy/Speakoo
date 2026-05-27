import { IsString, Matches, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterPhoneDto {
  /** E.164 format: +12025550100 */
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'phone must be in E.164 format, e.g. +12025550100' })
  phone: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  fullName: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
