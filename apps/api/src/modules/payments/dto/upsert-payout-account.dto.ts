import { IsOptional, IsString, Length, MinLength } from 'class-validator';

export class UpsertPayoutAccountDto {
  @IsString()
  @MinLength(2)
  accountHolderName: string;

  @IsString()
  @Length(4, 34)
  accountNumber: string;

  @IsString()
  @MinLength(2)
  bankName: string;

  @IsString()
  @MinLength(3)
  routingCode: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;
}
