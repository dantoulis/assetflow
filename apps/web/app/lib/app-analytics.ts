import type {
  AppAsset,
  AppAssetRequest,
  AppTicket,
  AppUser,
  AssetRequestStatus,
  AssetStatus,
  AssetType,
  ChartPoint,
  DistributionSegment,
} from './app-types';
import { getAssetNextDate, humanizeEnum } from './app-formatters';

const chartColors = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

const shortDayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const shortMonthLabel = new Intl.DateTimeFormat('en-US', { month: 'short' });
const shortRangeDayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const shortHourLabel = new Intl.DateTimeFormat('en-US', { hour: 'numeric' });

export const getRenewingAssets = (assets: AppAsset[], days = 21) => {
  const now = new Date();

  return [...assets]
    .filter((asset) => {
      const nextDate = getAssetNextDate(asset);
      if (!nextDate) return false;

      const diff = new Date(nextDate).getTime() - now.getTime();
      const dayDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return dayDiff >= 0 && dayDiff <= days;
    })
    .sort((left, right) => {
      return (
        new Date(getAssetNextDate(left) ?? 0).getTime() -
        new Date(getAssetNextDate(right) ?? 0).getTime()
      );
    });
};

export const buildTypeDistribution = (assets: AppAsset[]): DistributionSegment[] => {
  const counts = new Map<AssetType, number>();

  for (const asset of assets) {
    counts.set(asset.type, (counts.get(asset.type) ?? 0) + 1);
  }

  return [...counts.entries()].map(([label, value], index) => ({
    label: humanizeEnum(label),
    value,
    color: chartColors[index % chartColors.length]!,
  }));
};

export const buildStatusDistribution = (
  assets: AppAsset[] | AppTicket[] | AppAssetRequest[],
): DistributionSegment[] => {
  const counts = new Map<string, number>();

  for (const item of assets) {
    counts.set(item.status, (counts.get(item.status) ?? 0) + 1);
  }

  return [...counts.entries()].map(([label, value], index) => ({
    label: humanizeEnum(label),
    value,
    color: chartColors[index % chartColors.length]!,
  }));
};

export const buildRecentDailySeries = <T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  days = 7,
): ChartPoint[] => {
  const result: ChartPoint[] = [];
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - offset);
    day.setHours(0, 0, 0, 0);

    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const value = items.filter((item) => {
      const dateValue = getDate(item);
      if (!dateValue) return false;

      const current = new Date(dateValue);
      return current >= day && current < nextDay;
    }).length;

    result.push({
      label: shortDayLabel.format(day),
      value,
    });
  }

  return result;
};

export const buildRecentMonthlySeries = <T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  months = 6,
): ChartPoint[] => {
  const result: ChartPoint[] = [];
  const now = new Date();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

    const value = items.filter((item) => {
      const dateValue = getDate(item);
      if (!dateValue) return false;

      const current = new Date(dateValue);
      return current >= monthStart && current < nextMonth;
    }).length;

    result.push({
      label: shortMonthLabel.format(monthStart),
      value,
    });
  }

  return result;
};

export const buildHourlySeriesForDay = <T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  referenceDate = new Date(),
): ChartPoint[] => {
  const startOfReferenceDay = new Date(referenceDate);
  startOfReferenceDay.setHours(0, 0, 0, 0);

  const result: ChartPoint[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    const bucketStart = new Date(startOfReferenceDay);
    bucketStart.setHours(hour, 0, 0, 0);

    const bucketEnd = new Date(bucketStart);
    bucketEnd.setHours(hour + 1, 0, 0, 0);

    const value = items.filter((item) => {
      const dateValue = getDate(item);
      if (!dateValue) return false;

      const current = new Date(dateValue);
      return current >= bucketStart && current < bucketEnd;
    }).length;

    result.push({
      label: shortHourLabel.format(bucketStart),
      value,
    });
  }

  return result;
};

export const buildDailySeriesForRange = <T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  startDate: Date,
  endDate: Date,
): ChartPoint[] => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const result: ChartPoint[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const bucketStart = new Date(cursor);
    const bucketEnd = new Date(cursor);
    bucketEnd.setDate(bucketEnd.getDate() + 1);

    const value = items.filter((item) => {
      const dateValue = getDate(item);
      if (!dateValue) return false;

      const current = new Date(dateValue);
      return current >= bucketStart && current < bucketEnd;
    }).length;

    result.push({
      label: shortRangeDayLabel.format(bucketStart),
      value,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};

export const buildMonthlySeriesForRange = <T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  startDate: Date,
  endDate: Date,
): ChartPoint[] => {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  const result: ChartPoint[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const bucketStart = new Date(cursor);
    const bucketEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);

    const value = items.filter((item) => {
      const dateValue = getDate(item);
      if (!dateValue) return false;

      const current = new Date(dateValue);
      return current >= bucketStart && current < bucketEnd;
    }).length;

    result.push({
      label: shortMonthLabel.format(bucketStart),
      value,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return result;
};

export const getOpenTickets = (tickets: AppTicket[]) =>
  tickets.filter((ticket) => ticket.status !== 'RESOLVED');

export const getAssetsByUserId = (assets: AppAsset[], userId: number) =>
  assets.filter((asset) => asset.userId === userId);

export const getTicketsByUserId = (tickets: AppTicket[], userId: number) =>
  [...tickets]
    .filter((ticket) => ticket.requesterId === userId)
    .sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );

export const getRequestsByUserId = (requests: AppAssetRequest[], userId: number) =>
  [...requests]
    .filter((request) => request.requesterId === userId)
    .sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );

export const getTicketCountsByStatus = (tickets: AppTicket[]) => {
  const counts: Record<string, number> = {};

  for (const ticket of tickets) {
    counts[ticket.status] = (counts[ticket.status] ?? 0) + 1;
  }

  return counts;
};

export const getAssetCountsByStatus = (assets: AppAsset[]) => {
  const counts: Record<AssetStatus, number> = {
    ACTIVE: 0,
    EXPIRING_SOON: 0,
    EXPIRED: 0,
    IN_REPAIR: 0,
  };

  for (const asset of assets) {
    counts[asset.status] += 1;
  }

  return counts;
};

export const getUserCountsByTeam = (users: AppUser[]) => {
  const counts: Record<string, number> = {};

  for (const user of users) {
    const label = user.team?.trim() || 'Unassigned';
    counts[label] = (counts[label] ?? 0) + 1;
  }

  return counts;
};

export const getRequestCountsByStatus = (requests: AppAssetRequest[]) => {
  const counts: Record<AssetRequestStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    FULFILLED: 0,
  };

  for (const request of requests) {
    counts[request.status] += 1;
  }

  return counts;
};
