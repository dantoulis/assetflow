import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/types';
import { Roles } from '../decorators/roles.decorator';
import { AssetRequest, Role } from '../generated/prisma/client';
import { AssetRequestsService } from './asset-requests.service';
import { CreateAssetRequestDto } from './dto/create-asset-request.dto';
import { FulfillAssetRequestDto } from './dto/fulfill-asset-request.dto';
import { ReviewAssetRequestDto } from './dto/review-asset-request.dto';
import { UpdateAssetRequestDto } from './dto/update-asset-request.dto';

@Controller('asset-requests')
export class AssetRequestsController {
  constructor(private readonly assetRequestsService: AssetRequestsService) {}

  @Post()
  async create(
    @Body() createAssetRequestDto: CreateAssetRequestDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<AssetRequest> {
    return this.assetRequestsService.create(createAssetRequestDto, request);
  }

  @Get()
  async findAll(@Req() request: AuthenticatedRequest): Promise<AssetRequest[]> {
    return this.assetRequestsService.findAll(request);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<AssetRequest> {
    return this.assetRequestsService.findOne(id, request);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetRequestDto: UpdateAssetRequestDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<AssetRequest> {
    return this.assetRequestsService.update(id, updateAssetRequestDto, request);
  }

  @Roles([Role.ADMIN])
  @Patch(':id/review')
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewAssetRequestDto: ReviewAssetRequestDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<AssetRequest> {
    return this.assetRequestsService.review(id, reviewAssetRequestDto, request);
  }

  @Roles([Role.ADMIN])
  @Patch(':id/fulfill')
  async fulfill(
    @Param('id', ParseIntPipe) id: number,
    @Body() fulfillAssetRequestDto: FulfillAssetRequestDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<AssetRequest> {
    return this.assetRequestsService.fulfill(id, fulfillAssetRequestDto, request);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<AssetRequest> {
    return this.assetRequestsService.remove(id, request);
  }
}
