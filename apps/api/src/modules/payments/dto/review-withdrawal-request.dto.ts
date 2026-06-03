import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class ReviewWithdrawalRequestDto {
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MinLength(1)
  note?: string;
}
