import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Shop')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('shop')
export class ShopController {
  constructor(private readonly service: ShopService) {}

  @Get() findAll(@Query() p: PaginationDto, @Query('propertyId') pid?: string) { return this.service.findAll(p, pid); }
  @Post() create(@Body() dto: any) { return this.service.create(dto); }
}
