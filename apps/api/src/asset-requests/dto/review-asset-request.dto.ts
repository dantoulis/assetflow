import { IsIn, IsOptional, IsString } from 'class-validator';
import { AssetRequestStatus } from '../../generated/prisma/client';

export class ReviewAssetRequestDto {
  @IsIn([AssetRequestStatus.APPROVED, AssetRequestStatus.REJECTED])
  readonly status!: AssetRequestStatus;

  @IsOptional()
  @IsString()
  readonly rejectionReason?: string;
}
