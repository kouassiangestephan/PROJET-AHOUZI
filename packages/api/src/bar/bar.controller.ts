import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BarService } from './bar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Bar')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('bar')
export class BarController {
  constructor(private readonly service: BarService) {}

  @Get() findAll(@Query() p: PaginationDto, @Query('propertyId') pid?: string) { return this.service.findAll(p, pid); }
  @Post() create(@Body() dto: any) { return this.service.create(dto); }
}
