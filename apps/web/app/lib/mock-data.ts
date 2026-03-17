export type AppRole = 'ADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
export type AssetType = 'LAPTOP' | 'SUBSCRIPTION' | 'LICENSE' | 'PERIPHERAL';
export type AssetStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNASSIGNED' | 'IN_REPAIR';
export type BillingCycle = 'MONTHLY' | 'YEARLY' | 'ONCE';
export type TicketStatus = 'OPEN' | 'PENDING_ADMIN' | 'PENDING_USER' | 'RESOLVED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  status: UserStatus;
  initials: string;
  company: string;
  team: string;
  location: string;
  joinedAt: string;
  phone: string;
}

export interface MockAsset {
  id: string;
  title: string;
  type: AssetType;
  status: AssetStatus;
  ownerId?: string;
  vendor: string;
  reference: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  purchasedAt: string;
  assignedAt?: string;
  renewalAt?: string;
  expiresAt?: string;
  seatCount?: number;
  notes: string;
  tags: string[];
}

export interface MockTicket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  userId: string;
  assetId?: string;
  assignedAdminId?: string;
  createdAt: string;
  updatedAt: string;
  category: 'Subscription' | 'Hardware' | 'Access' | 'Billing';
  preview: string;
}

export interface MockTicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
  internal?: boolean;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
  hint: string;
}

export interface DistributionSegment {
  label: string;
  value: number;
  color: string;
}

const TODAY = new Date('2026-03-14T12:00:00.000Z');

export const demoPassword = 'demo1234';

export const mockUsers: MockUser[] = [
  {
    id: 'user-admin',
    name: 'Elena Kallias',
    email: 'ops@assetflow.dev',
    role: 'ADMIN',
    status: 'ACTIVE',
    initials: 'EK',
    company: 'AssetFlow',
    team: 'Operations',
    location: 'Athens, GR',
    joinedAt: '2024-11-02',
    phone: '+30 210 555 1401',
  },
  {
    id: 'user-maya',
    name: 'Maya Chen',
    email: 'maya.chen@northstar.io',
    role: 'USER',
    status: 'ACTIVE',
    initials: 'MC',
    company: 'Northstar Labs',
    team: 'Growth',
    location: 'Berlin, DE',
    joinedAt: '2025-02-18',
    phone: '+49 30 555 1112',
  },
  {
    id: 'user-daniel',
    name: 'Daniel Reed',
    email: 'daniel.reed@northstar.io',
    role: 'USER',
    status: 'ACTIVE',
    initials: 'DR',
    company: 'Northstar Labs',
    team: 'Engineering',
    location: 'London, UK',
    joinedAt: '2025-06-08',
    phone: '+44 20 555 2119',
  },
  {
    id: 'user-sofia',
    name: 'Sofia Alvarez',
    email: 'sofia.alvarez@northstar.io',
    role: 'USER',
    status: 'TRIAL',
    initials: 'SA',
    company: 'Northstar Labs',
    team: 'Product',
    location: 'Madrid, ES',
    joinedAt: '2026-01-12',
    phone: '+34 91 555 3104',
  },
];

const fallbackPreviewUser = mockUsers[0]!;

export const previewAdminUser =
  mockUsers.find((user) => user.role === 'ADMIN') ?? fallbackPreviewUser;
export const previewUser = mockUsers.find((user) => user.role === 'USER') ?? fallbackPreviewUser;

