import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { faker } from '@faker-js/faker';
import { getDatabaseUrl } from '../src/common/utils';

const connectionString = getDatabaseUrl();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  const makeAsset = () => {
    return {
      title: faker.commerce.productName(),
      type: faker.helpers.arrayElement(['HARDWARE', 'SUBSCRIPTION']),
    };
  };

  const makeUser = async () => {
    return await prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password: 'user',
        role: 'USER',
        assets: {
          create: Array.from({ length: 5 }, () => makeAsset()),
        },
      },
    });
  };

  const admin = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: 'admin',
      role: 'ADMIN',
      assets: {
        create: [],
      },
    },
  });
  const users = await Promise.all(Array.from({ length: 5 }, () => makeUser()));
  console.log({ admin, users });
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
