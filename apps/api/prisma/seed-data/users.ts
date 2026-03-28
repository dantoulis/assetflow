import type { Asset, User } from '../../src/generated/prisma/client';
import { Role } from '../../src/generated/prisma/enums';
import { buildAssetsForUser } from './assets';
import { daysAgo } from './helpers';
import { ADMIN_PROFILE, USER_PROFILES, type SeedUserProfile } from './profiles';

export interface SeededUser extends User {
  assets: Asset[];
}

export const USER_PASSWORD = 'user';
export const ADMIN_PASSWORD = 'admin';

const buildBaseUserSeed = (profile: SeedUserProfile, passwordHash: string, role: Role) => {
  const joinedAt = daysAgo(profile.joinedDaysAgo, 9, 30);

  return {
    name: profile.name,
    email: profile.email,
    username: profile.username,
    password: passwordHash,
    role,
    phone: profile.phone,
    team: profile.team,
    location: profile.location,
    joinedAt,
    createdAt: joinedAt,
  };
};

export const buildUserSeed = (
  profile: SeedUserProfile,
  passwordHash: string,
  userIndex: number,
) => {
  return {
    ...buildBaseUserSeed(profile, passwordHash, Role.USER),
    assets: {
      create: buildAssetsForUser(profile, userIndex),
    },
  };
};

export const buildUserSeeds = (passwordHash: string) =>
  USER_PROFILES.map((profile, index) => buildUserSeed(profile, passwordHash, index));

export const buildAdminSeed = (passwordHash: string) => {
  return buildBaseUserSeed(ADMIN_PROFILE, passwordHash, Role.ADMIN);
};
