import { IsInt, Min } from 'class-validator';

export class CreateWithdrawalRequestDto {
  @IsInt()
  @Min(5000)
  amountCents: number;
}
