import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { faker } from '@faker-js/faker';
import { getDatabaseUrl } from '../src/common/utils';
import * as bcrypt from 'bcrypt';
import {
  ADMIN_PASSWORD,
  USER_PASSWORD,
  buildAdminSeed,
  buildAssetRequestSeeds,
  buildTicketSeedPlans,
  buildUserSeed,
  type SeededUser,
} from './seed-data';

const connectionString = getDatabaseUrl();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const saltOrRounds = 10;

const createSeedUser = async (passwordHash: string): Promise<SeededUser> => {
  return await prisma.user.create({
    data: buildUserSeed(passwordHash),
    include: {
      assets: true,
    },
  });
};

const main = async () => {
  faker.seed(20260318);

  const userPasswordHash = await bcrypt.hash(USER_PASSWORD, saltOrRounds);
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, saltOrRounds);

  const admin = await prisma.user.create({
    data: buildAdminSeed(adminPasswordHash),
  });

  const users = await Promise.all(
    Array.from({ length: 5 }, () => createSeedUser(userPasswordHash)),
  );

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
