import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const key = request.headers['x-admin-key'];
    if (!key || key !== this.config.get<string>('ADMIN_KEY')) {
      throw new UnauthorizedException('Нужен ключ админа');
    }
    return true;
  }
}
