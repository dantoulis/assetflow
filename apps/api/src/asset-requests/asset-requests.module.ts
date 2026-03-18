import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AssetRequestsController } from './asset-requests.controller';
import { AssetRequestsService } from './asset-requests.service';

@Module({
  imports: [PrismaModule],
  controllers: [AssetRequestsController],
  providers: [AssetRequestsService],
  exports: [AssetRequestsService],
})
export class AssetRequestsModule {}
