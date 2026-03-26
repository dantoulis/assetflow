import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import type { SafeUser } from '../users/types';
import type { JwtPayload } from './types';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<{ token: string; user: SafeUser }> {
    const user = await this.userService.findOneWithCreds({ username: loginUserDto.username });
    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordsMatch = await bcrypt.compare(loginUserDto.password, user?.password);
    if (!passwordsMatch) {
      throw new UnauthorizedException();
    }

    const { password, ...safeUser } = user;
    void password;
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);

    return { token, user: safeUser };
  }

  async register(createUserDto: CreateUserDto): Promise<{ token: string; user: SafeUser }> {
    const safeUser = await this.userService.create(createUserDto);

    const payload: JwtPayload = {
      sub: safeUser.id,
      username: safeUser.username,
      email: safeUser.email,
      role: safeUser.role,
    };
    const token = await this.jwtService.signAsync(payload);

    return { token, user: safeUser };
  }

  async me(id: number): Promise<SafeUser> {
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
