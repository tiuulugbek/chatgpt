import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealStage } from '@prisma/client';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async create(createDealDto: CreateDealDto, currentUser: any) {
    const deal = await this.prisma.deal.create({
      data: {
        title: createDealDto.title,
        amount: createDealDto.amount,
        currency: createDealDto.currency || 'UZS',
        stage: createDealDto.stage || DealStage.LEAD,
        probability: createDealDto.probability || 0,
        expectedCloseDate: createDealDto.expectedCloseDate,
        notes: createDealDto.notes,
        branchId: createDealDto.branchId || currentUser.branchId,
        contactId: createDealDto.contactId,
        leadId: createDealDto.leadId,
        assigneeId: createDealDto.assigneeId || currentUser.id,
        creatorId: currentUser.id,
      },
      include: {
        contact: true,
        assignee: true,
        branch: true,
        lead: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Deal',
        entityId: deal.id,
        userId: currentUser.id,
        changes: createDealDto as any,
      },
    });

    return deal;
  }

  async findAll(currentUser: any, filters?: any) {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN') {
      where.branchId = currentUser.branchId;
    } else if (filters?.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters?.stage) {
      where.stage = filters.stage;
    }

    if (filters?.assigneeId) {
      where.assigneeId = filters.assigneeId;
    } else if (currentUser.role === 'BRANCH_STAFF') {
      where.assigneeId = currentUser.id;
    }

    return this.prisma.deal.findMany({
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
  }

  async findOne(id: string, currentUser: any) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        contact: true,
        assignee: true,
        creator: true,
        branch: true,
        lead: true,
      },
    });

    if (!deal) {
      throw new NotFoundException('Bitim topilmadi');
    }

    if (currentUser.role !== 'SUPER_ADMIN') {
      if (deal.branchId !== currentUser.branchId) {
        throw new ForbiddenException('Bu bitimni ko\'rish huquqingiz yo\'q');
      }
      if (currentUser.role === 'BRANCH_STAFF' && deal.assigneeId !== currentUser.id) {
        throw new ForbiddenException('Bu bitimni ko\'rish huquqingiz yo\'q');
      }
    }

    return deal;
  }

  async update(id: string, updateDealDto: UpdateDealDto, currentUser: any) {
    await this.findOne(id, currentUser);

    const deal = await this.prisma.deal.update({
      where: { id },
      data: {
        ...updateDealDto,
        closedAt: updateDealDto.stage === DealStage.CLOSED_WON || updateDealDto.stage === DealStage.CLOSED_LOST
          ? new Date()
          : undefined,
      },
      include: {
        contact: true,
        assignee: true,
        branch: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Deal',
        entityId: id,
        userId: currentUser.id,
        changes: updateDealDto as any,
      },
    });

    return deal;
  }

  async remove(id: string, currentUser: any) {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'BRANCH_MANAGER') {
      throw new ForbiddenException('Bitimni o\'chirish huquqingiz yo\'q');
    }

    await this.findOne(id, currentUser);

    await this.prisma.deal.delete({
      where: { id },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Deal',
        entityId: id,
        userId: currentUser.id,
      },
    });

    return { message: 'Bitim o\'chirildi' };
  }

  async getPipeline(branchId: string, currentUser: any) {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN') {
      where.branchId = currentUser.branchId;
    } else if (branchId) {
      where.branchId = branchId;
    }

    const deals = await this.prisma.deal.findMany({
      where,
      include: {
        contact: true,
        assignee: true,
      },
    });

    // Bosqichlar bo'yicha guruhlash
    const pipeline = {
      LEAD: deals.filter((d) => d.stage === DealStage.LEAD),
      CONTACTED: deals.filter((d) => d.stage === DealStage.CONTACTED),
      PROPOSAL: deals.filter((d) => d.stage === DealStage.PROPOSAL),
      NEGOTIATION: deals.filter((d) => d.stage === DealStage.NEGOTIATION),
      CLOSED_WON: deals.filter((d) => d.stage === DealStage.CLOSED_WON),
      CLOSED_LOST: deals.filter((d) => d.stage === DealStage.CLOSED_LOST),
    };

    return pipeline;
  }
}

