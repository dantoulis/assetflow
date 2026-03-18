import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import type { AuthenticatedRequest } from '../auth/types';
import { PrismaService } from '../prisma/prisma.service';
import { Ticket, Role } from '../generated/prisma/client';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, request: AuthenticatedRequest): Promise<Ticket> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    const isAdmin = user.role === Role.ADMIN;

    if (createTicketDto.assetId !== undefined) {
      const asset = isAdmin
        ? await this.prisma.asset.findUnique({
            where: { id: createTicketDto.assetId },
          })
        : await this.prisma.asset.findFirst({
            where: {
              id: createTicketDto.assetId,
              userId: user.sub,
            },
          });

      if (!asset) {
        throw new ForbiddenException('You are not allowed to create a ticket for this asset');
      }
    }

    return this.prisma.ticket.create({
      data: {
        subject: createTicketDto.subject,
        category: createTicketDto.category,
        priority: createTicketDto.priority,
        requesterId: user.sub,
        ...(createTicketDto.assetId !== undefined ? { assetId: createTicketDto.assetId } : {}),
      },
    });
  }

  async findAll(request: AuthenticatedRequest): Promise<Ticket[]> {
    const requestingUser = request.user;

    if (!requestingUser) {
      throw new UnauthorizedException();
    }

    if (requestingUser.role === Role.ADMIN) {
      return this.prisma.ticket.findMany();
    }

    return this.prisma.ticket.findMany({
      where: { requesterId: requestingUser.sub },
    });
  }

  async findOne(id: number, request: AuthenticatedRequest): Promise<Ticket> {
    const requestingUser = request.user;
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (!requestingUser) {
      throw new UnauthorizedException();
    }

    const isAdmin = requestingUser.role === Role.ADMIN;
    const isTicketOwner = requestingUser.sub === ticket.requesterId;

    if (!isTicketOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to access this ticket');
    }

    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto,
    });
  }

  async remove(id: number, request: AuthenticatedRequest): Promise<Ticket> {
    const user = request.user;
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    const isAdmin = user.role === Role.ADMIN;
    const isTicketOwner = user.sub === ticket.requesterId;

    if (!isTicketOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to access this ticket');
    }

    return this.prisma.ticket.delete({
      where: { id },
    });
  }
}