export const mockAssets: MockAsset[] = [
  {
    id: 'asset-001',
    title: 'Dell XPS 15',
    type: 'LAPTOP',
    status: 'ACTIVE',
    ownerId: 'user-maya',
    vendor: 'Dell',
    reference: 'DL-XPS15-9382',
    billingCycle: 'ONCE',
    amount: 2499,
    currency: 'USD',
    purchasedAt: '2025-02-20',
    assignedAt: '2025-02-21',
    expiresAt: '2027-02-20',
    notes: 'Primary workstation with accidental damage coverage.',
    tags: ['hardware', 'workstation'],
  },
  {
    id: 'asset-002',
    title: 'Adobe Creative Cloud',
    type: 'SUBSCRIPTION',
    status: 'EXPIRING_SOON',
    ownerId: 'user-maya',
    vendor: 'Adobe',
    reference: 'ADB-CC-TEAM-07',
    billingCycle: 'MONTHLY',
    amount: 84,
    currency: 'USD',
    purchasedAt: '2025-05-03',
    assignedAt: '2025-05-03',
    renewalAt: '2026-04-02',
    seatCount: 1,
    notes: 'Growth design seat with premium libraries enabled.',
    tags: ['design', 'subscription'],
  },
  {
    id: 'asset-003',
    title: 'Notion Enterprise',
    type: 'LICENSE',
    status: 'EXPIRING_SOON',
    ownerId: 'user-maya',
    vendor: 'Notion',
    reference: 'NOT-ENT-332',
    billingCycle: 'MONTHLY',
    amount: 36,
    currency: 'USD',
    purchasedAt: '2025-02-25',
    assignedAt: '2025-02-25',
    renewalAt: '2026-03-18',
    seatCount: 1,
    notes: 'Workspace owner license with admin permissions.',
    tags: ['knowledge-base', 'subscription'],
  },
  {
    id: 'asset-004',
    title: 'MacBook Pro 14',
    type: 'LAPTOP',
    status: 'ACTIVE',
    ownerId: 'user-daniel',
    vendor: 'Apple',
    reference: 'APL-MBP14-776',
    billingCycle: 'ONCE',
    amount: 2890,
    currency: 'USD',
    purchasedAt: '2024-11-08',
    assignedAt: '2024-11-11',
    expiresAt: '2027-11-08',
    notes: 'M3 Pro model used for local builds and incident response.',
    tags: ['hardware', 'engineering'],
  },
  {
    id: 'asset-005',
    title: 'GitHub Copilot Business',
    type: 'LICENSE',
    status: 'ACTIVE',
    ownerId: 'user-daniel',
    vendor: 'GitHub',
    reference: 'GH-CP-9921',
    billingCycle: 'MONTHLY',
    amount: 19,
    currency: 'USD',
    purchasedAt: '2025-07-01',
    assignedAt: '2025-07-01',
    renewalAt: '2026-03-25',
    seatCount: 1,
    notes: 'Paired with engineering seat and repo policy templates.',
    tags: ['engineering', 'ai'],
  },
  {
    id: 'asset-006',
    title: 'Microsoft 365 Business Premium',
    type: 'SUBSCRIPTION',
    status: 'ACTIVE',
    ownerId: 'user-sofia',
    vendor: 'Microsoft',
    reference: 'MS-365-1220',
    billingCycle: 'MONTHLY',
    amount: 21.5,
    currency: 'USD',
    purchasedAt: '2026-01-12',
    assignedAt: '2026-01-12',
    renewalAt: '2026-03-21',
    seatCount: 1,
    notes: 'Email, Teams, and admin dashboard access bundle.',
    tags: ['communication', 'product'],
  },
  {
    id: 'asset-007',
    title: 'Figma Professional',
    type: 'LICENSE',
    status: 'EXPIRING_SOON',
    ownerId: 'user-sofia',
    vendor: 'Figma',
    reference: 'FIG-PRO-031',
    billingCycle: 'MONTHLY',
    amount: 16,
    currency: 'USD',
    purchasedAt: '2026-01-13',
    assignedAt: '2026-01-13',
    renewalAt: '2026-03-16',
    seatCount: 1,
    notes: 'Used for product discovery and high-fidelity flows.',
    tags: ['design', 'product'],
  },
  {
    id: 'asset-008',
    title: 'Lenovo ThinkPad X1 Carbon',
    type: 'LAPTOP',
    status: 'UNASSIGNED',
    vendor: 'Lenovo',
    reference: 'LNV-X1-1140',
    billingCycle: 'ONCE',
    amount: 1980,
    currency: 'USD',
    purchasedAt: '2026-02-02',
    expiresAt: '2028-02-02',
    notes: 'Prepared for the next engineering hire, still unassigned.',
    tags: ['hardware', 'inventory'],
  },
  {
    id: 'asset-009',
    title: 'Logitech MX Master 3S',
    type: 'PERIPHERAL',
    status: 'IN_REPAIR',
    ownerId: 'user-daniel',
    vendor: 'Logitech',
    reference: 'LOG-MX-3S-02',
    billingCycle: 'ONCE',
    amount: 109,
    currency: 'USD',
    purchasedAt: '2025-10-08',
    assignedAt: '2025-10-08',
    notes: 'Sent out after scroll-wheel failure; temporary replacement issued.',
    tags: ['hardware', 'repair'],
  },
];

