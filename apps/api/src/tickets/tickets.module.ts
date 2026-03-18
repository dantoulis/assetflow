import { Module } from '@nestjs/common';
import { TicketMessagesService } from './ticket-messages.service';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketMessagesService],
  exports: [TicketsService, TicketMessagesService],
})
export class TicketsModule {}
