import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(currentUser: any, range: string = 'month') {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.branchId = currentUser.branchId;
    }

    // Date range filter
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const dateWhere = {
      ...where,
      createdAt: { gte: startDate },
    };

    const [leads, deals, contacts, messages, totalLeads, totalDeals, totalContacts, totalMessages] = await Promise.all([
      this.prisma.lead.count({ where: dateWhere }),
      this.prisma.deal.count({ where: dateWhere }),
      this.prisma.contact.count({ where: dateWhere }),
      this.prisma.message.count({ where: { contact: dateWhere } }),
      this.prisma.lead.count({ where }),
      this.prisma.deal.count({ where }),
      this.prisma.contact.count({ where }),
      this.prisma.message.count({ where: { contact: where } }),
    ]);

    // Deal status breakdown
    const dealStatuses = await this.prisma.deal.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    return {
      leads,
      deals,
      contacts,
      messages,
      totals: {
        leads: totalLeads,
        deals: totalDeals,
        contacts: totalContacts,
        messages: totalMessages,
      },
      dealStatuses: dealStatuses.map((d) => ({
        status: d.status,
        count: d._count,
      })),
    };
  }
}



