import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Asset } from '../generated/prisma/client';
import { Role } from '../generated/prisma/client';
import { AuthenticatedRequest } from '../auth/types';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    return this.prisma.asset.create({ data: createAssetDto });
  }

  async findAll(request: AuthenticatedRequest): Promise<Asset[]> {
    const requestingUser = request.user;

    if (!requestingUser) {
      throw new NotFoundException('User not found');
    }

    if (requestingUser.role === Role.ADMIN) {
      return this.prisma.asset.findMany();
    }

    return this.prisma.asset.findMany({
      where: { userId: requestingUser.sub },
    });
  }

  async findOne(id: number, request: AuthenticatedRequest): Promise<Asset | null> {
    const requestingUser = request.user;
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (!requestingUser) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = requestingUser.role === Role.ADMIN;
    const isAssetOwner = requestingUser.sub === asset.userId;

    if (!isAssetOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to access this asset');
    }

    return asset;
  }

  async update(id: number, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });
  }

  async remove(id: number): Promise<Asset> {
    return this.prisma.asset.delete({
      where: { id },
    });
  }
}
