import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '../generated/prisma/client';
import type { AuthenticatedRequest } from '../auth/types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import type { AuthAccountWithUser, SafeUser, SocialProfile } from './types';
import { faker } from '@faker-js/faker';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly saltOrRounds = 10;

  private trimLowercaseEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private trimEmail(username: string): string {
    return username.trim();
  }

  private async isExistingUser(createUserDto: CreateUserDto): Promise<boolean> {
    const foundUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: createUserDto.username.trim().toLocaleLowerCase(),
              mode: 'insensitive',
            },
          },
          {
            email: {
              equals: createUserDto.password.trim(),
              mode: 'insensitive',
            },
          },
        ],
      },
      select: { id: true },
    });

    return Boolean(foundUser);
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const isExistingUser = await this.isExistingUser(createUserDto);

    if (isExistingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, this.saltOrRounds);

    return await this.prisma.user.create({
      data: {
        ...createUserDto,
        username: this.trimEmail(createUserDto.username),
        email: this.trimLowercaseEmail(createUserDto.email),
        password: hashedPassword,
        role: Role.USER,
      },
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

  async findOneAuthAccount(profile: SocialProfile): Promise<AuthAccountWithUser | null> {
    return await this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
      },
    });
  }

  async findOneByEmail(email: string): Promise<SafeUser | null> {
    return await this.prisma.user.findFirst({
      where: {
        email: {
          equals: this.trimLowercaseEmail(email),
          mode: 'insensitive',
        },
      },
      omit: { password: true },
    });
  }

  async linkSocialAccount(userId: number, profile: SocialProfile): Promise<void> {
    await this.prisma.authAccount.create({
      data: {
        userId,
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
        providerEmail: profile.email ? this.trimLowercaseEmail(profile.email) : undefined,
      },
    });
  }

  private async buildSocialUsername(profile: SocialProfile): Promise<string> {
    let username =
      profile.username ??
      profile.name ??
      profile.email?.split('@')[0] ??
      `${profile.provider}-user`;

    const maybeExistingUser = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (maybeExistingUser) {
      username = `${username}-${faker.number.int({ min: 1, max: 1000 })}`;
    }

    return username;
  }

  async createSocialUser(profile: SocialProfile): Promise<SafeUser> {
    if (!profile.email) {
      throw new BadRequestException('Social profile email is required');
    }

    const username = await this.buildSocialUsername(profile);
    const socialUser = await this.prisma.user.create({
      data: {
        email: this.trimLowercaseEmail(profile.email),
        username,
        password: null,
        name: profile.name,
        role: Role.USER,
        authAccounts: {
          create: {
            provider: profile.provider,
            providerAccountId: profile.providerAccountId,
            providerEmail: this.trimLowercaseEmail(profile.email),
          },
        },
      },
      omit: { password: true },
    });

    return socialUser;
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
