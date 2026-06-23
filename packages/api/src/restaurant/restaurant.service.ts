import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  async findMenu(propertyId: string) {
    const categories = await this.prisma.menuCategory.findMany({
      where: { propertyId, isActive: true },
      include: { menuItems: { where: { isActive: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return { data: categories };
  }

  async createOrder(dto: any, userId: string) {
    const items = dto.items || [];
    const subtotal = items.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0);
    const taxAmount = subtotal * 0.1;
    const totalAmount = subtotal + taxAmount;

    const order = await this.prisma.restaurantOrder.create({
      data: {
        propertyId: dto.propertyId,
        tableId: dto.tableId,
        reservationId: dto.reservationId,
        customerId: dto.customerId,
        type: dto.type || 'DINE_IN',
        subtotal, taxAmount, totalAmount,
        notes: dto.notes,
        createdById: userId,
        items: { create: items.map((i: any) => ({ menuItemId: i.menuItemId, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.quantity * i.unitPrice, notes: i.notes })) },
        kitchenTicket: { create: { status: 'OPEN', priority: 'NORMAL' } },
      },
      include: { items: true, kitchenTicket: true },
    });
    return { data: order, message: 'Commande créée avec succès' };
  }

  async findOrders(pagination: PaginationDto, propertyId?: string) {
    const { page = 1, limit = 20 } = pagination;
    const where: any = propertyId ? { propertyId } : {};
    const [data, total] = await Promise.all([
      this.prisma.restaurantOrder.findMany({ where, ...paginate(page, limit), orderBy: { createdAt: 'desc' }, include: { items: true, table: true } }),
      this.prisma.restaurantOrder.count({ where }),
    ]);
    return { data, pagination: buildPagination(total, page, limit) };
  }
}
