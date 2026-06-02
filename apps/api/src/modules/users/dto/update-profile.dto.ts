import { IsInt, IsOptional, IsString, IsUrl, Matches, MaxLength, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  learningGoals?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  maxBudgetCents?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'phoneNumber must be E.164 format (e.g. +12125551234)' })
  phoneNumber?: string;
}
