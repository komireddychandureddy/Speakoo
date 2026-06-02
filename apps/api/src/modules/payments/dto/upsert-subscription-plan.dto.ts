import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class UpsertSubscriptionPlanDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @MinLength(2)
  code!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsIn(['monthly', 'yearly'])
  interval!: 'monthly' | 'yearly';

  @IsInt()
  @Min(1)
  priceCents!: number;

  @IsInt()
  @Min(0)
  includedCredits!: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  stripePriceId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
