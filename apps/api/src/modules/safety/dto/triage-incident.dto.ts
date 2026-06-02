import { IncidentPriority, IncidentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class TriageIncidentDto {
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsEnum(IncidentPriority)
  priority?: IncidentPriority;

  @IsOptional()
  @IsString()
  @MinLength(1)
  adminNote?: string;
}
