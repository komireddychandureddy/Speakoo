import { IsOptional, IsString, IsInt, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchTutorsDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  minCents?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(100_000)
  @Type(() => Number)
  maxCents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}
