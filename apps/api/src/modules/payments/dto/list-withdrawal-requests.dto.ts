import { IsIn, IsOptional } from 'class-validator';

export class ListWithdrawalRequestsDto {
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'paid'])
  status?: 'pending' | 'approved' | 'rejected' | 'paid';
}
