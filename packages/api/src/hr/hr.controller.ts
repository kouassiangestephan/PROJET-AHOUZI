import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('RH')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('employees')
  findEmployees(@Query() pagination: PaginationDto, @Query('propertyId') propertyId?: string) {
    return this.hrService.findEmployees(pagination, propertyId);
  }

  @Post('employees')
  createEmployee(@Body() dto: any) { return this.hrService.createEmployee(dto); }

  @Post('attendance')
  recordAttendance(@Body() dto: any) { return this.hrService.recordAttendance(dto); }

  @Post('leaves')
  createLeave(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.hrService.createLeaveRequest(dto, userId);
  }

  @Patch('leaves/:id/approve')
  approveLeave(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.hrService.approveLeave(id, userId);
  }
}
