import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Maintenance')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto, @Query('propertyId') propertyId?: string) {
    return this.maintenanceService.findAll(pagination, propertyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un ticket de maintenance' })
  create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.maintenanceService.create(dto, userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @CurrentUser('id') userId: string) {
    return this.maintenanceService.updateStatus(id, status, userId);
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body('assignedToId') assignedToId: string) {
    return this.maintenanceService.assign(id, assignedToId);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() body: any, @CurrentUser('id') userId: string) {
    return this.maintenanceService.addComment(id, body.content, body.isInternal, userId);
  }
}
