import { ArrayMinSize, IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePublicTutorApplicationDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  phone?: string;

  @IsString()
  @MinLength(2)
  country!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  city?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languages!: string[];

  @IsString()
  @MinLength(2)
  proficiency!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsString()
  @MinLength(1)
  yearsExp!: string;

  @IsString()
  @MinLength(10)
  bio!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  teachingStyle?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  maxSessions?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  availability!: string[];
}
