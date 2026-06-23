import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 20, search } = pagination;
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { idNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { reservations: true } } },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { data, pagination: buildPagination(total, page, limit) };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        documents: true,
        reservations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { room: true, property: true },
        },
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
        loyaltyTransactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!customer) throw new NotFoundException('Client introuvable');
    return { data: customer };
  }

  async create(dto: any) {
    const customer = await this.prisma.customer.create({ data: dto });
    return { data: customer, message: 'Client créé avec succès' };
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    const customer = await this.prisma.customer.update({ where: { id }, data: dto });
    return { data: customer, message: 'Client mis à jour avec succès' };
  }
}
