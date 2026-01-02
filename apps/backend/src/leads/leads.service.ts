import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadStatus, LeadSource } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto, currentUser: any) {
    // Contact yaratish yoki topish
    let contactId = createLeadDto.contactId;
    if (!contactId && createLeadDto.contact && createLeadDto.contact.phone) {
      // Avval telefon bo'yicha qidirish
      const existingContact = await this.prisma.contact.findFirst({
        where: {
          phone: createLeadDto.contact.phone,
        },
      });

      if (existingContact) {
        contactId = existingContact.id;
      } else {
        const contact = await this.prisma.contact.create({
          data: {
            fullName: createLeadDto.contact.fullName || '',
            phone: createLeadDto.contact.phone,
            email: createLeadDto.contact.email,
            branchId: createLeadDto.branchId || currentUser.branchId,
          },
        });
        contactId = contact.id;
      }
    }

    const lead = await this.prisma.lead.create({
      data: {
        title: createLeadDto.title,
        description: createLeadDto.description,
        status: createLeadDto.status || LeadStatus.NEW,
        source: createLeadDto.source || LeadSource.WEBSITE,
        priority: createLeadDto.priority,
        branchId: createLeadDto.branchId || currentUser.branchId,
        contactId,
        assigneeId: createLeadDto.assigneeId || currentUser.id,
        creatorId: currentUser.id,
      },
      include: {
        contact: true,
        assignee: true,
        branch: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Lead',
        entityId: lead.id,
        userId: currentUser.id,
        changes: createLeadDto as any,
      },
    });

    return lead;
  }

  async findAll(currentUser: any, filters?: any) {
    let where: any = {};

    // Filial cheklovi
    if (currentUser.role !== 'SUPER_ADMIN') {
      where.branchId = currentUser.branchId;
    } else if (filters?.branchId) {
      where.branchId = filters.branchId;
    }

    // Status filtri
    if (filters?.status) {
      where.status = filters.status;
    }

    // Source filtri
    if (filters?.source) {
      where.source = filters.source;
    }

    // Assignee filtri
    if (filters?.assigneeId) {
      where.assigneeId = filters.assigneeId;
    } else if (currentUser.role === 'BRANCH_STAFF') {
      where.assigneeId = currentUser.id;
    }

    return this.prisma.lead.findMany({
      where,
      include: {
        contact: true,
        assignee: true,
        branch: true,
        _count: {
          select: {
            messages: true,
            deals: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, currentUser: any) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        contact: true,
        assignee: true,
        creator: true,
        branch: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        deals: true,
        notes: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lid topilmadi');
    }

    // Huquq tekshiruvi
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (lead.branchId !== currentUser.branchId) {
        throw new ForbiddenException('Bu lidni ko\'rish huquqingiz yo\'q');
      }
      if (currentUser.role === 'BRANCH_STAFF' && lead.assigneeId !== currentUser.id) {
        throw new ForbiddenException('Bu lidni ko\'rish huquqingiz yo\'q');
      }
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, currentUser: any) {
    await this.findOne(id, currentUser);

    const lead = await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto as any,
      include: {
        contact: true,
        assignee: true,
        branch: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Lead',
        entityId: id,
        userId: currentUser.id,
        changes: updateLeadDto as any,
      },
    });

    return lead;
  }

  async remove(id: string, currentUser: any) {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'BRANCH_MANAGER') {
      throw new ForbiddenException('Lidni o\'chirish huquqingiz yo\'q');
    }

    await this.findOne(id, currentUser);

    await this.prisma.lead.delete({
      where: { id },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Lead',
        entityId: id,
        userId: currentUser.id,
      },
    });

    return { message: 'Lid o\'chirildi' };
  }

  async addNote(leadId: string, content: string, currentUser: any) {
    await this.findOne(leadId, currentUser);

    const note = await this.prisma.leadNote.create({
      data: {
        leadId,
        content,
        userId: currentUser.id,
      },
      include: {
        user: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'LeadNote',
        entityId: note.id,
        userId: currentUser.id,
        changes: { leadId, content } as any,
      },
    });

    return note;
  }
}

