import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto, currentUser: any) {
    const contact = await this.prisma.contact.create({
      data: {
        fullName: createContactDto.fullName,
        phone: createContactDto.phone,
        email: createContactDto.email,
        address: createContactDto.address,
        company: createContactDto.company,
        tin: createContactDto.tin,
        notes: createContactDto.notes,
        tags: createContactDto.tags || [],
        branchId: createContactDto.branchId || currentUser.branchId,
      },
      include: {
        branch: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Contact',
        entityId: contact.id,
        userId: currentUser.id,
        changes: createContactDto as any,
      },
    });

    return contact;
  }

  async findAll(currentUser: any, filters?: any) {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.branchId = currentUser.branchId;
    } else if (filters?.branchId) {
      where.branchId = filters.branchId;
    }

    // Qidiruv filtri
    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
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

  async findOne(id: string, currentUser?: any) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        branch: true,
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            assignee: true,
            branch: true,
          },
        },
        deals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            assignee: true,
            branch: true,
          },
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

    // Huquq tekshiruvi
    if (currentUser && currentUser.role !== 'SUPER_ADMIN') {
      if (contact.branchId !== currentUser.branchId) {
        throw new ForbiddenException('Bu mijozni ko\'rish huquqingiz yo\'q');
      }
    }

    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto, currentUser: any) {
    await this.findOne(id, currentUser);

    const contact = await this.prisma.contact.update({
      where: { id },
      data: updateContactDto as any,
      include: {
        branch: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Contact',
        entityId: id,
        userId: currentUser.id,
        changes: updateContactDto as any,
      },
    });

    return contact;
  }

  async remove(id: string, currentUser: any) {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'BRANCH_MANAGER') {
      throw new ForbiddenException('Mijozni o\'chirish huquqingiz yo\'q');
    }

    await this.findOne(id, currentUser);

    await this.prisma.contact.delete({
      where: { id },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Contact',
        entityId: id,
        userId: currentUser.id,
      },
    });

    return { message: 'Mijoz o\'chirildi' };
  }
}



