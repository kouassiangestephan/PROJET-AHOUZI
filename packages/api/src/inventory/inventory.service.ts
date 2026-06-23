import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findItems(pagination: PaginationDto, propertyId?: string) {
    const { page = 1, limit = 20, search } = pagination;
    const where: any = propertyId ? { propertyId, isActive: true } : { isActive: true };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const [data, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({ where, ...paginate(page, limit), include: { category: true } }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    return { data, pagination: buildPagination(total, page, limit) };
  }

  async createItem(dto: any) {
    const item = await this.prisma.inventoryItem.create({ data: dto });
    return { data: item, message: 'Article créé avec succès' };
  }

  async addStockMovement(dto: any, userId: string) {
    const movement = await this.prisma.$transaction(async (tx) => {
      const mov = await tx.stockMovement.create({
        data: { ...dto, performedById: userId, totalCost: dto.quantity * (dto.unitCost || 0) },
      });
      const delta = dto.type === 'IN' ? dto.quantity : -dto.quantity;
      await tx.inventoryItem.update({
        where: { id: dto.itemId },
        data: { currentStock: { increment: delta } },
      });
      return mov;
    });
    return { data: movement, message: 'Mouvement de stock enregistré' };
  }

  async getLowStockAlerts(propertyId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: { propertyId, isActive: true, currentStock: { lte: this.prisma.inventoryItem.fields.reorderPoint } },
    });
    return { data: items };
  }
}
