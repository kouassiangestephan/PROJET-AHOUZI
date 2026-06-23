import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto, paginate, buildPagination } from '../common/dto/pagination.dto';

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  async findEmployees(pagination: PaginationDto, propertyId?: string) {
    const { page = 1, limit = 20, search } = pagination;
    const where: any = propertyId ? { propertyId } : {};
    if (search) where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { employeeNumber: { contains: search, mode: 'insensitive' } },
    ];
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({ where, ...paginate(page, limit), include: { department: true } }),
      this.prisma.employee.count({ where }),
    ]);
    return { data, pagination: buildPagination(total, page, limit) };
  }

  async createEmployee(dto: any) {
    const employeeNumber = `EMP-${Date.now().toString(36).toUpperCase()}`;
    const employee = await this.prisma.employee.create({ data: { ...dto, employeeNumber, hireDate: new Date(dto.hireDate) } });
    return { data: employee, message: 'Employé créé avec succès' };
  }

  async recordAttendance(dto: any) {
    const attendance = await this.prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: dto.employeeId, date: new Date(dto.date) } },
      create: { ...dto, date: new Date(dto.date) },
      update: { checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined, hoursWorked: dto.hoursWorked },
    });
    return { data: attendance, message: 'Présence enregistrée' };
  }

  async createLeaveRequest(dto: any, userId: string) {
    const leave = await this.prisma.leaveRequest.create({
      data: { ...dto, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) },
    });
    return { data: leave, message: 'Demande de congé soumise' };
  }

  async approveLeave(id: string, userId: string) {
    const leave = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId, approvedAt: new Date() },
    });
    return { data: leave, message: 'Congé approuvé' };
  }
}
