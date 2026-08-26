import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AdminSessionsService } from './admin-sessions.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import {
  CreateProductDto,
  UpdateProductDto,
} from '../products/dto/save-product.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AuthorsService } from '../authors/authors.service';
import { SaveAuthorDto } from '../authors/dto/save-author.dto';
import { ShopSettingsDto } from './dto/shop-settings.dto';
import { clientIp, rateLimit } from '../lib/rate-limit';

function isSecureRequest(request: {
  protocol?: string;
  headers: Record<string, string | string[] | undefined>;
}) {
  if (process.env.NODE_ENV === 'production') {
    return true;
  }
  if (request.protocol === 'https') {
    return true;
  }
  const proto = request.headers['x-forwarded-proto'];
  const value = Array.isArray(proto) ? proto[0] : proto;
  return value === 'https' || Boolean(process.env.WEB_ORIGIN?.startsWith('https://'));
}

@Controller('admin')
export class AdminController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly authorsService: AuthorsService,
    private readonly sessions: AdminSessionsService,
  ) {}

  @Post('login')
  login(
    @Body() body: AdminLoginDto,
    @Req()
    request: {
      headers: Record<string, string | string[] | undefined>;
      ip?: string;
      protocol?: string;
    },
    @Res({ passthrough: true })
    response: { setHeader: (name: string, value: string) => void },
  ) {
    if (!rateLimit(`admin:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
      throw new HttpException('Слишком много попыток', HttpStatus.TOO_MANY_REQUESTS);
    }
    const id = this.sessions.create(body.key);
    if (!id) {
      throw new HttpException('Нужен ключ админа', HttpStatus.UNAUTHORIZED);
    }
    const secure = isSecureRequest(request);
    response.setHeader('Set-Cookie', this.sessions.cookieHeader(id, secure));
    return { ok: true };
  }

  @Post('logout')
  logout(
    @Req()
    request: {
      headers: Record<string, string | string[] | undefined>;
      protocol?: string;
    },
    @Res({ passthrough: true })
    response: { setHeader: (name: string, value: string) => void },
  ) {
    this.sessions.destroy(
      this.sessions.readCookie(
        Array.isArray(request.headers.cookie)
          ? request.headers.cookie.join('; ')
          : request.headers.cookie,
      ),
    );
    response.setHeader(
      'Set-Cookie',
      this.sessions.clearCookieHeader(isSecureRequest(request)),
    );
    return { ok: true };
  }

  @Get('ping')
  @UseGuards(AdminGuard)
  ping() {
    return { ok: true };
  }

  @Get('orders')
  @UseGuards(AdminGuard)
  orders() {
    return this.ordersService.findAllAdmin();
  }

  @Patch('orders/:id')
  @UseGuards(AdminGuard)
  updateOrder(@Param('id') id: string, @Body() body: UpdateOrderDto) {
    return this.ordersService.updateAdmin(id, body);
  }

  @Get('products')
  @UseGuards(AdminGuard)
  products() {
    return this.productsService.findAllAdmin();
  }

  @Get('settings')
  @UseGuards(AdminGuard)
  settings() {
    return this.productsService.getSettings();
  }

  @Patch('settings')
  @UseGuards(AdminGuard)
  updateSettings(@Body() body: ShopSettingsDto) {
    return this.productsService.updateSettings(body);
  }

  @Post('products')
  @UseGuards(AdminGuard)
  createProduct(@Body() body: CreateProductDto) {
    return this.productsService.createAdmin(body);
  }

  @Patch('products/:id')
  @UseGuards(AdminGuard)
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productsService.updateAdmin(id, body);
  }

  @Get('authors')
  @UseGuards(AdminGuard)
  authors() {
    return this.authorsService.findAllAdmin();
  }

  @Post('authors')
  @UseGuards(AdminGuard)
  createAuthor(@Body() body: SaveAuthorDto) {
    return this.authorsService.createAdmin(body);
  }

  @Patch('authors/:id')
  @UseGuards(AdminGuard)
  updateAuthor(@Param('id') id: string, @Body() body: SaveAuthorDto) {
    return this.authorsService.updateAdmin(id, body);
  }
}
