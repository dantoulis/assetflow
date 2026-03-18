import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { AssetStatus, AssetType, BillingCycle } from '../../generated/prisma/enums';

export class CreateAssetDto {
  @IsString()
  readonly title!: string;

  @IsEnum(AssetType)
  readonly type!: AssetType;

  @IsEnum(AssetStatus)
  readonly status!: AssetStatus;

  @IsString()
  readonly vendor!: string;

  @IsString()
  readonly reference!: string;

  @IsOptional()
  @IsEnum(BillingCycle)
  readonly billingCycle?: BillingCycle;

  @IsOptional()
  @IsDateString()
  readonly purchasedAt?: string;

  @IsOptional()
  @IsDateString()
  readonly assignedAt?: string;

  @IsOptional()
  @IsDateString()
  readonly renewalAt?: string;

  @IsOptional()
  @IsDateString()
  readonly expiresAt?: string;

  @IsOptional()
  @IsInt()
  readonly seatCount?: number;

  @IsOptional()
  @IsString()
  readonly notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tags?: string[];

  @IsInt()
  readonly userId!: number;
}
