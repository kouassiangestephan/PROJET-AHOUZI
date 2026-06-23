import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST', 'localhost'),
      port: configService.get<number>('SMTP_PORT', 587),
      secure: configService.get('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: configService.get('SMTP_USER', ''),
        pass: configService.get('SMTP_PASS', ''),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@ahouzi.ci'),
        to, subject, html,
      });
      this.logger.log(`Email envoyé à ${to}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email: ${error.message}`);
    }
  }

  async createNotification(userId: string, title: string, body: string, type: string) {
    return this.prisma.notification.create({
      data: { userId, title, body, type, channel: 'IN_APP', status: 'SENT', sentAt: new Date() },
    });
  }

  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId, status: { not: 'READ' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { data: notifications };
  }

  async markAsRead(id: string) {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: { status: 'READ', readAt: new Date() },
    });
    return { data: notification };
  }
}
