import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAssetDto: CreateAssetDto) {
    return this.prisma.asset.create({ data: createAssetDto });
  }

  findAll() {
    return this.prisma.asset.findMany();
  }

  findOne(id: number) {
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });
  }

  update(id: number, updateAssetDto: UpdateAssetDto) {
    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });
  }

  remove(id: number) {
    return this.prisma.asset.delete({
      where: { id },
    });
  }
}
