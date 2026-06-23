import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Clients')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les clients' })
  findAll(@Query() pagination: PaginationDto) {
    return this.customersService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un client par ID' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau client' })
  create(@Body() dto: any) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un client' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.customersService.update(id, dto);
  }
}
