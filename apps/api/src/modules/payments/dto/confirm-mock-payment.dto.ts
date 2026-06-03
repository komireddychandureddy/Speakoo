import { IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class ConfirmMockPaymentDto {
  @IsIn(['booking', 'credit_purchase', 'wallet_topup'])
  kind: 'booking' | 'credit_purchase' | 'wallet_topup';

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsOptional()
  @IsUUID()
  bundleId?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  amountCents?: number;
}