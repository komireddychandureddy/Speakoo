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
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { verifyIdToken } from 'apple-signin-auth';
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

    // Check if email is already registered
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('Email already registered');

    // Check if phone is already registered (if provided)
    if (dto.phoneNumber) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phoneNumber: dto.phoneNumber },
      });
      if (existingPhone) throw new ConflictException('Phone number already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role,
        phoneNumber: dto.phoneNumber,
        profile: {
          create: {
            displayName: dto.displayName,
            phoneNumber: dto.phoneNumber,
          },
        },
      },
      include: { profile: true },
    });

    // Send email verification OTP â€” failure must not block registration
    try {
      await this.sendVerificationEmail(user.id);
    } catch (err) {
      this.logger.error(
        `Registration email failed for ${user.email} (user created, verify later): ${(err as Error).message}`,
      );
    }

    // Send phone verification OTP if phone number provided
    if (dto.phoneNumber) {
      const code = await this.createOtp(user.id, OtpPurpose.phone_verification);
      await this.sendSmsOtp(dto.phoneNumber, code);
      this.logger.log(`Phone verification OTP sent to ${dto.phoneNumber}`);
    }

    this.logger.log(`User registered: ${user.id}`);
    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    await this.verifyCaptcha(dto.captchaToken);

    // Validate that at least one identifier is provided
    if (!dto.email && !dto.phone) {
      throw new UnauthorizedException('Email or phone number is required');
    }

    // Find user by email or phone
    const orConditions = [
      dto.email ? { email: dto.email } : undefined,
      dto.phone ? { phoneNumber: dto.phone } : undefined,
    ].filter((x): x is NonNullable<typeof x> => x !== undefined);

    const user = await this.prisma.user.findFirst({
      where: { OR: orConditions },
    });

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

  // â”€â”€â”€ OTP helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  private buildOtpEmailHtml(
    appName: string,
    heading: string,
    code: string,
    purpose: string,
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden">
        <tr><td style="background:#16a34a;padding:24px 32px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700">${appName}</h1>
        </td></tr>
        <tr><td style="padding:32px;color:#111827">
          <h2 style="margin:0 0 8px;font-size:20px">${heading}</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Use the code below to ${purpose}. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px">
            <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#15803d">${code}</span>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:12px">If you did not request this code, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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

  // â”€â”€â”€ Email verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.isVerified) return;

    const code = await this.createOtp(userId, OtpPurpose.email_verification);
    const appName = this.config.get<string>('APP_NAME', 'Speakoo');

    await this.sendEmailOtp(
      user.email,
      `${appName} â€” Verify your email`,
      this.buildOtpEmailHtml(
        appName,
        'Verify your email address',
        code,
        'verify your email address',
      ),
      `Failed to send verification email to ${user.email}`,
      'Failed to send verification email â€” please try again later',
    );

    this.logger.log(`Verification email sent to ${user.email}`);
  }

  async verifyEmail(userId: string, code: string): Promise<void> {
    await this.consumeOtp(userId, OtpPurpose.email_verification, code);
    await this.prisma.user.update({ where: { id: userId }, data: { isVerified: true } });
  }

  // â”€â”€â”€ Password reset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return successfully to avoid user enumeration
    if (!user) return;

    const code = await this.createOtp(user.id, OtpPurpose.password_reset);
    const appName = this.config.get<string>('APP_NAME', 'Speakoo');

    await this.sendEmailOtp(
      user.email,
      `${appName} â€” Reset your password`,
      this.buildOtpEmailHtml(appName, 'Reset your password', code, 'reset your password'),
      `Failed to send password reset email to ${user.email}`,
      'Failed to send password reset email â€” please try again later',
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

  // â”€â”€â”€ Phone registration / verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async registerPhone(dto: RegisterPhoneDto): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { phoneNumber: dto.phone } });
    if (existing) throw new ConflictException('Phone number already registered');

    // Random placeholder password hash â€” user will authenticate via OTP only
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
    if (!user || user.isVerified) return; // silent â€” prevents email enumeration

    const code = await this.createOtp(user.id, OtpPurpose.email_verification);
    const appName = this.config.get<string>('APP_NAME', 'Speakoo');

    await this.sendEmailOtp(
      user.email,
      `${appName} â€” Verify your email`,
      this.buildOtpEmailHtml(
        appName,
        'Verify your email address',
        code,
        'verify your email address',
      ),
      `Failed to resend verification email to ${user.email}`,
      'Failed to resend verification email â€” please try again later',
    );

    this.logger.log(`Verification email resent to ${user.email}`);
  }

  async resendPhoneOtp(phone: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { phoneNumber: phone } });
    if (!user) return; // silent â€” prevents phone enumeration
    const code = await this.createOtp(user.id, OtpPurpose.phone_verification);
    await this.sendSmsOtp(phone, code);
  }

  // â”€â”€â”€ Social login (OAuth stub) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Social login handler.
   * Validates OAuth tokens with Google, Facebook, or Apple.
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

    if (normalizedProvider === 'google') {
      return this.googleLogin(token);
    }

    if (normalizedProvider === 'facebook') {
      return this.facebookLogin(token);
    }

    if (normalizedProvider === 'apple') {
      return this.appleLogin(token);
    }

    throw new BadRequestException(`Unsupported provider: ${provider}`);
  }

  private async googleLogin(
    idToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException(
        'Google login is not configured on this server. Please use email/password login.',
      );
    }

    const client = new OAuth2Client(clientId);
    let payload: { email?: string; email_verified?: boolean; name?: string; sub?: string };

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });
      const ticketPayload = ticket.getPayload();
      if (!ticketPayload) {
        throw new BadRequestException('Invalid Google ID token');
      }
      payload = ticketPayload;
    } catch (err) {
      this.logger.error('Google token verification failed', err);
      throw new BadRequestException('Invalid Google ID token');
    }

    if (!payload.email || !payload.sub) {
      throw new BadRequestException('Google account must have a verified email');
    }

    if (payload.email_verified === false) {
      throw new BadRequestException(
        'Google email is not verified. Please verify your email at Google and try again.',
      );
    }

    // Look up by provider ID first (prevents account takeover via email change)
    const socialAccount = await this.prisma.socialAccount.findUnique({
      where: { provider_providerId: { provider: 'google', providerId: payload.sub } },
      include: { user: true },
    });

    if (socialAccount) {
      // Existing social login â€” return tokens
      return this.issueTokens(
        socialAccount.user.id,
        socialAccount.user.email,
        socialAccount.user.role,
      );
    }

    // No existing social account â€” check if email exists
    let user = await this.prisma.user.findUnique({ where: { email: payload.email } });

    if (user) {
      // Email exists â€” link this Google account to existing user
      await this.prisma.socialAccount.create({
        data: {
          userId: user.id,
          provider: 'google',
          providerId: payload.sub,
        },
      });
      this.logger.log(`Google account linked to existing user: ${user.id} (${payload.email})`);
    } else {
      // Create new user + social account
      const passwordHash = await bcrypt.hash(randomUUID(), BCRYPT_ROUNDS);
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          passwordHash, // Random â€” social users don't authenticate via password
          role: UserRole.learner,
          isVerified: true, // Google email_verified checked above
          profile: {
            create: {
              displayName: payload.name ?? payload.email.split('@')[0],
            },
          },
          socialAccounts: {
            create: {
              provider: 'google',
              providerId: payload.sub,
            },
          },
        },
      });
      this.logger.log(`User created via Google OAuth: ${user.id} (${payload.email})`);
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  private async facebookLogin(
    accessToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const appId = this.config.get<string>('FACEBOOK_APP_ID');
    const appSecret = this.config.get<string>('FACEBOOK_APP_SECRET');

    if (!appId || !appSecret) {
      throw new BadRequestException(
        'Facebook login is not configured on this server. Please use email/password login.',
      );
    }

    try {
      // Verify the access token and get user data
      const { data } = await axios.get<{
        id: string;
        email?: string;
        name?: string;
      }>(`https://graph.facebook.com/me`, {
        params: {
          fields: 'id,email,name',
          access_token: accessToken,
        },
      });

      if (!data.email) {
        throw new BadRequestException('Facebook account must have a verified email');
      }

      // Verify the token belongs to our app
      const debugResponse = await axios.get<{
        data: { app_id: string; is_valid: boolean };
      }>(`https://graph.facebook.com/debug_token`, {
        params: {
          input_token: accessToken,
          access_token: `${appId}|${appSecret}`,
        },
      });

      if (!debugResponse.data.data.is_valid || debugResponse.data.data.app_id !== appId) {
        throw new BadRequestException('Invalid Facebook access token');
      }

      // Look up by provider ID first (prevents account takeover via email change)
      const socialAccount = await this.prisma.socialAccount.findUnique({
        where: { provider_providerId: { provider: 'facebook', providerId: data.id } },
        include: { user: true },
      });

      if (socialAccount) {
        // Existing social login â€” return tokens
        return this.issueTokens(
          socialAccount.user.id,
          socialAccount.user.email,
          socialAccount.user.role,
        );
      }

      // No existing social account â€” check if email exists
      let user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (user) {
        // Email exists â€” link this Facebook account to existing user
        await this.prisma.socialAccount.create({
          data: {
            userId: user.id,
            provider: 'facebook',
            providerId: data.id,
          },
        });
        this.logger.log(`Facebook account linked to existing user: ${user.id} (${data.email})`);
      } else {
        // Create new user + social account
        const passwordHash = await bcrypt.hash(randomUUID(), BCRYPT_ROUNDS);
        user = await this.prisma.user.create({
          data: {
            email: data.email,
            passwordHash, // Random â€” social users don't authenticate via password
            role: UserRole.learner,
            isVerified: true, // Facebook emails are considered verified
            profile: {
              create: {
                displayName: data.name ?? data.email.split('@')[0],
              },
            },
            socialAccounts: {
              create: {
                provider: 'facebook',
                providerId: data.id,
              },
            },
          },
        });
        this.logger.log(`User created via Facebook OAuth: ${user.id} (${data.email})`);
      }

      return this.issueTokens(user.id, user.email, user.role);
    } catch (err) {
      this.logger.error('Facebook token verification failed', err);
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Invalid Facebook access token');
    }
  }

  private async appleLogin(
    idToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const clientId = this.config.get<string>('APPLE_CLIENT_ID');

    if (!clientId) {
      throw new BadRequestException(
        'Apple login is not configured on this server. Please use email/password login.',
      );
    }

    try {
      // Verify the ID token with Apple's public keys
      const appleIdTokenPayload = await verifyIdToken(idToken, {
        audience: clientId,
      });

      if (!appleIdTokenPayload.email || !appleIdTokenPayload.sub) {
        throw new BadRequestException('Apple account must have a verified email');
      }

      // Check if this is an Apple Private Relay email
      const isPrivateRelay = appleIdTokenPayload.email.endsWith('privaterelay.appleid.com');

      // Look up by provider ID first (prevents account takeover via email change)
      const socialAccount = await this.prisma.socialAccount.findUnique({
        where: { provider_providerId: { provider: 'apple', providerId: appleIdTokenPayload.sub } },
        include: { user: true },
      });

      if (socialAccount) {
        // Existing social login â€” return tokens
        return this.issueTokens(
          socialAccount.user.id,
          socialAccount.user.email,
          socialAccount.user.role,
        );
      }

      // No existing social account â€” check if email exists
      let user = await this.prisma.user.findUnique({
        where: { email: appleIdTokenPayload.email },
      });

      if (user) {
        // Email exists â€” link this Apple account to existing user
        await this.prisma.socialAccount.create({
          data: {
            userId: user.id,
            provider: 'apple',
            providerId: appleIdTokenPayload.sub,
          },
        });
        this.logger.log(
          `Apple account linked to existing user: ${user.id} (${appleIdTokenPayload.email})`,
        );
      } else {
        // Create new user + social account
        const passwordHash = await bcrypt.hash(randomUUID(), BCRYPT_ROUNDS);
        user = await this.prisma.user.create({
          data: {
            email: appleIdTokenPayload.email,
            passwordHash, // Random â€” social users don't authenticate via password
            role: UserRole.learner,
            // Do NOT set isVerified for Apple Private Relay â€” prevents user from changing to real email
            isVerified: !isPrivateRelay,
            profile: {
              create: {
                displayName: appleIdTokenPayload.email.split('@')[0],
              },
            },
            socialAccounts: {
              create: {
                provider: 'apple',
                providerId: appleIdTokenPayload.sub,
              },
            },
          },
        });
        this.logger.log(
          `User created via Apple Sign In: ${user.id} (${appleIdTokenPayload.email}, privateRelay=${isPrivateRelay})`,
        );
      }

      return this.issueTokens(user.id, user.email, user.role);
    } catch (err) {
      this.logger.error('Apple token verification failed', err);
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Invalid Apple ID token');
    }
  }

  // â”€â”€â”€ hCaptcha verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      throw new BadRequestException('Captcha verification failed â€” please try again');
    }

    if (!json.success) {
      throw new BadRequestException(
        'Captcha verification failed â€” please complete the challenge',
      );
    }
  }
}
