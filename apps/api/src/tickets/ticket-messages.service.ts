import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/types';
import { PrismaService } from '../prisma/prisma.service';
import { Role, TicketMessage, TicketStatus } from '../generated/prisma/client';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';
import { TicketsService } from './tickets.service';

@Injectable()
export class TicketMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
  ) {}

  async findMessages(ticketId: number, request: AuthenticatedRequest): Promise<TicketMessage[]> {
    const ticket = await this.ticketsService.findAccessibleTicket(ticketId, request);
    const isAdmin = request.user?.role === Role.ADMIN;

    return this.prisma.ticketMessage.findMany({
      where: {
        ticketId: ticket.id,
        internal: isAdmin,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(
    ticketId: number,
    createTicketMessageDto: CreateTicketMessageDto,
    request: AuthenticatedRequest,
  ): Promise<TicketMessage> {
    const user = request.user;
    const ticket = await this.ticketsService.findAccessibleTicket(ticketId, request);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isAdmin = user.role === Role.ADMIN;
    const isInternal = createTicketMessageDto.internal ?? false;

    if (isInternal && !isAdmin) {
      throw new ForbiddenException('Only admins can create internal ticket messages');
    }

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.ticketMessage.create({
        data: {
          ticketId,
          authorId: user.sub,
          body: createTicketMessageDto.body,
          internal: isInternal,
        },
      });

      if (!isInternal) {
        await tx.ticket.update({
          where: { id: ticket.id },
          data: {
            status: isAdmin ? TicketStatus.PENDING_USER : TicketStatus.PENDING_ADMIN,
            resolvedAt: null,
            ...(isAdmin ? { assignedAdminId: user.sub } : {}),
          },
        });
      }

      return message;
    });
  }
}
