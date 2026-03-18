import { faker } from '@faker-js/faker';
import type { Asset, User } from '../../src/generated/prisma/client';
import { Role } from '../../src/generated/prisma/enums';
import { buildAssetsForUser } from './assets';

export interface SeededUser extends User {
  assets: Asset[];
}

export const USER_PASSWORD = 'user';
export const ADMIN_PASSWORD = 'admin';

export const buildUserSeed = (passwordHash: string) => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: passwordHash,
    role: Role.USER,
    phone: faker.phone.number(),
    team: faker.helpers.arrayElement(['Engineering', 'Growth', 'Product', 'Operations']),
    location: faker.location.city(),
    assets: {
      create: buildAssetsForUser(),
    },
  };
};

export const buildAdminSeed = (passwordHash: string) => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: passwordHash,
    role: Role.ADMIN,
    phone: faker.phone.number(),
    team: 'Operations',
    location: faker.location.city(),
  };
};
