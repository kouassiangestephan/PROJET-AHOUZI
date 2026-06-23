import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Rapports')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Tableau de bord exécutif' })
  getDashboard(@Query('propertyId') propertyId?: string) {
    return this.reportsService.getExecutiveDashboard(propertyId);
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Rapport d\'occupation' })
  getOccupancy(
    @Query('propertyId') propertyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getOccupancyReport(propertyId, startDate, endDate);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Rapport de revenus' })
  getRevenue(
    @Query('propertyId') propertyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getRevenueReport(propertyId, startDate, endDate);
  }
}
