import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TicketCategory, TicketPriority, TicketStatus } from '../../generated/prisma/enums';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  readonly subject?: string;

  @IsOptional()
  @IsInt()
  readonly assetId?: number | null;

  @IsOptional()
  @IsInt()
  readonly assignedAdminId?: number | null;

  @IsOptional()
  @IsEnum(TicketCategory)
  readonly category?: TicketCategory;

  @IsOptional()
  @IsEnum(TicketStatus)
  readonly status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  readonly priority?: TicketPriority;
}
