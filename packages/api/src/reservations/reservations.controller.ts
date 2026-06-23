import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateReservationDto,
  UpdateReservationDto,
  CancelReservationDto,
  AvailabilitySearchDto,
} from './dto/reservation.dto';

@ApiTags('Réservations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les réservations' })
  @ApiQuery({ name: 'propertyId', required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.reservationsService.findAll(pagination, propertyId);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Vue calendrier des réservations' })
  getCalendar(
    @Query('propertyId') propertyId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.reservationsService.getCalendar(propertyId, year, month);
  }

  @Post('availability')
  @ApiOperation({ summary: 'Rechercher la disponibilité des chambres' })
  searchAvailability(@Body() dto: AvailabilitySearchDto) {
    return this.reservationsService.searchAvailability(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une réservation par ID' })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle réservation' })
  create(
    @Body() dto: CreateReservationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une réservation' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReservationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.update(id, dto, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Annuler une réservation' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelReservationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.cancel(id, dto, userId);
  }

  @Patch(':id/check-in')
  @ApiOperation({ summary: 'Effectuer le check-in' })
  checkIn(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reservationsService.checkIn(id, userId);
  }

  @Patch(':id/check-out')
  @ApiOperation({ summary: 'Effectuer le check-out' })
  checkOut(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reservationsService.checkOut(id, userId);
  }
}
