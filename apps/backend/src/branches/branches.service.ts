import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto, currentUser: any) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Filial yaratish huquqingiz yo\'q');
    }

    const branch = await this.prisma.branch.create({
      data: createBranchDto,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Branch',
        entityId: branch.id,
        userId: currentUser.id,
        changes: createBranchDto as any,
      },
    });

    return branch;
  }

  async findAll(currentUser: any) {
    let where: any = {};

    // SUPER_ADMIN barcha filiallarni ko'radi
    if (currentUser.role !== 'SUPER_ADMIN') {
      // Boshqa rollar faqat o'z filiallarini ko'radi
      where.id = currentUser.branchId;
    }

    return this.prisma.branch.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            leads: true,
            deals: true,
            contacts: true,
          },
        },
      },
    });
  }

  async findOne(id: string, currentUser: any) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            leads: true,
            deals: true,
            contacts: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Filial topilmadi');
    }

    // Huquq tekshiruvi
    if (currentUser.role !== 'SUPER_ADMIN' && branch.id !== currentUser.branchId) {
      throw new ForbiddenException('Bu filialni ko\'rish huquqingiz yo\'q');
    }

    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto, currentUser: any) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Filialni yangilash huquqingiz yo\'q');
    }

    await this.findOne(id, currentUser);

    const branch = await this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Branch',
        entityId: id,
        userId: currentUser.id,
        changes: updateBranchDto as any,
      },
    });

    return branch;
  }

  async remove(id: string, currentUser: any) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Filialni o\'chirish huquqingiz yo\'q');
    }

    await this.findOne(id, currentUser);

    await this.prisma.branch.delete({
      where: { id },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Branch',
        entityId: id,
        userId: currentUser.id,
      },
    });

    return { message: 'Filial o\'chirildi' };
  }
}

