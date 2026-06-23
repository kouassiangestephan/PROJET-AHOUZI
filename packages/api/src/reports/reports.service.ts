import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ReservationStatus, RoomStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getExecutiveDashboard(propertyId?: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const propFilter = propertyId ? { propertyId } : {};

    const [
      totalRooms, occupiedRooms, confirmedReservations, checkedInReservations,
      monthRevenue, monthExpenses, pendingMaintenance, lowStockItems,
    ] = await Promise.all([
      this.prisma.room.count({ where: { ...propFilter, isActive: true } }),
      this.prisma.room.count({ where: { ...propFilter, status: RoomStatus.OCCUPIED } }),
      this.prisma.reservation.count({ where: { ...propFilter, status: ReservationStatus.CONFIRMED } }),
      this.prisma.reservation.count({ where: { ...propFilter, status: ReservationStatus.CHECKED_IN } }),
      this.prisma.payment.aggregate({
        where: { ...propFilter, status: 'COMPLETED', processedAt: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { ...propFilter, status: 'PAID', date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.maintenanceTicket.count({ where: { ...propFilter, status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      this.prisma.inventoryItem.count({ where: { ...propFilter, isActive: true } }),
    ]);

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    const totalRevenue = Number(monthRevenue._sum.amount || 0);
    const totalExpenses = Number(monthExpenses._sum.amount || 0);
    const adr = occupiedRooms > 0 ? totalRevenue / occupiedRooms : 0;
    const revpar = totalRooms > 0 ? totalRevenue / totalRooms : 0;

    return {
      data: {
        kpis: {
          occupancyRate: Math.round(occupancyRate * 100) / 100,
          totalRooms, occupiedRooms,
          confirmedReservations: confirmedReservations + checkedInReservations,
          monthRevenue: totalRevenue,
          monthExpenses: totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          adr: Math.round(adr),
          revpar: Math.round(revpar),
          pendingMaintenance,
        },
      },
    };
  }

  async getOccupancyReport(propertyId: string, startDate: string, endDate: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        propertyId,
        status: { in: [ReservationStatus.CHECKED_IN, ReservationStatus.CHECKED_OUT] },
        checkIn: { gte: new Date(startDate) },
        checkOut: { lte: new Date(endDate) },
      },
      include: { room: { select: { number: true, category: true } } },
    });
    return { data: reservations };
  }

  async getRevenueReport(propertyId: string, startDate: string, endDate: string) {
    const [payments, invoices] = await Promise.all([
      this.prisma.payment.groupBy({
        by: ['method'],
        where: { propertyId, status: 'COMPLETED', processedAt: { gte: new Date(startDate), lte: new Date(endDate) } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { propertyId, issueDate: { gte: new Date(startDate), lte: new Date(endDate) } },
        _sum: { totalAmount: true, paidAmount: true },
      }),
    ]);
    return { data: { byMethod: payments, totals: invoices._sum } };
  }
}
