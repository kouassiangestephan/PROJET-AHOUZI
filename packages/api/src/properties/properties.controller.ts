import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreatePropertyDto, UpdatePropertyDto, CreateRoomDto, UpdateRoomDto } from './dto/property.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Propriétés')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les propriétés' })
  findAll(@Query() pagination: PaginationDto) {
    return this.propertiesService.findAllProperties(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une propriété par ID' })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOneProperty(id);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Tableau de bord d\'une propriété' })
  getDashboard(@Param('id') id: string) {
    return this.propertiesService.getPropertyDashboard(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Créer une nouvelle propriété' })
  create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.createProperty(dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GENERAL_MANAGER, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Mettre à jour une propriété' })
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.updateProperty(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Archiver une propriété' })
  remove(@Param('id') id: string) {
    return this.propertiesService.deleteProperty(id);
  }

  // Chambres
  @Get(':propertyId/rooms')
  @ApiOperation({ summary: 'Lister les chambres d\'une propriété' })
  findRooms(
    @Param('propertyId') propertyId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.propertiesService.findAllRooms(propertyId, pagination);
  }

  @Post(':propertyId/rooms')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GENERAL_MANAGER, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Créer une chambre' })
  createRoom(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.propertiesService.createRoom(propertyId, dto);
  }

  @Patch('rooms/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.GENERAL_MANAGER, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Mettre à jour une chambre' })
  updateRoom(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.propertiesService.updateRoom(id, dto);
  }
}
