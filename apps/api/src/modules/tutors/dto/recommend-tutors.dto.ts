import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RecommendTutorsDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  maxCents?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
