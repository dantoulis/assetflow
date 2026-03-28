import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-github2';
import type { Profile } from 'passport-github2';
import { getGithubCallbackUrl } from '../../common/utils';

type VerifyCallback = (error: Error | null, user?: unknown) => void;

@Injectable()
export class GithubStrategyService extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID?.trim()!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim()!,
      callbackURL: getGithubCallbackUrl()!,
      scope: ['user:email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const primaryEmail = profile.emails?.[0]?.value;

    done(null, {
      provider: 'GITHUB',
      providerAccountId: profile.id,
      username: profile.username,
      email: primaryEmail,
      name: profile.displayName || profile.username,
      emailVerified: Boolean(primaryEmail),
      avatarUrl: profile.photos?.[0]?.value,
    });
  }
}
