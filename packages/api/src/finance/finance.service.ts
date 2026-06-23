import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllInvoices(pagination: PaginationDto, propertyId?: string) {
    const { page = 1, limit = 20 } = pagination;
    const where: any = propertyId ? { propertyId } : {};
    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where, ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { firstName: true, lastName: true } }, items: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, pagination: buildPagination(total, page, limit) };
  }

  async createInvoice(dto: any, userId: string) {
    const number = `FAC-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
    const items = dto.items || [];
    const subtotal = items.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0);
    const taxAmount = subtotal * (dto.taxRate || 0.18);
    const totalAmount = subtotal + taxAmount - (dto.discountAmount || 0);

    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        propertyId: dto.propertyId,
        customerId: dto.customerId,
        reservationId: dto.reservationId,
        type: dto.type || 'FINAL',
        status: 'DRAFT',
        issueDate: new Date(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        subtotal,
        taxAmount,
        discountAmount: dto.discountAmount || 0,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        notes: dto.notes,
        currency: dto.currency || 'XOF',
        createdById: userId,
        items: { create: items.map((i: any) => ({ ...i, totalPrice: i.quantity * i.unitPrice })) },
      },
      include: { items: true, customer: true },
    });
    return { data: invoice, message: 'Facture créée avec succès' };
  }

  async recordPayment(dto: any, userId: string) {
    const payment = await this.prisma.payment.create({
      data: {
        propertyId: dto.propertyId,
        customerId: dto.customerId,
        reservationId: dto.reservationId,
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        currency: dto.currency || 'XOF',
        method: dto.method,
        status: 'COMPLETED',
        reference: dto.reference,
        processedAt: new Date(),
        createdById: userId,
      },
    });

    if (dto.invoiceId) {
      const invoice = await this.prisma.invoice.findUnique({ where: { id: dto.invoiceId } });
      if (invoice) {
        const newPaid = Number(invoice.paidAmount) + Number(dto.amount);
        const newBalance = Number(invoice.totalAmount) - newPaid;
        await this.prisma.invoice.update({
          where: { id: dto.invoiceId },
          data: {
            paidAmount: newPaid,
            balanceAmount: newBalance,
            status: newBalance <= 0 ? 'PAID' : 'PARTIAL',
          },
        });
      }
    }

    return { data: payment, message: 'Paiement enregistré avec succès' };
  }

  async getFinanceSummary(propertyId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [revenue, expenses, payments] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { propertyId, status: 'PAID', issueDate: { gte: startDate, lte: endDate } },
        _sum: { totalAmount: true },
      }),
      this.prisma.expense.aggregate({
        where: { propertyId, status: 'PAID', date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { propertyId, status: 'COMPLETED', processedAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalRevenue = Number(revenue._sum.totalAmount || 0);
    const totalExpenses = Number(expenses._sum.amount || 0);

    return {
      data: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        totalPayments: Number(payments._sum.amount || 0),
        paymentsCount: payments._count,
      },
    };
  }
}