export const mockTickets: MockTicket[] = [
  {
    id: 'ticket-1001',
    subject: 'Battery health dropped on Dell XPS',
    status: 'PENDING_ADMIN',
    priority: 'HIGH',
    userId: 'user-maya',
    assetId: 'asset-001',
    assignedAdminId: 'user-admin',
    createdAt: '2026-03-09T10:20:00.000Z',
    updatedAt: '2026-03-13T13:42:00.000Z',
    category: 'Hardware',
    preview: 'User reported a sudden drop in battery runtime during travel.',
  },
  {
    id: 'ticket-1002',
    subject: 'Copilot access after seat reassignment',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    userId: 'user-daniel',
    assetId: 'asset-005',
    assignedAdminId: 'user-admin',
    createdAt: '2026-03-05T15:15:00.000Z',
    updatedAt: '2026-03-12T11:18:00.000Z',
    category: 'Access',
    preview: 'Permissions were restored after policy sync and seat refresh.',
  },
  {
    id: 'ticket-1003',
    subject: 'Figma renewal still marked pending',
    status: 'OPEN',
    priority: 'URGENT',
    userId: 'user-sofia',
    assetId: 'asset-007',
    assignedAdminId: 'user-admin',
    createdAt: '2026-03-13T08:45:00.000Z',
    updatedAt: '2026-03-14T09:05:00.000Z',
    category: 'Subscription',
    preview: 'Renewal alert remains visible and blocks design export permissions.',
  },
  {
    id: 'ticket-1004',
    subject: 'Adobe seat transfer before campaign launch',
    status: 'PENDING_USER',
    priority: 'HIGH',
    userId: 'user-maya',
    assetId: 'asset-002',
    assignedAdminId: 'user-admin',
    createdAt: '2026-03-07T09:12:00.000Z',
    updatedAt: '2026-03-14T08:12:00.000Z',
    category: 'Billing',
    preview: 'Admin asked whether the seat should move permanently or only for two weeks.',
  },
];

