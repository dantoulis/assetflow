import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { SafeUser } from './types';
import { Role, User } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import type { AuthenticatedRequest } from '../auth/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly saltOrRounds = 10;

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const hasPassword = await bcrypt.hash(createUserDto.password, this.saltOrRounds);
    const data = { ...createUserDto, password: hasPassword, role: Role.USER };
    return await this.prisma.user.create({
      data,
      omit: {
        password: true,
      },
    });
  }

  async findAll(): Promise<SafeUser[]> {
    return await this.prisma.user.findMany({
      omit: { password: true },
    });
  }

  async findOne(id: number): Promise<SafeUser | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async findOneWithCreds(loginUserDto: { username: string }): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: loginUserDto,
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    request: AuthenticatedRequest,
  ): Promise<SafeUser> {
    const userToUpdate = await this.prisma.user.findUnique({
      where: { id },
    });
    const requestingUser = request.user;

    if (!requestingUser) {
      throw new ForbiddenException('You are not authorized to access this resource');
    }

    if (!userToUpdate) {
      throw new NotFoundException('User to update not found');
    }

    if (requestingUser.role !== Role.ADMIN && requestingUser.sub !== id) {
      throw new ForbiddenException('You cannot update another user');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: { password: true },
    });
  }

  async updateRole(id: number, updateUserRoleDto: UpdateUserRoleDto): Promise<SafeUser> {
    const userToUpdate = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    if (userToUpdate.role === Role.ADMIN && updateUserRoleDto.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin accounts cannot be demoted');
    }

    return await this.prisma.user.update({
      where: { id },
      data: updateUserRoleDto,
      omit: { password: true },
    });
  }

  async remove(id: number): Promise<SafeUser> {
    const userToRemove = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userToRemove) {
      throw new NotFoundException('User not found');
    }

    if (userToRemove.role === Role.ADMIN) {
      throw new ForbiddenException('An admin cannot remove another admin');
    }

    return await this.prisma.user.delete({
      where: { id },
      omit: { password: true },
    });
  }
}
