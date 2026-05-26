import { IsEnum, IsString, IsInt, IsDateString, Min, Max, IsOptional } from 'class-validator';
import { PracticeSessionType } from '@prisma/client';

export class CreatePracticeSessionDto {
  @IsString()
  language!: string;

  @IsString()
  level!: string;

  @IsString()
  title!: string;

  @IsString()
  topic!: string;

  @IsEnum(PracticeSessionType)
  type!: PracticeSessionType;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(90)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(10)
  maxParticipants?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  creditCost?: number;
}