export const mockTicketMessages: MockTicketMessage[] = [
  {
    id: 'msg-1001-1',
    ticketId: 'ticket-1001',
    authorId: 'user-maya',
    body: 'The battery dropped from 92% to 34% during a single two-hour meeting. I was not running exports or anything intensive.',
    createdAt: '2026-03-09T10:20:00.000Z',
  },
  {
    id: 'msg-1001-2',
    ticketId: 'ticket-1001',
    authorId: 'user-admin',
    body: 'I have opened a vendor warranty check and flagged the spare device pool in case we need a swap this week.',
    createdAt: '2026-03-10T08:05:00.000Z',
  },
  {
    id: 'msg-1001-3',
    ticketId: 'ticket-1001',
    authorId: 'user-admin',
    body: 'Internal note: Warranty still active. Waiting for Dell to confirm next-business-day pickup window.',
    createdAt: '2026-03-10T08:07:00.000Z',
    internal: true,
  },
  {
    id: 'msg-1001-4',
    ticketId: 'ticket-1001',
    authorId: 'user-maya',
    body: 'A loaner would help if the pickup is scheduled during the campaign review week.',
    createdAt: '2026-03-13T13:42:00.000Z',
  },
  {
    id: 'msg-1002-1',
    ticketId: 'ticket-1002',
    authorId: 'user-daniel',
    body: 'Copilot stopped suggesting completions right after my laptop was re-imaged.',
    createdAt: '2026-03-05T15:15:00.000Z',
  },
  {
    id: 'msg-1002-2',
    ticketId: 'ticket-1002',
    authorId: 'user-admin',
    body: 'The seat had detached from your GitHub identity during the policy sync. I re-bound it and forced a refresh.',
    createdAt: '2026-03-06T10:55:00.000Z',
  },
  {
    id: 'msg-1002-3',
    ticketId: 'ticket-1002',
    authorId: 'user-daniel',
    body: 'Confirmed. Suggestions are back in VS Code and the inline chat works again.',
    createdAt: '2026-03-12T11:18:00.000Z',
  },
  {
    id: 'msg-1003-1',
    ticketId: 'ticket-1003',
    authorId: 'user-sofia',
    body: 'The renewal warning is still shown in Figma, and I cannot publish a prototype for stakeholder review.',
    createdAt: '2026-03-13T08:45:00.000Z',
  },
  {
    id: 'msg-1003-2',
    ticketId: 'ticket-1003',
    authorId: 'user-admin',
    body: 'I can see the invoice settled, but the seat sync has not completed. I have escalated it with vendor support and I am monitoring the retry.',
    createdAt: '2026-03-14T09:05:00.000Z',
  },
  {
    id: 'msg-1004-1',
    ticketId: 'ticket-1004',
    authorId: 'user-maya',
    body: 'Can we transfer the Adobe seat temporarily to our freelance editor for the next campaign sprint?',
    createdAt: '2026-03-07T09:12:00.000Z',
  },
  {
    id: 'msg-1004-2',
    ticketId: 'ticket-1004',
    authorId: 'user-admin',
    body: 'Yes, but I need to know whether this is a permanent reassignment or a short-term coverage request so I can set the audit trail correctly.',
    createdAt: '2026-03-14T08:12:00.000Z',
  },
];

export const adminSpendSeries: ChartPoint[] = [
  { label: 'Oct', value: 4100 },
  { label: 'Nov', value: 4350 },
  { label: 'Dec', value: 4525 },
  { label: 'Jan', value: 4680 },
  { label: 'Feb', value: 4920 },
  { label: 'Mar', value: 5180 },
];

export const adminTicketSeries: ChartPoint[] = [
  { label: 'Mon', value: 4 },
  { label: 'Tue', value: 6 },
  { label: 'Wed', value: 5 },
  { label: 'Thu', value: 8 },
  { label: 'Fri', value: 7 },
  { label: 'Sat', value: 3 },
];

const userSpendSeriesMap: Record<string, ChartPoint[]> = {
  'user-maya': [
    { label: 'Oct', value: 96 },
    { label: 'Nov', value: 104 },
    { label: 'Dec', value: 104 },
    { label: 'Jan', value: 116 },
    { label: 'Feb', value: 120 },
    { label: 'Mar', value: 120 },
  ],
  'user-daniel': [
    { label: 'Oct', value: 19 },
    { label: 'Nov', value: 19 },
    { label: 'Dec', value: 19 },
    { label: 'Jan', value: 19 },
    { label: 'Feb', value: 19 },
    { label: 'Mar', value: 19 },
  ],
  'user-sofia': [
    { label: 'Jan', value: 37.5 },
    { label: 'Feb', value: 37.5 },
    { label: 'Mar', value: 37.5 },
    { label: 'Apr', value: 37.5 },
    { label: 'May', value: 37.5 },
    { label: 'Jun', value: 37.5 },
  ],
};

export const formatCurrency = (value: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
};

export const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

export const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

