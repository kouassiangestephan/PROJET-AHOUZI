import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';
import { CreatePropertyDto, UpdatePropertyDto, CreateRoomDto, UpdateRoomDto } from './dto/property.dto';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllProperties(pagination: PaginationDto) {
    const { page = 1, limit = 20, search } = pagination;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { rooms: true, reservations: true } },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data, pagination: buildPagination(total, page, limit) };
  }

  async findOneProperty(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        buildings: { include: { floorList: true } },
        _count: { select: { rooms: true, reservations: true } },
      },
    });
    if (!property) throw new NotFoundException('Propriété introuvable');
    return { data: property };
  }

  async createProperty(dto: CreatePropertyDto) {
    const existing = await this.prisma.property.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Ce code de propriété existe déjà');

    const property = await this.prisma.property.create({ data: dto });
    return { data: property, message: 'Propriété créée avec succès' };
  }

  async updateProperty(id: string, dto: UpdatePropertyDto) {
    await this.findOneProperty(id);
    const property = await this.prisma.property.update({ where: { id }, data: dto });
    return { data: property, message: 'Propriété mise à jour avec succès' };
  }

  async deleteProperty(id: string) {
    await this.findOneProperty(id);
    await this.prisma.property.update({
      where: { id },
      data: { isActive: false },
    });
    return { data: null, message: 'Propriété archivée avec succès' };
  }

  async getPropertyDashboard(id: string) {
    await this.findOneProperty(id);

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [
      totalRooms,
      occupiedRooms,
      todayCheckIns,
      todayCheckOuts,
      pendingReservations,
      monthRevenue,
    ] = await Promise.all([
      this.prisma.room.count({ where: { propertyId: id, isActive: true } }),
      this.prisma.room.count({ where: { propertyId: id, status: RoomStatus.OCCUPIED } }),
      this.prisma.reservation.count({
        where: {
          propertyId: id,
          checkIn: { gte: startOfDay, lte: endOfDay },
          status: 'CONFIRMED',
        },
      }),
      this.prisma.reservation.count({
        where: {
          propertyId: id,
          checkOut: { gte: startOfDay, lte: endOfDay },
          status: 'CHECKED_IN',
        },
      }),
      this.prisma.reservation.count({
        where: { propertyId: id, status: 'PENDING' },
      }),
      this.prisma.payment.aggregate({
        where: {
          propertyId: id,
          status: 'COMPLETED',
          processedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
    ]);

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    return {
      data: {
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        totalRooms,
        occupiedRooms,
        availableRooms: totalRooms - occupiedRooms,
        todayCheckIns,
        todayCheckOuts,
        pendingReservations,
        monthRevenue: monthRevenue._sum.amount || 0,
      },
    };
  }

  async findAllRooms(propertyId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20, search } = pagination;
    const where: any = { propertyId };
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { number: 'asc' },
        include: { roomType: true, building: true, floorRef: true },
      }),
      this.prisma.room.count({ where }),
    ]);

    return { data, pagination: buildPagination(total, page, limit) };
  }

  async createRoom(propertyId: string, dto: CreateRoomDto) {
    const room = await this.prisma.room.create({
      data: { ...dto, propertyId, basePrice: dto.basePrice },
    });
    return { data: room, message: 'Chambre créée avec succès' };
  }

  async updateRoom(id: string, dto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Chambre introuvable');

    const updated = await this.prisma.room.update({ where: { id }, data: dto as any });
    return { data: updated, message: 'Chambre mise à jour avec succès' };
  }
}
