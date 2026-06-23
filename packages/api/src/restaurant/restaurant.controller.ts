import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Restaurant')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get('menu/:propertyId')
  getMenu(@Param('propertyId') propertyId: string) { return this.restaurantService.findMenu(propertyId); }

  @Get('orders')
  findOrders(@Query() pagination: PaginationDto, @Query('propertyId') propertyId?: string) {
    return this.restaurantService.findOrders(pagination, propertyId);
  }

  @Post('orders')
  createOrder(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.restaurantService.createOrder(dto, userId);
  }
}
