import { faker } from '@faker-js/faker';
import type { User } from '../../src/generated/prisma/client';
import { AssetRequestStatus, AssetType } from '../../src/generated/prisma/enums';
import type { SeededUser } from './users';

export const buildAssetRequestSeeds = (admin: User, users: SeededUser[]) => {
  const [firstUser, secondUser, thirdUser, fourthUser] = users;

  return [
    {
      requesterId: firstUser.id,
      title: 'Need a spare laptop for travel',
      assetType: AssetType.LAPTOP,
      vendor: 'Lenovo',
      justification: faker.lorem.sentences({ min: 2, max: 3 }),
      status: AssetRequestStatus.PENDING,
    },
    {
      requesterId: secondUser.id,
      reviewedById: admin.id,
      title: 'Requesting additional design tooling',
      assetType: AssetType.LICENSE,
      vendor: 'Figma',
      justification: faker.lorem.sentences({ min: 2, max: 3 }),
      status: AssetRequestStatus.APPROVED,
      reviewedAt: faker.date.recent({ days: 10 }),
    },
    {
      requesterId: thirdUser.id,
      reviewedById: admin.id,
      fulfilledAssetId: thirdUser.assets[0]?.id,
      title: 'Need a hardware replacement',
      assetType: AssetType.PERIPHERAL,
      vendor: 'Logitech',
      justification: faker.lorem.sentences({ min: 2, max: 3 }),
      status: AssetRequestStatus.FULFILLED,
      reviewedAt: faker.date.recent({ days: 6 }),
    },
    {
      requesterId: fourthUser?.id ?? firstUser.id,
      reviewedById: admin.id,
      title: 'Request for premium subscription access',
      assetType: AssetType.SUBSCRIPTION,
      vendor: 'Notion',
      justification: faker.lorem.sentences({ min: 2, max: 3 }),
      status: AssetRequestStatus.REJECTED,
      reviewedAt: faker.date.recent({ days: 3 }),
    },
  ];
};