export const daysUntil = (value?: string) => {
  if (!value) return null;

  const target = new Date(value);
  const diff = target.getTime() - TODAY.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatRelativeDate = (value: string) => {
  const diff = daysUntil(value);

  if (diff === null) return 'No date';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
};

export const getUserById = (userId?: string) => {
  return mockUsers.find((user) => user.id === userId) ?? null;
};

export const getUserByEmail = (email: string) => {
  return mockUsers.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
};

export const getAssetById = (assetId: string) => {
  return mockAssets.find((asset) => asset.id === assetId) ?? null;
};

export const getTicketById = (ticketId: string) => {
  return mockTickets.find((ticket) => ticket.id === ticketId) ?? null;
};

export const getMessagesForTicket = (ticketId: string) => {
  return mockTicketMessages
    .filter((message) => message.ticketId === ticketId)
    .sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
};

export const getAssetsForUser = (userId: string) => {
  return mockAssets.filter((asset) => asset.ownerId === userId);
};

export const getTicketsForUser = (userId: string) => {
  return mockTickets
    .filter((ticket) => ticket.userId === userId)
    .sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
};

export const getTicketsForAsset = (assetId: string) => {
  return mockTickets
    .filter((ticket) => ticket.assetId === assetId)
    .sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
};

export const getRecurringMonthlySpend = (assets: MockAsset[]) => {
  return assets.reduce((total, asset) => {
    if (asset.billingCycle === 'MONTHLY') return total + asset.amount;
    if (asset.billingCycle === 'YEARLY') return total + asset.amount / 12;
    return total;
  }, 0);
};

export const getOpenTicketCount = (userId: string) => {
  return getTicketsForUser(userId).filter((ticket) => ticket.status !== 'RESOLVED').length;
};

export const getActiveAssetCount = (userId: string) => {
  return getAssetsForUser(userId).filter((asset) => asset.status !== 'UNASSIGNED').length;
};

export const getExpiringAssets = (days = 30) => {
  return mockAssets.filter((asset) => {
    const diff = daysUntil(asset.renewalAt ?? asset.expiresAt);
    return diff !== null && diff >= 0 && diff <= days;
  });
};

export const getTotalSpendSnapshot = () => {
  return getRecurringMonthlySpend(mockAssets);
};

export const getAssetDistribution = (): DistributionSegment[] => {
  const counts = {
    Hardware: mockAssets.filter((asset) => asset.type === 'LAPTOP' || asset.type === 'PERIPHERAL')
      .length,
    Subscription: mockAssets.filter((asset) => asset.type === 'SUBSCRIPTION').length,
    License: mockAssets.filter((asset) => asset.type === 'LICENSE').length,
  };

  return [
    { label: 'Hardware', value: counts.Hardware, color: 'var(--color-chart-2)' },
    { label: 'Subscription', value: counts.Subscription, color: 'var(--color-chart-1)' },
    { label: 'License', value: counts.License, color: 'var(--color-chart-4)' },
  ];
};

export const buildAdminDashboard = () => {
  const managedUsers = mockUsers.filter((user) => user.role === 'USER');
  const openTickets = mockTickets.filter((ticket) => ticket.status !== 'RESOLVED');
  const expiringSoon = getExpiringAssets(14);

  const metrics: DashboardMetric[] = [
    {
      label: 'Managed users',
      value: `${managedUsers.length}`,
      delta: '+1 this month',
      hint: 'Active people with assigned inventory or subscriptions.',
    },
    {
      label: 'Assigned assets',
      value: `${mockAssets.filter((asset) => asset.ownerId).length}`,
      delta: `${mockAssets.filter((asset) => asset.status === 'UNASSIGNED').length} unassigned`,
      hint: 'Across hardware, subscriptions, and licenses.',
    },
    {
      label: 'Recurring monthly spend',
      value: formatCurrency(getTotalSpendSnapshot()),
      delta: '+5.3%',
      hint: 'Subscriptions and licenses normalized to monthly cost.',
    },
    {
      label: 'Open tickets',
      value: `${openTickets.length}`,
      delta: `${openTickets.filter((ticket) => ticket.priority === 'URGENT').length} urgent`,
      hint: 'Needs either a reply or an ownership decision.',
    },
  ];

  return {
    metrics,
    spendSeries: adminSpendSeries,
    ticketSeries: adminTicketSeries,
    distribution: getAssetDistribution(),
    renewals: getExpiringAssets(21).sort((left, right) => {
      return (
        (daysUntil(left.renewalAt ?? left.expiresAt) ?? 999) -
        (daysUntil(right.renewalAt ?? right.expiresAt) ?? 999)
      );
    }),
    ticketsNeedingAttention: openTickets.sort((left, right) => {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    }),
    statusSummary: [
      {
        label: 'Healthy assets',
        value: mockAssets.filter((asset) => asset.status === 'ACTIVE').length,
        color: 'var(--color-chart-3)',
      },
      { label: 'Renew soon', value: expiringSoon.length, color: 'var(--color-chart-4)' },
      {
        label: 'Repair / blocked',
        value: mockAssets.filter((asset) => asset.status === 'IN_REPAIR').length,
        color: 'var(--color-chart-5)',
      },
    ] satisfies DistributionSegment[],
  };
};

export const buildUserDashboard = (userId: string) => {
  const user = getUserById(userId);
  const assets = getAssetsForUser(userId);
  const tickets = getTicketsForUser(userId);
  const upcomingRenewals = assets.filter((asset) => {
    const diff = daysUntil(asset.renewalAt ?? asset.expiresAt);
    return diff !== null && diff >= 0 && diff <= 21;
  });
  const recurringSpend = getRecurringMonthlySpend(assets);
  const nextRenewal = upcomingRenewals[0];
  const latestTicket = tickets[0];

  const metrics: DashboardMetric[] = [
    {
      label: 'Assets on your profile',
      value: `${assets.length}`,
      delta: `${assets.filter((asset) => asset.type === 'LAPTOP').length} hardware`,
      hint: 'Everything currently assigned to your account.',
    },
    {
      label: 'Renewals due soon',
      value: `${upcomingRenewals.length}`,
      delta: nextRenewal
        ? formatRelativeDate(nextRenewal.renewalAt ?? nextRenewal.expiresAt ?? '')
        : 'Nothing due',
      hint: 'Use this list to spot expiring licenses before work is blocked.',
    },
    {
      label: 'Open conversations',
      value: `${tickets.filter((ticket) => ticket.status !== 'RESOLVED').length}`,
      delta: latestTicket ? formatRelativeDate(latestTicket.updatedAt) : 'No ticket activity',
      hint: 'Support threads where either side still owes a reply.',
    },
    {
      label: 'Monthly tooling spend',
      value: formatCurrency(recurringSpend),
      delta: user?.status === 'TRIAL' ? 'Trial profile' : 'Stable',
      hint: 'Recurring software and subscription cost tied to your seat.',
    },
  ];

  return {
    metrics,
    spendSeries: userSpendSeriesMap[userId] ?? adminSpendSeries,
    renewals: upcomingRenewals.sort((left, right) => {
      return (
        (daysUntil(left.renewalAt ?? left.expiresAt) ?? 999) -
        (daysUntil(right.renewalAt ?? right.expiresAt) ?? 999)
      );
    }),
    tickets,
    distribution: [
      {
        label: 'Hardware',
        value: assets.filter((asset) => asset.type === 'LAPTOP' || asset.type === 'PERIPHERAL')
          .length,
        color: 'var(--color-chart-2)',
      },
      {
        label: 'Subscriptions',
        value: assets.filter((asset) => asset.type === 'SUBSCRIPTION').length,
        color: 'var(--color-chart-1)',
      },
      {
        label: 'Licenses',
        value: assets.filter((asset) => asset.type === 'LICENSE').length,
        color: 'var(--color-chart-4)',
      },
    ] satisfies DistributionSegment[],
  };
};

export const demoAccounts = [
  {
    label: 'Admin demo',
    email: 'ops@assetflow.dev',
    role: 'ADMIN' as const,
    destination: '/admin/dashboard',
  },
  {
    label: 'User demo',
    email: 'maya.chen@northstar.io',
    role: 'USER' as const,
    destination: '/app/dashboard',
  },
];
