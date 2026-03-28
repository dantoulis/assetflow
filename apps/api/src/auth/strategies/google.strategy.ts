import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import type { Profile, VerifyCallback } from 'passport-google-oauth20';
import { getGoogleCallbackUrl } from '../../common/utils';

@Injectable()
export class GoogleStrategyService extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID?.trim()!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim()!,
      callbackURL: getGoogleCallbackUrl()!,
      scope: ['profile', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const mappedUserObject = {
      provider: 'GOOGLE',
      providerAccountId: profile.id,
      username: profile.username,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      emailVerified: true,
      avatarUrl: profile.photos?.[0]?.value,
    };

    done(null, mappedUserObject);
  }
}
