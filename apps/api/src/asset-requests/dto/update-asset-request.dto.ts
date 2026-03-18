import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetType } from '../../generated/prisma/client';

export class UpdateAssetRequestDto {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsEnum(AssetType)
  readonly assetType?: AssetType | null;

  @IsOptional()
  @IsString()
  readonly vendor?: string | null;

  @IsOptional()
  @IsString()
  readonly justification?: string | null;
}
