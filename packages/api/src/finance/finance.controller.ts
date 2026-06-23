import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Finance')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'Lister les factures' })
  findInvoices(@Query() pagination: PaginationDto, @Query('propertyId') propertyId?: string) {
    return this.financeService.findAllInvoices(pagination, propertyId);
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Créer une facture' })
  createInvoice(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.financeService.createInvoice(dto, userId);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Enregistrer un paiement' })
  recordPayment(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.financeService.recordPayment(dto, userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Résumé financier mensuel' })
  getSummary(
    @Query('propertyId') propertyId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.financeService.getFinanceSummary(propertyId, month, year);
  }
}
