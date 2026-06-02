import { IsOptional, IsString, MinLength } from 'class-validator';

export class SlotsQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  timezone?: string;
}
