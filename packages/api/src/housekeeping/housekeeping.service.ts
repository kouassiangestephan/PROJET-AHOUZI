import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';

@Injectable()
export class HousekeepingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllTasks(pagination: PaginationDto, propertyId?: string) {
    const { page = 1, limit = 20 } = pagination;
    const where: any = propertyId ? { propertyId } : {};
    const [data, total] = await Promise.all([
      this.prisma.housekeepingTask.findMany({
        where, ...paginate(page, limit),
        orderBy: { scheduledAt: 'asc' },
        include: {
          room: { select: { number: true, name: true } },
          assignedTo: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.housekeepingTask.count({ where }),
    ]);
    return { data, pagination: buildPagination(total, page, limit) };
  }

  async createTask(dto: any, userId: string) {
    const task = await this.prisma.housekeepingTask.create({ data: { ...dto, scheduledAt: new Date(dto.scheduledAt) } });
    return { data: task, message: 'Tâche créée avec succès' };
  }

  async updateTaskStatus(id: string, status: string, userId: string) {
    const task = await this.prisma.housekeepingTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Tâche introuvable');
    const updated = await this.prisma.housekeepingTask.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'IN_PROGRESS' ? { startedAt: new Date() } : {}),
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
        ...(status === 'VERIFIED' ? { verifiedById: userId, verifiedAt: new Date() } : {}),
      },
    });
    return { data: updated, message: 'Statut mis à jour' };
  }

  async assignTask(id: string, assignedToId: string) {
    const task = await this.prisma.housekeepingTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Tâche introuvable');
    const updated = await this.prisma.housekeepingTask.update({
      where: { id },
      data: { assignedToId, status: 'IN_PROGRESS' as any },
    });
    return { data: updated, message: 'Tâche assignée' };
  }
}
