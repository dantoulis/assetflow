import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_TTL_MS } from './auth.constants';
import type { SafeUser } from '../users/types';
import type { AuthenticatedRequest } from './types';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookie(response: Response, token: string): void {
    response.cookie(ACCESS_TOKEN_COOKIE, token, {
      ...this.getCookieOptions(),
      maxAge: ACCESS_TOKEN_TTL_MS,
    });
  }

  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SafeUser> {
    const { token, user } = await this.authService.login(loginUserDto);
    this.setCookie(response, token);

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): { success: true } {
    response.clearCookie(ACCESS_TOKEN_COOKIE, this.getCookieOptions());

    return { success: true };
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('register')
  async register(
    @Res({ passthrough: true }) response: Response,
    @Body() createUserDto: CreateUserDto,
  ): Promise<SafeUser> {
    const { token, user } = await this.authService.register(createUserDto);
    this.setCookie(response, token);

    return user;
  }

  @Get('me')
  async me(@Req() request: AuthenticatedRequest): Promise<SafeUser> {
    const id = request.user?.sub;

    if (!id) {
      throw new UnauthorizedException();
    }

    return this.authService.me(id);
  }
}
