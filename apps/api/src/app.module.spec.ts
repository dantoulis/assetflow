import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { AssetService } from './assets/assets.service';
import { TicketsService } from './tickets/tickets.service';
import { AssetRequestsService } from './asset-requests/asset-requests.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppModule', () => {
  it('resolves providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef.get(AppService)).toBeDefined();
    expect(moduleRef.get(AuthService)).toBeDefined();
    expect(moduleRef.get(UsersService)).toBeDefined();
    expect(moduleRef.get(AssetService)).toBeDefined();
    expect(moduleRef.get(TicketsService)).toBeDefined();
    expect(moduleRef.get(AssetRequestsService)).toBeDefined();
    expect(moduleRef.get(PrismaService)).toBeDefined();

    expect(moduleRef.get(AppService).healthCheck()).toBe('Healthy');
  });
});
