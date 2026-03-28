import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { getDatabaseUrl } from '../src/common/utils';
import * as bcrypt from 'bcrypt';
import {
  ADMIN_PASSWORD,
  USER_PASSWORD,
  buildAdminSeed,
  buildAssetRequestSeeds,
  buildTicketSeedPlans,
  buildUserSeeds,
  type SeededUser,
} from './seed-data';

const connectionString = getDatabaseUrl();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const saltOrRounds = 10;

const main = async () => {
  const userPasswordHash = await bcrypt.hash(USER_PASSWORD, saltOrRounds);
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, saltOrRounds);

  const admin = await prisma.user.create({
    data: buildAdminSeed(adminPasswordHash),
  });

  const users: SeededUser[] = [];
  const userSeeds = buildUserSeeds(userPasswordHash);

  for (const userSeed of userSeeds) {
    const createdUser = await prisma.user.create({
      data: userSeed,
      include: {
        assets: true,
      },
    });

    users.push(createdUser);
  }

  const ticketPlans = buildTicketSeedPlans(admin, users);

  for (const plan of ticketPlans) {
    const ticket = await prisma.ticket.create({
      data: plan.data,
    });

    await prisma.ticketMessage.createMany({
      data: plan.messages.map((message) => ({
        ...message,
        ticketId: ticket.id,
      })),
    });
  }

  const assetRequests = buildAssetRequestSeeds(admin, users);
  await prisma.assetRequest.createMany({
    data: assetRequests,
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
