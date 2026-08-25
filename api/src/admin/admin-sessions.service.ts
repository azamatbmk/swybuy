import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { safeEqual } from '../lib/safe-equal';

const TTL_MS = 12 * 60 * 60 * 1000;
export const ADMIN_COOKIE = 'swybuy_admin';

@Injectable()
export class AdminSessionsService {
  private readonly sessions = new Map<string, number>();

  constructor(private readonly config: ConfigService) {}

  expectedKey() {
    return this.config.get<string>('ADMIN_KEY') || '';
  }

  create(key: string) {
    const expected = this.expectedKey();
    if (expected.length < 8 || !safeEqual(key, expected)) {
      return null;
    }
    this.prune();
    const id = randomBytes(24).toString('hex');
    this.sessions.set(id, Date.now() + TTL_MS);
    return id;
  }

  valid(id?: string) {
    if (!id) {
      return false;
    }
    const expires = this.sessions.get(id);
    if (!expires || expires < Date.now()) {
      this.sessions.delete(id);
      return false;
    }
    return true;
  }

  destroy(id?: string) {
    if (id) {
      this.sessions.delete(id);
    }
  }

  cookieHeader(id: string, secure: boolean) {
    const parts = [
      `${ADMIN_COOKIE}=${id}`,
      'HttpOnly',
      'Path=/',
      'SameSite=Strict',
      `Max-Age=${Math.floor(TTL_MS / 1000)}`,
    ];
    if (secure) {
      parts.push('Secure');
    }
    return parts.join('; ');
  }

  clearCookieHeader(secure: boolean) {
    const parts = [
      `${ADMIN_COOKIE}=`,
      'HttpOnly',
      'Path=/',
      'SameSite=Strict',
      'Max-Age=0',
    ];
    if (secure) {
      parts.push('Secure');
    }
    return parts.join('; ');
  }

  readCookie(header?: string) {
    if (!header) {
      return '';
    }
    for (const part of header.split(';')) {
      const [name, ...rest] = part.trim().split('=');
      if (name === ADMIN_COOKIE) {
        return rest.join('=');
      }
    }
    return '';
  }

  private prune() {
    const now = Date.now();
    for (const [id, expires] of this.sessions) {
      if (expires < now) {
        this.sessions.delete(id);
      }
    }
  }
}
