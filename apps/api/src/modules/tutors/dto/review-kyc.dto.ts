import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class ReviewKycDto {
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  @MinLength(1)
  note?: string;
}
