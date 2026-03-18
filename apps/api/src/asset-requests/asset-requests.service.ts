import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AssetRequest, AssetRequestStatus, Role } from '../generated/prisma/client';
import type { AuthenticatedRequest } from '../auth/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetRequestDto } from './dto/create-asset-request.dto';
import { FulfillAssetRequestDto } from './dto/fulfill-asset-request.dto';
import { ReviewAssetRequestDto } from './dto/review-asset-request.dto';
import { UpdateAssetRequestDto } from './dto/update-asset-request.dto';

@Injectable()
export class AssetRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createAssetRequestDto: CreateAssetRequestDto,
    request: AuthenticatedRequest,
  ): Promise<AssetRequest> {
    const user = request.user;
    const { title, assetType, vendor, justification } = createAssetRequestDto;

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.prisma.assetRequest.create({
      data: {
        title,
        requesterId: user.sub,
        assetType,
        vendor,
        justification,
      },
    });
  }

  async findAll(request: AuthenticatedRequest): Promise<AssetRequest[]> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.role === Role.ADMIN) {
      return this.prisma.assetRequest.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.assetRequest.findMany({
      where: { requesterId: user.sub },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, request: AuthenticatedRequest): Promise<AssetRequest> {
    const user = request.user;
    const assetRequest = await this.prisma.assetRequest.findUnique({
      where: { id },
    });

    if (!assetRequest) {
      throw new NotFoundException('Asset request not found');
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    const isAdmin = user.role === Role.ADMIN;
    const isOwner = user.sub === assetRequest.requesterId;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to access this asset request');
    }

    return assetRequest;
  }

  async update(
    id: number,
    updateAssetRequestDto: UpdateAssetRequestDto,
    request: AuthenticatedRequest,
  ): Promise<AssetRequest> {
    const user = request.user;
    const assetRequest = await this.prisma.assetRequest.findUnique({
      where: { id },
    });

    if (!assetRequest) {
      throw new NotFoundException('Asset request not found');
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    const isAdmin = user.role === Role.ADMIN;
    const isOwner = user.sub === assetRequest.requesterId;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to update this asset request');
    }

    if (!isAdmin && assetRequest.status !== AssetRequestStatus.PENDING) {
      throw new ForbiddenException('Only pending asset requests can be edited');
    }

    return this.prisma.assetRequest.update({
      where: { id },
      data: updateAssetRequestDto,
    });
  }

  async review(
    id: number,
    reviewAssetRequestDto: ReviewAssetRequestDto,
    request: AuthenticatedRequest,
  ): Promise<AssetRequest> {
    const user = request.user;
    const assetRequest = await this.prisma.assetRequest.findUnique({
      where: { id },
    });

    if (!assetRequest) {
      throw new NotFoundException('Asset request not found');
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    if (assetRequest.status === AssetRequestStatus.FULFILLED) {
      throw new BadRequestException('Fulfilled asset requests cannot be reviewed again');
    }

    return this.prisma.assetRequest.update({
      where: { id },
      data: {
        status: reviewAssetRequestDto.status,
        reviewedById: user.sub,
        reviewedAt: new Date(),
      },
    });
  }

  async fulfill(
    id: number,
    fulfillAssetRequestDto: FulfillAssetRequestDto,
    request: AuthenticatedRequest,
  ): Promise<AssetRequest> {
    const user = request.user;
    const assetRequest = await this.prisma.assetRequest.findUnique({
      where: { id },
    });

    if (!assetRequest) {
      throw new NotFoundException('Asset request not found');
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    if (assetRequest.status === AssetRequestStatus.REJECTED) {
      throw new BadRequestException('Rejected asset requests cannot be fulfilled');
    }

    if (assetRequest.status === AssetRequestStatus.FULFILLED) {
      throw new BadRequestException('Asset request is already fulfilled');
    }

    const asset = await this.prisma.asset.findUnique({
      where: { id: fulfillAssetRequestDto.fulfilledAssetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset.userId !== assetRequest.requesterId) {
      throw new BadRequestException(
        'The fulfilled asset must belong to the same user who requested it',
      );
    }

    return this.prisma.assetRequest.update({
      where: { id },
      data: {
        status: AssetRequestStatus.FULFILLED,
        fulfilledAssetId: fulfillAssetRequestDto.fulfilledAssetId,
        reviewedById: user.sub,
        reviewedAt: new Date(),
      },
    });
  }

  async remove(id: number, request: AuthenticatedRequest): Promise<AssetRequest> {
    const user = request.user;
    const assetRequest = await this.prisma.assetRequest.findUnique({
      where: { id },
    });

    if (!assetRequest) {
      throw new NotFoundException('Asset request not found');
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    const isAdmin = user.role === Role.ADMIN;
    const isOwner = user.sub === assetRequest.requesterId;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not allowed to delete this asset request');
    }

    return this.prisma.assetRequest.delete({
      where: { id },
    });
  }
}
