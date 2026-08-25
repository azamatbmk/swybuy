import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PublishShelfDto, UpdateShelfDto } from './dto/publish-shelf.dto';
import { ShelvesService } from './shelves.service';

@Controller('shelves')
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Post('from-order/:orderId')
  publish(
    @Param('orderId') orderId: string,
    @Body() dto: PublishShelfDto,
  ) {
    return this.shelvesService.publishFromOrder(orderId, dto);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.shelvesService.findPublic(slug);
  }

  @Patch(':slug')
  update(@Param('slug') slug: string, @Body() dto: UpdateShelfDto) {
    return this.shelvesService.update(slug, dto);
  }
}
