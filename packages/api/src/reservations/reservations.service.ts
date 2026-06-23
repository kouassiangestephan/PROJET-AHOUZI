import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';
import {
  CreateReservationDto,
  UpdateReservationDto,
  CancelReservationDto,
  AvailabilitySearchDto,
} from './dto/reservation.dto';
import { ReservationStatus, RoomStatus } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, propertyId?: string) {
    const { page = 1, limit = 20, search } = pagination;
    const where: any = propertyId ? { propertyId } : {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
          room: { select: { id: true, number: true, name: true, category: true } },
          property: { select: { id: true, name: true } },
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return { data, pagination: buildPagination(total, page, limit) };
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        customer: true,
        room: { include: { roomType: true } },
        property: true,
        services: { include: { service: true } },
        extras: true,
        invoices: true,
        payments: true,
      },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    return { data: reservation };
  }

  async create(dto: CreateReservationDto, userId: string) {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);

    if (checkOut <= checkIn) {
      throw new BadRequestException('La date de départ doit être après la date d\'arrivée');
    }

    const room = await this.prisma.room.findUnique({ where: { id: dto.roomId } });
    if (!room) throw new NotFoundException('Chambre introuvable');
    if (room.status !== RoomStatus.AVAILABLE) {
      throw new ConflictException('Cette chambre n\'est pas disponible');
    }

    const conflict = await this.prisma.reservation.findFirst({
      where: {
        roomId: dto.roomId,
        status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] },
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
    });

    if (conflict) {
      throw new ConflictException('La chambre est déjà réservée pour ces dates');
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const baseAmount = Number(room.basePrice) * nights;
    const taxAmount = baseAmount * 0.18;
    const discountAmount = dto.discountAmount || 0;
    const totalAmount = baseAmount + taxAmount - discountAmount;

    const code = `RES-${Date.now().toString(36).toUpperCase()}`;

    const reservation = await this.prisma.reservation.create({
      data: {
        code,
        propertyId: dto.propertyId,
        customerId: dto.customerId,
        roomId: dto.roomId,
        status: ReservationStatus.CONFIRMED,
        checkIn,
        checkOut,
        nights,
        adults: dto.adults || 1,
        children: dto.children || 0,
        baseAmount,
        taxAmount,
        discountAmount,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        source: dto.source,
        notes: dto.notes,
        specialRequests: dto.specialRequests,
        createdById: userId,
      },
      include: {
        customer: { select: { firstName: true, lastName: true, phone: true } },
        room: { select: { number: true, name: true } },
      },
    });

    return { data: reservation, message: 'Réservation créée avec succès' };
  }

  async update(id: string, dto: UpdateReservationDto, userId: string) {
    const { data: reservation } = await this.findOne(id);

    if ([ReservationStatus.CHECKED_OUT, ReservationStatus.CANCELLED].includes(reservation.status as any)) {
      throw new BadRequestException('Impossible de modifier une réservation terminée ou annulée');
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { ...dto as any, updatedById: userId },
    });

    return { data: updated, message: 'Réservation mise à jour avec succès' };
  }

  async cancel(id: string, dto: CancelReservationDto, userId: string) {
    const { data: reservation } = await this.findOne(id);

    if ([ReservationStatus.CHECKED_OUT, ReservationStatus.CANCELLED].includes(reservation.status as any)) {
      throw new BadRequestException('Réservation déjà terminée ou annulée');
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
        cancellationReason: dto.reason,
        cancelledAt: new Date(),
        updatedById: userId,
      },
    });

    return { data: updated, message: 'Réservation annulée avec succès' };
  }

  async checkIn(id: string, userId: string) {
    const { data: reservation } = await this.findOne(id);

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('La réservation doit être confirmée pour effectuer le check-in');
    }

    await this.prisma.$transaction([
      this.prisma.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.CHECKED_IN,
          checkedInAt: new Date(),
          updatedById: userId,
        },
      }),
      this.prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: RoomStatus.OCCUPIED },
      }),
    ]);

    return { data: null, message: 'Check-in effectué avec succès' };
  }

  async checkOut(id: string, userId: string) {
    const { data: reservation } = await this.findOne(id);

    if (reservation.status !== ReservationStatus.CHECKED_IN) {
      throw new BadRequestException('Le client doit être en séjour pour effectuer le check-out');
    }

    await this.prisma.$transaction([
      this.prisma.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.CHECKED_OUT,
          checkedOutAt: new Date(),
          updatedById: userId,
        },
      }),
      this.prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: RoomStatus.DIRTY },
      }),
    ]);

    return { data: null, message: 'Check-out effectué avec succès' };
  }

  async searchAvailability(dto: AvailabilitySearchDto) {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);

    const occupiedRoomIds = await this.prisma.reservation.findMany({
      where: {
        propertyId: dto.propertyId,
        status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] },
        AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
      },
      select: { roomId: true },
    });

    const occupiedIds = occupiedRoomIds.map((r) => r.roomId);

    const availableRooms = await this.prisma.room.findMany({
      where: {
        propertyId: dto.propertyId,
        isActive: true,
        status: { notIn: [RoomStatus.MAINTENANCE, RoomStatus.OUT_OF_SERVICE] },
        id: { notIn: occupiedIds },
        maxOccupancy: { gte: dto.adults || 1 },
      },
      include: { roomType: true },
      orderBy: { basePrice: 'asc' },
    });

    return { data: availableRooms, message: `${availableRooms.length} chambre(s) disponible(s)` };
  }

  async getCalendar(propertyId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        propertyId,
        status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] },
        AND: [{ checkIn: { lte: endDate } }, { checkOut: { gte: startDate } }],
      },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        room: { select: { number: true, name: true } },
      },
    });

    return { data: reservations };
  }
}
