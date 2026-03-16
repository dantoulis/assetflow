import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Asset } from '../generated/prisma/client';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    return this.prisma.asset.create({ data: createAssetDto });
  }

  async findAll(): Promise<Asset[]> {
    return this.prisma.asset.findMany();
  }

  async findOne(id: number): Promise<Asset | null> {
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });
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
