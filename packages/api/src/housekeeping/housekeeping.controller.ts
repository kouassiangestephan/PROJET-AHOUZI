import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HousekeepingService } from './housekeeping.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Housekeeping')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('housekeeping')
export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'Lister les tâches de ménage' })
  findAll(@Query() pagination: PaginationDto, @Query('propertyId') propertyId?: string) {
    return this.housekeepingService.findAllTasks(pagination, propertyId);
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Créer une tâche de ménage' })
  create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.housekeepingService.createTask(dto, userId);
  }

  @Patch('tasks/:id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une tâche' })
  updateStatus(@Param('id') id: string, @Body('status') status: string, @CurrentUser('id') userId: string) {
    return this.housekeepingService.updateTaskStatus(id, status, userId);
  }

  @Patch('tasks/:id/assign')
  @ApiOperation({ summary: 'Assigner une tâche' })
  assign(@Param('id') id: string, @Body('assignedToId') assignedToId: string) {
    return this.housekeepingService.assignTask(id, assignedToId);
  }
}
