import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, propertyId?: string) {
    const { page = 1, limit = 20 } = pagination;
    const where: any = propertyId ? { propertyId } : {};
    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where, ...paginate(page, limit), orderBy: { date: 'desc' },
        include: { category: true, createdBy: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.expense.count({ where }),
    ]);
    return { data, pagination: buildPagination(total, page, limit) };
  }

  async create(dto: any, userId: string) {
    const expense = await this.prisma.expense.create({ data: { ...dto, date: new Date(dto.date), createdById: userId } });
    return { data: expense, message: 'Dépense enregistrée avec succès' };
  }

  async approve(id: string, userId: string) {
    const expense = await this.prisma.expense.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId, approvedAt: new Date() },
    });
    return { data: expense, message: 'Dépense approuvée' };
  }

  async markPaid(id: string, userId: string) {
    const expense = await this.prisma.expense.update({
      where: { id },
      data: { status: 'PAID', paidById: userId, paidAt: new Date() },
    });
    return { data: expense, message: 'Dépense marquée comme payée' };
  }

  async findCategories() {
    const categories = await this.prisma.expenseCategory.findMany({ where: { isActive: true } });
    return { data: categories };
  }
}
