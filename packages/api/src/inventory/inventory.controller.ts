import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Inventaire')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('items')
  findItems(@Query() pagination: PaginationDto, @Query('propertyId') propertyId?: string) {
    return this.inventoryService.findItems(pagination, propertyId);
  }

  @Post('items')
  createItem(@Body() dto: any) { return this.inventoryService.createItem(dto); }

  @Post('movements')
  addMovement(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.inventoryService.addStockMovement(dto, userId);
  }

  @Get('alerts')
  getLowStock(@Query('propertyId') propertyId: string) {
    return this.inventoryService.getLowStockAlerts(propertyId);
  }
}
