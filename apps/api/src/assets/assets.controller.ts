import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ParseIntPipe } from '@nestjs/common';
import type { Asset } from '../generated/prisma/client';

@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  async create(@Body() createAssetDto: CreateAssetDto): Promise<Asset> {
    return this.assetService.create(createAssetDto);
  }

  @Get()
  async findAll(): Promise<Asset[]> {
    return this.assetService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Asset | null> {
    return this.assetService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetDto: UpdateAssetDto,
  ): Promise<Asset> {
    return this.assetService.update(id, updateAssetDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Asset> {
    return this.assetService.remove(id);
  }
}
