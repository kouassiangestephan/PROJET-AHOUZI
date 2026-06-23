import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Dépenses')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto, @Query('propertyId') propertyId?: string) {
    return this.expensesService.findAll(pagination, propertyId);
  }

  @Get('categories')
  findCategories() { return this.expensesService.findCategories(); }

  @Post()
  create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.expensesService.create(dto, userId);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.expensesService.approve(id, userId);
  }

  @Patch(':id/pay')
  markPaid(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.expensesService.markPaid(id, userId);
  }
}
