import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import { Twilio } from 'twilio';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterPhoneDto } from './dto/register-phone.dto';
import { OtpPurpose, UserRole } from '@prisma/client';

const BCRYPT_ROUNDS = 12;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const IS_PROD = process.env['NODE_ENV'] === 'production';
const STATIC_OTP = '123456'; // used in all non-production environments

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly resend: Resend;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.resend = new Resend(this.config.getOrThrow('RESEND_API_KEY'));
  }

  async register(dto: RegisterDto, role: UserRole = UserRole.learner) {
    await this.verifyCaptcha(dto.captchaToken);
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role,
        profile: {
          create: { displayName: dto.displayName },
        },
      },
      include: { profile: true },
    });

    await this.sendVerificationEmail(user.id);

    this.logger.log(`User registered: ${user.id}`);
    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    await this.verifyCaptcha(dto.captchaToken);
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.issueTokens(user.id, user.email, user.role);
  }

  private issueTokens(sub: string, email: string, role: UserRole) {
    const payload = { sub, email, role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  // ─── OTP helpers ──────────────────────────────────────────────────────────

  /**
   * In production: random 6-digit OTP.
   * In all other environments: static '123456' so tests/staging never need real codes.
   */
  private generateOtp(): string {
    if (!IS_PROD) return STATIC_OTP;
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private async sendSmsOtp(phone: string, code: string): Promise<void> {
    if (!IS_PROD) {
      this.logger.debug(`[DEV] SMS OTP for ${phone}: ${code}`);
      return;
    }
    const twilio = new Twilio(
      this.config.getOrThrow<string>('TWILIO_ACCOUNT_SID'),
      this.config.getOrThrow<string>('TWILIO_AUTH_TOKEN'),
    );
    const from = this.config.getOrThrow<string>('TWILIO_WHATSAPP_FROM');
    await twilio.messages.create({
      body: `Your Speakoo verification code is: ${code}. It expires in 10 minutes.`,
      from,
      to: phone,
    });
    this.logger.log(`SMS OTP sent to ${phone}`);
  }

  private async sendEmailOtp(
    to: string,
    subject: string,
    html: string,
    failureLogPrefix: string,
    failureMessage: string,
  ): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.config.getOrThrow('RESEND_FROM_EMAIL'),
      to,
      subject,
      html,
    });
    if (error) {
      this.logger.error(`${failureLogPrefix}: ${error.message}`);
      throw new BadRequestException(failureMessage);
    }
  }

  private async createOtp(userId: string, purpose: OtpPurpose): Promise<string> {
    const code = this.generateOtp();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Invalidate any previous unused OTPs for this user + purpose
    await this.prisma.otpCode.updateMany({
      where: { userId, purpose, used: false },
      data: { used: true },
    });

    await this.prisma.otpCode.create({
      data: { userId, codeHash, purpose, expiresAt },
    });

    return code;
  }

  private async consumeOtp(userId: string, purpose: OtpPurpose, code: string): Promise<void> {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: { userId, purpose, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new BadRequestException('Invalid or expired code');

    const valid = await bcrypt.compare(code, otpRecord.codeHash);
    if (!valid) throw new BadRequestException('Invalid or expired code');

    await this.prisma.otpCode.update({ where: { id: otpRecord.id }, data: { used: true } });
  }

  // ─── Email verification ────────────────────────────────────────────────────

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.isVerified) return;

    const code = await this.createOtp(userId, OtpPurpose.email_verification);
    const appName = this.config.get<string>('APP_NAME', 'Speakoo');

    await this.sendEmailOtp(
      user.email,
      `${appName} — Verify your email`,
      `<p>Your email verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
      `Failed to send verification email to ${user.email}`,
      'Failed to send verification email — please try again later',
    );

    this.logger.log(`Verification email sent to ${user.email}`);
  }

  async verifyEmail(userId: string, code: string): Promise<void> {
    await this.consumeOtp(userId, OtpPurpose.email_verification, code);
    await this.prisma.user.update({ where: { id: userId }, data: { isVerified: true } });
  }

  // ─── Password reset ────────────────────────────────────────────────────────

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return successfully to avoid user enumeration
    if (!user) return;

    const code = await this.createOtp(user.id, OtpPurpose.password_reset);
    const appName = this.config.get<string>('APP_NAME', 'Speakoo');

    await this.sendEmailOtp(
      user.email,
      `${appName} — Reset your password`,
      `<p>Your password reset code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
      `Failed to send password reset email to ${user.email}`,
      'Failed to send password reset email — please try again later',
    );

    this.logger.log(`Password reset email sent to ${user.email}`);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Invalid or expired code');

    await this.consumeOtp(user.id, OtpPurpose.password_reset, code);

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  }

  // ─── Phone registration / verification ───────────────────────────────────────

  async registerPhone(dto: RegisterPhoneDto): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { phoneNumber: dto.phone } });
    if (existing) throw new ConflictException('Phone number already registered');

    // Random placeholder password hash — user will authenticate via OTP only
    const passwordHash = await bcrypt.hash(randomUUID(), BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: `phone_${dto.phone.replace('+', '')}@speakoo.internal`,
        passwordHash,
        phoneNumber: dto.phone,
        role: dto.role ?? UserRole.learner,
        profile: {
          create: {
            displayName: dto.fullName,
            phoneNumber: dto.phone,
          },
        },
      },
    });

    const code = await this.createOtp(user.id, OtpPurpose.phone_verification);
    await this.sendSmsOtp(dto.phone, code);
    this.logger.log(`Phone registration OTP sent to ${dto.phone}`);
  }

  async verifyPhoneOtp(phone: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { phoneNumber: phone } });
    if (!user) throw new BadRequestException('Invalid or expired code');

    await this.consumeOtp(user.id, OtpPurpose.phone_verification, otp);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true },
    });

    this.logger.log(`Phone verified for user ${user.id}`);
    return this.issueTokens(user.id, user.email, user.role);
  }

  async resendEmailOtp(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) return; // silent — prevents email enumeration

    const code = await this.createOtp(user.id, OtpPurpose.email_verification);
    const appName = this.config.get<string>('APP_NAME', 'Speakoo');

    await this.sendEmailOtp(
      user.email,
      `${appName} — Verify your email`,
      `<p>Your email verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
      `Failed to resend verification email to ${user.email}`,
      'Failed to resend verification email — please try again later',
    );

    this.logger.log(`Verification email resent to ${user.email}`);
  }

  async resendPhoneOtp(phone: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { phoneNumber: phone } });
    if (!user) return; // silent — prevents phone enumeration
    const code = await this.createOtp(user.id, OtpPurpose.phone_verification);
    await this.sendSmsOtp(phone, code);
  }

  // ─── Social login (OAuth stub) ─────────────────────────────────────────────

  /**
   * Social login handler.
   * In production, this would validate OAuth tokens with Google, Facebook, or Apple.
   * For now, returns "not implemented" error to guide clients.
   */
  async socialLogin(
    provider: string,
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const supportedProviders = ['google', 'facebook', 'apple'];
    const normalizedProvider = provider.toLowerCase().trim();

    if (!supportedProviders.includes(normalizedProvider)) {
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    // TODO: Implement OAuth token validation for each provider
    // For now, return error to prevent misuse
    throw new BadRequestException(
      `Social login via ${normalizedProvider} is not yet implemented. Please sign up with email and password.`,
    );
  }

  // ─── hCaptcha verification ────────────────────────────────────────────────

  /**
   * Verifies a hCaptcha token with the hCaptcha siteverify API.
   * No-ops when HCAPTCHA_ENABLED is not 'true'.
   * Per coding standards rule 30: credentials are lazy-loaded inside the method, not the constructor.
   */
  private async verifyCaptcha(captchaToken?: string): Promise<void> {
    const enabled = this.config.get<string>('HCAPTCHA_ENABLED');
    if (enabled !== 'true') return;

    if (!captchaToken) {
      throw new BadRequestException('Captcha verification is required');
    }

    const secret = this.config.getOrThrow<string>('HCAPTCHA_SECRET');
    const body = new URLSearchParams({ secret, response: captchaToken });

    let json: { success: boolean };
    try {
      const res = await fetch('https://api.hcaptcha.com/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      json = (await res.json()) as { success: boolean };
    } catch (err) {
      this.logger.error('hCaptcha siteverify request failed', err);
      throw new BadRequestException('Captcha verification failed — please try again');
    }

    if (!json.success) {
      throw new BadRequestException('Captcha verification failed — please complete the challenge');
    }
  }
}
