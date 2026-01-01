import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

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
}


