import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Param,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterPhoneDto } from './dto/register-phone.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { ResendEmailOtpDto } from './dto/resend-email-otp.dto';
import { ResendPhoneOtpDto } from './dto/resend-phone-otp.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { Public } from './decorators/public.decorator';
import { CaptchaGuard } from './guards/captcha.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const REFRESH_COOKIE = 'speakoo_refresh';
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @UseGuards(CaptchaGuard)
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.register(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @UseGuards(CaptchaGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    let payload: { sub: string };
    try {
      payload = this.jwt.verify<{ sub: string }>(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      this.clearRefreshCookie(res);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.authService.refresh(payload.sub);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearRefreshCookie(res);
  }

  @Post('send-verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendVerification(@Req() req: Request & { user: { sub: string } }) {
    await this.authService.sendVerificationEmail(req.user.sub);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(
    @Req() req: Request & { user: { sub: string } },
    @Body() dto: VerifyEmailDto,
  ) {
    await this.authService.verifyEmail(req.user.sub, dto.code);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.sendPasswordResetEmail(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  // ─── Phone OTP routes ──────────────────────────────────────────────────────

  @Public()
  @Post('register-phone')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerPhone(@Body() dto: RegisterPhoneDto) {
    await this.authService.registerPhone(dto);
  }

  @Public()
  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  async verifyPhone(
    @Body() dto: VerifyPhoneDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.verifyPhoneOtp(dto.phone, dto.otp);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('resend-email-otp')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendEmailOtp(@Body() dto: ResendEmailOtpDto) {
    await this.authService.resendEmailOtp(dto.email);
  }

  @Public()
  @Post('resend-phone-otp')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendPhoneOtp(@Body() dto: ResendPhoneOtpDto) {
    await this.authService.resendPhoneOtp(dto.phone);
  }

  // ─── Social login (OAuth stub) ─────────────────────────────────────────────

  @Public()
  @UseGuards(CaptchaGuard)
  @Throttle({ auth: { ttl: 15 * 60_000, limit: 5 } })
  @Post('social/:provider')
  @HttpCode(HttpStatus.OK)
  async socialLogin(
    @Param('provider') provider: string,
    @Body() dto: SocialLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.socialLogin(provider, dto.token);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE_MS,
      path: '/api/v1/auth',
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
  }
}
