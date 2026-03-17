import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { faker } from '@faker-js/faker';
import { getDatabaseUrl } from '../src/common/utils';
import * as bcrypt from 'bcrypt';

const connectionString = getDatabaseUrl();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const saltOrRounds = 10;

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
        password: await bcrypt.hash('user', saltOrRounds),
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
      password: await bcrypt.hash('admin', saltOrRounds),
      role: 'ADMIN',
      assets: {
        create: [],
      },
    },
  });
  const users = await Promise.all(Array.from({ length: 5 }, () => makeUser()));
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
