import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import type { SafeUser, SocialProfile } from '../users/types';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { JwtPayload, ResetPasswordTokenPayload } from './types';
import { MailService } from '../mail/mail.service';
import { PASSWORD_RESET_TOKEN_TTL, PASSWORD_RESET_TOKEN_TYPE } from './auth.constants';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { getFrontendUrl } from '../common/utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private async signUserJwt(user: SafeUser): Promise<{ token: string; user: SafeUser }> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return { token, user };
  }

  async login(loginUserDto: LoginUserDto): Promise<{ token: string; user: SafeUser }> {
    const user = await this.userService.findOneWithCreds({ username: loginUserDto.username });

    if (!user || !user.password) {
      throw new UnauthorizedException();
    }

    const passwordsMatch = await bcrypt.compare(loginUserDto.password, user.password);

    if (!passwordsMatch) {
      throw new UnauthorizedException();
    }

    const { password, ...safeUser } = user;
    void password;

    return this.signUserJwt(safeUser);
  }

  async loginWithProvider(profile: SocialProfile): Promise<{ token: string; user: SafeUser }> {
    const linkedAccount = await this.userService.findOneAuthAccount(profile);

    if (linkedAccount) {
      return this.signUserJwt(linkedAccount.user);
    }

    if (!profile.email) {
      throw new UnauthorizedException('Social account email is missing or not verified');
    }

    const existingUser = await this.userService.findOneByEmail(profile.email);

    if (existingUser) {
      await this.userService.linkSocialAccount(existingUser.id, profile);
      return this.signUserJwt(existingUser);
    }

    const createdUser = await this.userService.createSocialUser(profile);

    return this.signUserJwt(createdUser);
  }

  async register(createUserDto: CreateUserDto): Promise<{ token: string; user: SafeUser }> {
    const safeUser = await this.userService.create(createUserDto);

    return this.signUserJwt(safeUser);
  }

  async validateResetPasswordToken(token: string): Promise<{ valid: true }> {
    await this.resolveResetPasswordUser(token);

    return { valid: true };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ success: true }> {
    const user = await this.resolveResetPasswordUser(resetPasswordDto.token);

    await this.userService.updatePassword(user.id, resetPasswordDto.password);

    return { success: true };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ success: true }> {
    const user = await this.userService.findOneByEmail(forgotPasswordDto.email);

    if (!user) {
      return { success: true };
    }

    const resetUrl = await this.buildResetUrl(user);

    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return { success: true };
  }

  private async buildResetUrl(user: SafeUser): Promise<string> {
    const resetToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type: PASSWORD_RESET_TOKEN_TYPE,
        userUpdatedAt: user.updatedAt.toISOString(),
      } satisfies ResetPasswordTokenPayload,
      {
        expiresIn: PASSWORD_RESET_TOKEN_TTL,
      },
    );

    const frontendUrl = getFrontendUrl();
    const resetPasswordBaseUrl =
      process.env.PASSWORD_RESET_URL_BASE ??
      (frontendUrl ? `${frontendUrl}/reset-password` : undefined);

    if (!resetPasswordBaseUrl) {
      throw new InternalServerErrorException('PASSWORD_RESET_URL_BASE is not configured');
    }

    return `${resetPasswordBaseUrl}?token=${encodeURIComponent(resetToken)}`;
  }

  private async resolveResetPasswordUser(token: string): Promise<SafeUser> {
    let payload: ResetPasswordTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<ResetPasswordTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (payload.type !== PASSWORD_RESET_TOKEN_TYPE || !payload.email || !payload.userUpdatedAt) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = await this.userService.findOneByEmail(payload.email);

    if (!user || user.updatedAt.toISOString() !== payload.userUpdatedAt) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    return user;
  }

  async me(id: number): Promise<SafeUser> {
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
