import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, propertyId?: string) {
    const { page = 1, limit = 20 } = pagination;
    const where: any = propertyId ? { propertyId } : {};
    const data = await this.prisma.shopItem.findMany({ where, ...paginate(page, limit) });
    const total = await this.prisma.shopItem.count({ where });
    return { data, pagination: buildPagination(total, page, limit) };
  }

  async create(dto: any) {
    const item = await this.prisma.shopItem.create({ data: dto });
    return { data: item, message: 'Article créé avec succès' };
  }
}
