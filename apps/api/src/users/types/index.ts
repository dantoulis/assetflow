import type { User, AuthProvider, Prisma } from '../../generated/prisma/client';

export type SafeUser = Omit<User, 'password'>;
export type AuthAccountWithUser = Prisma.AuthAccountGetPayload<{
  include: { user: { omit: { password: true } } };
}>;

export type SocialProfile = {
  provider: AuthProvider;
  providerAccountId: string;
  username?: string;
  email?: string;
  name?: string;
  emailVerified: boolean;
  avatarUrl?: string;
};
