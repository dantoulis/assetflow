import { faker } from '@faker-js/faker';
import type { User } from '../../src/generated/prisma/client';
import { TicketCategory, TicketPriority, TicketStatus } from '../../src/generated/prisma/enums';
import type { SeededUser } from './users';

interface TicketMessageSeed {
  authorId: number;
  body: string;
  internal?: boolean;
  createdAt: Date;
}

export interface TicketSeedPlan {
  data: {
    subject: string;
    category: TicketCategory;
    status: TicketStatus;
    priority: TicketPriority;
    requesterId: number;
    assetId?: number;
    assignedAdminId: number;
    resolvedAt?: Date;
  };
  messages: TicketMessageSeed[];
}

const makeMessageDate = (daysAgo: number, hour = 9) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date;
};

export const buildTicketSeedPlans = (admin: User, users: SeededUser[]): TicketSeedPlan[] => {
  const seededUsers = users.filter((user) => user.assets.length > 0);

  return seededUsers.slice(0, 4).map((user, index) => {
    const asset = user.assets[index % user.assets.length];
    const status = faker.helpers.arrayElement([
      TicketStatus.OPEN,
      TicketStatus.PENDING_ADMIN,
      TicketStatus.PENDING_USER,
      TicketStatus.RESOLVED,
    ]);
    const createdAt = makeMessageDate(index + 4, 10);
    const adminReplyAt = makeMessageDate(index + 2, 11);

    return {
      data: {
        subject: faker.helpers.arrayElement([
          `Access issue with ${asset.title}`,
          `${asset.vendor} renewal needs review`,
          `${asset.title} is blocking daily work`,
          `Question about ${asset.title} assignment`,
        ]),
        category: faker.helpers.arrayElement([
          TicketCategory.ACCESS,
          TicketCategory.BILLING,
          TicketCategory.HARDWARE,
          TicketCategory.OTHER,
        ]),
        status,
        priority: faker.helpers.arrayElement([
          TicketPriority.LOW,
          TicketPriority.MEDIUM,
          TicketPriority.HIGH,
        ]),
        requesterId: user.id,
        assetId: asset.id,
        assignedAdminId: admin.id,
        resolvedAt: status === TicketStatus.RESOLVED ? makeMessageDate(index, 14) : undefined,
      },
      messages: [
        {
          authorId: user.id,
          body: faker.lorem.sentences({ min: 2, max: 3 }),
          createdAt,
        },
        {
          authorId: admin.id,
          body: faker.lorem.sentences({ min: 2, max: 3 }),
          createdAt: adminReplyAt,
        },
        {
          authorId: admin.id,
          body: `Internal note: ${faker.lorem.sentence()}`,
          internal: true,
          createdAt: makeMessageDate(index + 2, 12),
        },
      ],
    };
  });
};
