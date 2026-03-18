import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetType } from '../../generated/prisma/client';

export class CreateAssetRequestDto {
  @IsString()
  readonly title!: string;

  @IsOptional()
  @IsEnum(AssetType)
  readonly assetType?: AssetType;

  @IsOptional()
  @IsString()
  readonly vendor?: string;

  @IsOptional()
  @IsString()
  readonly justification?: string;
}
