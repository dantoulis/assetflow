import type { AppAsset, AppRole, AppUser } from './app-types';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const formatDate = (value?: string | null) => {
  if (!value) return 'No date';
  return dateFormatter.format(new Date(value));
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return 'No date';
  return dateTimeFormatter.format(new Date(value));
};

export const formatRelativeDate = (value?: string | null) => {
  if (!value) return 'No date';

  const now = new Date();
  const target = new Date(value);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1) return `In ${days} days`;

  return `${Math.abs(days)} days ago`;
};

export const humanizeEnum = (value?: string | null) => {
  if (!value) return 'Unknown';

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const formatRoleLabel = (role: AppRole) => (role === 'ADMIN' ? 'Admin' : 'User');

export const getDisplayName = (user?: Pick<AppUser, 'name' | 'username'> | null) => {
  if (!user) return 'Unknown user';
  return user.name?.trim() || user.username;
};

export const getInitials = (user?: Pick<AppUser, 'name' | 'username'> | null) => {
  const source = getDisplayName(user);

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

export const getAssetNextDate = (asset: AppAsset) => asset.renewalAt ?? asset.expiresAt;

export const compareNewestFirst = (left?: string | null, right?: string | null) =>
  new Date(right ?? 0).getTime() - new Date(left ?? 0).getTime();
