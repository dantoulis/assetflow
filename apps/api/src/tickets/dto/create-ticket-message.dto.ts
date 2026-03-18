import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTicketMessageDto {
  @IsString()
  readonly body!: string;

  @IsOptional()
  @IsBoolean()
  readonly internal?: boolean;
}
