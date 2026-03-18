import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Roles } from '../decorators/roles.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import type { AuthenticatedRequest } from '../auth/types';
import { Ticket, Role } from '../generated/prisma/client';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto, request);
  }

  @Get()
  async findAll(@Req() request: AuthenticatedRequest): Promise<Ticket[]> {
    return this.ticketsService.findAll(request);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<Ticket> {
    return this.ticketsService.findOne(id, request);
  }

  @Roles([Role.ADMIN])
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<Ticket> {
    return this.ticketsService.remove(id, request);
  }
}
