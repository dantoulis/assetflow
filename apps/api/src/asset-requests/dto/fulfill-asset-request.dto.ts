import { IsInt } from 'class-validator';

export class FulfillAssetRequestDto {
  @IsInt()
  readonly fulfilledAssetId!: number;
}
