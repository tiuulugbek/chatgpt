import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageDirection } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto, currentUser: any) {
    const message = await this.prisma.message.create({
      data: {
        ...createMessageDto,
        userId: currentUser.id,
      },
      include: {
        contact: true,
        user: true,
        lead: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Message',
        entityId: message.id,
        userId: currentUser.id,
        changes: createMessageDto as any,
      },
    });

    return message;
  }

  async findAll(currentUser: any, filters?: any) {
    let where: any = {};

    // Filial cheklovi
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.contact = {
        branchId: currentUser.branchId,
      };
    }

    if (filters?.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters?.leadId) {
      where.leadId = filters.leadId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.direction) {
      where.direction = filters.direction;
    }

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead === 'true';
    }

    return this.prisma.message.findMany({
      where,
      include: {
        contact: true,
        user: true,
        lead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit || 100,
    });
  }

  async markAsRead(messageId: string, currentUser: any) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}



