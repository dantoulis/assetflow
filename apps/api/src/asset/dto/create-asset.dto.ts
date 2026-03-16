import { IsEnum, IsString, IsInt } from 'class-validator';
import { AssetType } from '../../generated/prisma/enums';

export class CreateAssetDto {
  @IsString()
  readonly title!: string;

  @IsEnum(AssetType)
  readonly type!: AssetType;

  @IsInt()
  readonly userId!: number;
}
