import { faker } from '@faker-js/faker';
import { AssetStatus, AssetType, BillingCycle } from '../../src/generated/prisma/enums';

export const buildAssetSeed = () => {
  const type = faker.helpers.arrayElement([
    AssetType.LAPTOP,
    AssetType.SUBSCRIPTION,
    AssetType.LICENSE,
    AssetType.PERIPHERAL,
  ]);

  const billingCycle =
    type === AssetType.SUBSCRIPTION || type === AssetType.LICENSE
      ? faker.helpers.arrayElement([BillingCycle.MONTHLY, BillingCycle.YEARLY])
      : BillingCycle.ONCE;

  return {
    title: faker.commerce.productName(),
    type,
    status: faker.helpers.arrayElement([
      AssetStatus.ACTIVE,
      AssetStatus.EXPIRING_SOON,
      AssetStatus.EXPIRED,
      AssetStatus.IN_REPAIR,
    ]),
    vendor: faker.company.name(),
    reference: `AST-${faker.string.alphanumeric({ length: 10, casing: 'upper' })}`,
    billingCycle,
    purchasedAt: faker.date.past({ years: 2 }),
    assignedAt: faker.date.recent({ days: 120 }),
    renewalAt: billingCycle === BillingCycle.ONCE ? null : faker.date.soon({ days: 90 }),
    expiresAt: billingCycle === BillingCycle.ONCE ? faker.date.future({ years: 2 }) : null,
    seatCount: type === AssetType.SUBSCRIPTION || type === AssetType.LICENSE ? 1 : null,
    notes: faker.lorem.sentence(),
    tags: [faker.helpers.arrayElement(['hardware', 'software', 'productivity', 'ops'])],
  };
};

export const buildAssetsForUser = (count = 5) => {
  return Array.from({ length: count }, () => buildAssetSeed());
};
