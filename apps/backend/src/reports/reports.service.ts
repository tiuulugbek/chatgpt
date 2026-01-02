import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { LeadSource, DealStage } from '@prisma/client';

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
    let previousStartDate: Date;
    
    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    const dateWhere = {
      ...where,
      createdAt: { gte: startDate },
    };

    const previousDateWhere = {
      ...where,
      createdAt: {
        gte: previousStartDate,
        lt: startDate,
      },
    };

    // Current period stats
    const [leads, deals, contacts, messages] = await Promise.all([
      this.prisma.lead.count({ where: dateWhere }),
      this.prisma.deal.count({ where: dateWhere }),
      this.prisma.contact.count({ where: dateWhere }),
      this.prisma.message.count({ where: { createdAt: { gte: startDate } } }),
    ]);

    // Previous period stats (for comparison)
    const [prevLeads, prevDeals, prevContacts, prevMessages] = await Promise.all([
      this.prisma.lead.count({ where: previousDateWhere }),
      this.prisma.deal.count({ where: previousDateWhere }),
      this.prisma.contact.count({ where: previousDateWhere }),
      this.prisma.message.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
      }),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Total stats
    const [totalLeads, totalDeals, totalContacts, totalMessages] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.deal.count({ where }),
      this.prisma.contact.count({ where }),
      this.prisma.message.count({ where: {} }),
    ]);

    // Deal status breakdown
    const allDeals = await this.prisma.deal.findMany({
      where: where as any,
      select: {
        stage: true,
      },
    });

    const dealStatusesMap = allDeals.reduce((acc, deal) => {
      const status = deal.stage;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dealStatuses = Object.entries(dealStatusesMap).map(([status, count]) => ({
      status,
      count,
    }));

    // Lead sources breakdown
    const allLeads = await this.prisma.lead.findMany({
      where: where as any,
      select: {
        source: true,
      },
    });

    const leadSourcesMap = allLeads.reduce((acc, lead) => {
      const source = lead.source;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadSources = Object.entries(leadSourcesMap).map(([source, count]) => ({
      source,
      count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
    }));

    // Weekly leads data (last 7 days)
    const weeklyLeadsData = [];
    const weeklyLabels = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await this.prisma.lead.count({
        where: {
          ...where,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });
      
      weeklyLeadsData.push(count);
      weeklyLabels.push(date.toLocaleDateString('uz-UZ', { weekday: 'short' }));
    }

    // Weekly deals data
    const weeklyDealsData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await this.prisma.deal.count({
        where: {
          ...where,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });
      
      weeklyDealsData.push(count);
    }

    // Revenue data (from deals)
    const revenueDeals = await this.prisma.deal.findMany({
      where: {
        ...where,
        stage: DealStage.CLOSED_WON,
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        currency: true,
        createdAt: true,
      },
    });

    // Weekly revenue data
    const weeklyRevenueData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayRevenue = revenueDeals
        .filter((deal) => {
          const dealDate = new Date(deal.createdAt);
          return dealDate >= dayStart && dealDate <= dayEnd;
        })
        .reduce((sum, deal) => sum + (deal.amount || 0), 0);
      
      weeklyRevenueData.push(dayRevenue);
    }

    const totalRevenue = revenueDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const averageRevenue = weeklyRevenueData.length > 0
      ? weeklyRevenueData.reduce((sum, val) => sum + val, 0) / weeklyRevenueData.length
      : 0;

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
      growth: {
        leads: calculateGrowth(leads, prevLeads),
        deals: calculateGrowth(deals, prevDeals),
        contacts: calculateGrowth(contacts, prevContacts),
        messages: calculateGrowth(messages, prevMessages),
      },
      dealStatuses,
      leadSources,
      weeklyStats: {
        leads: {
          data: weeklyLeadsData,
          labels: weeklyLabels,
          average: weeklyLeadsData.length > 0
            ? weeklyLeadsData.reduce((sum, val) => sum + val, 0) / weeklyLeadsData.length
            : 0,
          max: Math.max(...weeklyLeadsData, 0),
          total: weeklyLeadsData.reduce((sum, val) => sum + val, 0),
        },
        deals: {
          data: weeklyDealsData,
        },
        revenue: {
          data: weeklyRevenueData,
          total: totalRevenue,
          average: averageRevenue,
        },
      },
    };
  }

  async getLeadsReport(currentUser: any, filters: any) {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.branchId = currentUser.branchId;
    } else if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    if (filters.source) {
      where.source = filters.source;
    }

    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        contact: true,
        assignee: true,
        branch: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group by source
    const sourceStats = leads.reduce((acc, lead) => {
      const source = lead.source;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by status
    const statusStats = leads.reduce((acc, lead) => {
      const status = lead.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: leads.length,
      leads,
      sourceStats: Object.entries(sourceStats).map(([source, count]) => ({
        source,
        count,
        percentage: leads.length > 0 ? (count / leads.length) * 100 : 0,
      })),
      statusStats: Object.entries(statusStats).map(([status, count]) => ({
        status,
        count,
        percentage: leads.length > 0 ? (count / leads.length) * 100 : 0,
      })),
    };
  }

  async getDealsReport(currentUser: any, filters: any) {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.branchId = currentUser.branchId;
    } else if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    if (filters.stage) {
      where.stage = filters.stage;
    }

    const deals = await this.prisma.deal.findMany({
      where,
      include: {
        contact: true,
        assignee: true,
        branch: true,
        lead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group by stage
    const stageStats = deals.reduce((acc, deal) => {
      const stage = deal.stage;
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Revenue stats
    const totalRevenue = deals
      .filter((d) => d.stage === 'CLOSED_WON')
      .reduce((sum, deal) => sum + (deal.amount || 0), 0);

    const averageDealValue =
      deals.length > 0
        ? deals.reduce((sum, deal) => sum + (deal.amount || 0), 0) / deals.length
        : 0;

    return {
      total: deals.length,
      deals,
      stageStats: Object.entries(stageStats).map(([stage, count]) => ({
        stage,
        count,
        percentage: deals.length > 0 ? (count / deals.length) * 100 : 0,
      })),
      revenue: {
        total: totalRevenue,
        average: averageDealValue,
      },
    };
  }

  async getPerformanceReport(currentUser: any, filters: any) {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.branchId = currentUser.branchId;
    } else if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    // Get users
    const users = await this.prisma.user.findMany({
      where: currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId
        ? { branchId: currentUser.branchId }
        : filters.branchId
        ? { branchId: filters.branchId }
        : {},
      include: {
        branch: true,
      },
    });

    // Get performance stats for each user
    const performanceStats = await Promise.all(
      users.map(async (user) => {
        const userWhere = {
          ...where,
          assigneeId: user.id,
        };

        const [leadsCount, dealsCount, closedDealsCount, revenue] = await Promise.all([
          this.prisma.lead.count({ where: userWhere }),
          this.prisma.deal.count({ where: userWhere }),
          this.prisma.deal.count({
            where: {
              ...userWhere,
              stage: 'CLOSED_WON',
            },
          }),
          this.prisma.deal.aggregate({
            where: {
              ...userWhere,
              stage: 'CLOSED_WON',
            },
            _sum: {
              amount: true,
            },
          }),
        ]);

        return {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            branch: user.branch,
          },
          leads: leadsCount,
          deals: dealsCount,
          closedDeals: closedDealsCount,
          revenue: revenue._sum.amount || 0,
          conversionRate:
            leadsCount > 0 ? (closedDealsCount / leadsCount) * 100 : 0,
        };
      }),
    );

    return {
      performance: performanceStats.sort((a, b) => b.revenue - a.revenue),
    };
  }
}



