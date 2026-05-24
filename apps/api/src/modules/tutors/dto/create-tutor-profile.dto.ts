import { IsArray, IsInt, IsOptional, IsUrl, ArrayMaxSize, Min, Max } from 'class-validator';

export class CreateTutorProfileDto {
  @IsArray()
  @ArrayMaxSize(10)
  languagesTaught: string[];

  @IsInt()
  @Min(100)
  @Max(100_000)
  hourlyRateCents: number;

  @IsArray()
  @ArrayMaxSize(6)
  cefrSpecialties: string[];

  @IsOptional()
  @IsUrl()
  introVideoUrl?: string;
}
