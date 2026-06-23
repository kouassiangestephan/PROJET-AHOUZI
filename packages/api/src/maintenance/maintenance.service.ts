import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, propertyId?: string) {
    const { page = 1, limit = 20 } = pagination;
    const where: any = propertyId ? { propertyId } : {};
    const [data, total] = await Promise.all([
      this.prisma.maintenanceTicket.findMany({
        where, ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          room: { select: { number: true } },
          reportedBy: { select: { firstName: true, lastName: true } },
          assignedTo: { select: { firstName: true, lastName: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.maintenanceTicket.count({ where }),
    ]);
    return { data, pagination: buildPagination(total, page, limit) };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.maintenanceTicket.findUnique({
      where: { id },
      include: { comments: { include: { author: { select: { firstName: true, lastName: true } } } }, parts: true, room: true },
    });
    if (!ticket) throw new NotFoundException('Ticket introuvable');
    return { data: ticket };
  }

  async create(dto: any, userId: string) {
    const code = `MNT-${Date.now().toString(36).toUpperCase()}`;
    const ticket = await this.prisma.maintenanceTicket.create({ data: { ...dto, code, reportedById: userId } });
    return { data: ticket, message: 'Ticket créé avec succès' };
  }

  async updateStatus(id: string, status: string, userId: string) {
    await this.findOne(id);
    const ticket = await this.prisma.maintenanceTicket.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'IN_PROGRESS' ? { startedAt: new Date() } : {}),
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });
    return { data: ticket, message: 'Statut mis à jour' };
  }

  async assign(id: string, assignedToId: string) {
    await this.findOne(id);
    const ticket = await this.prisma.maintenanceTicket.update({
      where: { id },
      data: { assignedToId, status: 'ASSIGNED' as any },
    });
    return { data: ticket, message: 'Ticket assigné' };
  }

  async addComment(ticketId: string, content: string, isInternal: boolean, userId: string) {
    const comment = await this.prisma.maintenanceComment.create({
      data: { ticketId, content, isInternal, authorId: userId },
    });
    return { data: comment, message: 'Commentaire ajouté' };
  }
}
