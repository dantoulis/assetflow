import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import type { Profile, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategyService extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3333/auth/google/callback',
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
