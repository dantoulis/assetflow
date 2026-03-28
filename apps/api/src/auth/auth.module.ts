import { Module, type Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategyService } from './strategies/google.strategy';
import { GithubStrategyService } from './strategies/github.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { MailModule } from '../mail/mail.module';
import { getJwtSecret, isGithubAuthConfigured, isGoogleAuthConfigured } from '../common/utils';

const oauthStrategyProviders: Provider[] = [];

if (isGoogleAuthConfigured()) {
  oauthStrategyProviders.push(GoogleStrategyService);
}

if (isGithubAuthConfigured()) {
  oauthStrategyProviders.push(GithubStrategyService);
}

@Module({
  imports: [
    MailModule,
    PassportModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: getJwtSecret(),
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...oauthStrategyProviders,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
