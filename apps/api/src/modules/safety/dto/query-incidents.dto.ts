import { IncidentCategory, IncidentPriority, IncidentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class QueryIncidentsDto {
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsEnum(IncidentPriority)
  priority?: IncidentPriority;

  @IsOptional()
  @IsEnum(IncidentCategory)
  category?: IncidentCategory;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
