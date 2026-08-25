import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminSessionsService } from './admin-sessions.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly sessions: AdminSessionsService) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.sessions.expectedKey().length < 8) {
      throw new UnauthorizedException('Админка не настроена');
    }
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const id = this.sessions.readCookie(
      Array.isArray(request.headers.cookie)
        ? request.headers.cookie.join('; ')
        : request.headers.cookie,
    );
    if (!this.sessions.valid(id)) {
      throw new UnauthorizedException('Нужен ключ админа');
    }
    return true;
  }
}
