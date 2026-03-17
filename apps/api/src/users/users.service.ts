import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { SafeUser } from './types';
import { Role, User } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

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

  async update(id: number, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: { password: true },
    });
  }

  async updateRole(id: number, updateUserRoleDto: UpdateUserRoleDto): Promise<SafeUser> {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserRoleDto,
      omit: { password: true },
    });
  }

  async remove(id: number): Promise<SafeUser> {
    return await this.prisma.user.delete({
      where: { id },
      omit: { password: true },
    });
  }
}
