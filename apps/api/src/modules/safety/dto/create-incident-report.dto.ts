import { IncidentCategory, IncidentPriority } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateIncidentReportDto {
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsOptional()
  @IsUUID()
  reportedUserId?: string;

  @IsEnum(IncidentCategory)
  category!: IncidentCategory;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsOptional()
  @IsEnum(IncidentPriority)
  priority?: IncidentPriority;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  evidenceUrls?: string[];
}
