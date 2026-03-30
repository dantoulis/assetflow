import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { SafeUser } from './types';
import { Role } from '../generated/prisma/enums';
import { Roles } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../auth/types';

@Roles([Role.ADMIN])
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<SafeUser> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<SafeUser[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SafeUser | null> {
    return this.usersService.findOne(id);
  }

  @Roles([Role.ADMIN, Role.USER])
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<SafeUser> {
    return this.usersService.update(id, updateUserDto, request);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SafeUser> {
    return this.usersService.remove(id);
  }

  @Patch(':id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<SafeUser> {
    return this.usersService.updateRole(id, updateUserRoleDto);
  }
}
