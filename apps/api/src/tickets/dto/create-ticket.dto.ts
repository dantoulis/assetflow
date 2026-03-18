import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TicketCategory, TicketPriority } from '../../generated/prisma/enums';

export class CreateTicketDto {
  @IsString()
  readonly subject!: string;

  @IsOptional()
  @IsInt()
  readonly assetId?: number;

  @IsEnum(TicketCategory)
  readonly category!: TicketCategory;

  @IsEnum(TicketPriority)
  readonly priority!: TicketPriority;
}
