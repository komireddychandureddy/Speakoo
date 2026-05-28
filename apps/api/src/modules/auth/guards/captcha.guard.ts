import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as https from 'https';

/**
 * CaptchaGuard — validates an hCaptcha token sent by the client.
 *
 * Behaviour by environment:
 *  - NODE_ENV === 'production'  → calls hCaptcha siteverify API; rejects on failure
 *  - any other env (dev/staging) → passes through with a warning log (no network call)
 *
 * The client must send the token in the request body as { captchaToken: "..." }.
 */
@Injectable()
export class CaptchaGuard implements CanActivate {
  private readonly logger = new Logger(CaptchaGuard.name);

  constructor(private readonly config: ConfigService) {}

  private isCaptchaEnabled(): boolean {
    const enabledFlag = this.config.get<string>('HCAPTCHA_ENABLED')?.toLowerCase();
    if (enabledFlag === 'true') return true;
    if (enabledFlag === 'false') return false;

    const isProd = process.env['NODE_ENV'] === 'production';
    if (!isProd) return false;

    const secret = this.config.get<string>('HCAPTCHA_SECRET')?.trim();
    const hasSecret =
      typeof secret === 'string' &&
      secret.length > 0 &&
      secret !== '0x0000000000000000000000000000000000000000';

    return hasSecret;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.isCaptchaEnabled()) {
      this.logger.debug('Captcha validation disabled');
      return true;
    }

    const req = context.switchToHttp().getRequest<Request & { body: Record<string, unknown> }>();
    const token = req.body?.['captchaToken'];

    if (typeof token !== 'string' || token.trim().length === 0) {
      throw new BadRequestException('Captcha token is required');
    }

    const secret = this.config.getOrThrow<string>('HCAPTCHA_SECRET');
    const verified = await this.verifyHCaptcha(secret, token.trim());

    if (!verified) {
      throw new BadRequestException('Captcha verification failed');
    }

    return true;
  }

  private verifyHCaptcha(secret: string, token: string): Promise<boolean> {
    return new Promise((resolve) => {
      const body = `response=${encodeURIComponent(token)}&secret=${encodeURIComponent(secret)}`;

      const options = {
        hostname: 'hcaptcha.com',
        path: '/siteverify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk: string) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const json = JSON.parse(data) as { success: boolean };
            resolve(json.success === true);
          } catch {
            resolve(false);
          }
        });
      });

      req.on('error', () => resolve(false));
      req.write(body);
      req.end();
    });
  }
}
