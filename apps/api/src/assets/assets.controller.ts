import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { AssetService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ParseIntPipe } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import type { Asset } from '../generated/prisma/client';
import type { AuthenticatedRequest } from '../auth/types';

@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Roles([Role.ADMIN])
  @Post()
  async create(@Body() createAssetDto: CreateAssetDto): Promise<Asset> {
    return this.assetService.create(createAssetDto);
  }

  @Get()
  async findAll(@Req() request: AuthenticatedRequest): Promise<Asset[]> {
    return this.assetService.findAll(request);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<Asset | null> {
    return this.assetService.findOne(id, request);
  }

  @Roles([Role.ADMIN])
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetDto: UpdateAssetDto,
  ): Promise<Asset> {
    return this.assetService.update(id, updateAssetDto);
  }

  @Roles([Role.ADMIN])
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Asset> {
    return this.assetService.remove(id);
  }
}
