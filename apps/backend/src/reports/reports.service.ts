import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(currentUser: any) {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.branchId = currentUser.branchId;
    }

    const [leads, deals, contacts, messages] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.deal.count({ where }),
      this.prisma.contact.count({ where }),
      this.prisma.message.count({ where: { contact: where } }),
    ]);

    return {
      leads,
      deals,
      contacts,
      messages,
    };
  }
}


