import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import type { SafeUser, SocialProfile } from '../users/types';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
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

  async me(id: number): Promise<SafeUser> {
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
