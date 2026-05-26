import { IsEnum, IsString, IsOptional, IsArray, ArrayMaxSize } from 'class-validator';
import { ThreadCategory } from '@prisma/client';

export class CreateThreadDto {
  @IsString()
  language!: string;

  @IsString()
  title!: string;

  @IsString()
  body!: string;

  @IsEnum(ThreadCategory)
  category!: ThreadCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  tags?: string[];
}
