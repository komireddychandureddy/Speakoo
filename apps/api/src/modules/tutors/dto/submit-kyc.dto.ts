import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class SubmitKycDto {
  @IsString()
  @MinLength(2)
  documentType!: string;

  @IsUrl()
  documentFrontUrl!: string;

  @IsOptional()
  @IsUrl()
  documentBackUrl?: string;

  @IsOptional()
  @IsUrl()
  selfieUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  note?: string;
}
