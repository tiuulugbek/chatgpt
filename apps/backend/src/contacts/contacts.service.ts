import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: any, filters?: any) {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.branchId = currentUser.branchId;
    }

    return this.prisma.contact.findMany({
      where,
      include: {
        branch: true,
        _count: {
          select: {
            leads: true,
            deals: true,
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        branch: true,
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        deals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        socialAccounts: true,
      },
    });

    if (!contact) {
      throw new NotFoundException('Mijoz topilmadi');
    }

    return contact;
  }
}


