import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, currentUser: any) {
    // Faqat SUPER_ADMIN yoki BRANCH_MANAGER yangi foydalanuvchi yarata oladi
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'BRANCH_MANAGER') {
      throw new ForbiddenException('Foydalanuvchi yaratish huquqingiz yo\'q');
    }

    // BRANCH_MANAGER faqat o'z filialiga foydalanuvchi qo'sha oladi
    if (currentUser.role === 'BRANCH_MANAGER' && createUserDto.branchId !== currentUser.branchId) {
      throw new ForbiddenException('Faqat o\'z filialingizga foydalanuvchi qo\'sha olasiz');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        branchId: createUserDto.branchId,
        phone: createUserDto.phone,
      },
      include: {
        branch: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        userId: currentUser.id,
        changes: { email: user.email, role: user.role },
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll(currentUser: any, branchId?: string) {
    let where: any = {};

    // SUPER_ADMIN barcha foydalanuvchilarni ko'radi
    if (currentUser.role === 'SUPER_ADMIN') {
      if (branchId) {
        where.branchId = branchId;
      }
    }
    // BRANCH_MANAGER faqat o'z filialidagi foydalanuvchilarni ko'radi
    else if (currentUser.role === 'BRANCH_MANAGER') {
      where.branchId = currentUser.branchId;
    }
    // BRANCH_STAFF faqat o'zini ko'radi
    else {
      where.id = currentUser.id;
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        branch: true,
      },
    });

    return users;
  }

  async findOne(id: string, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        branch: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Huquq tekshiruvi
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (currentUser.role === 'BRANCH_MANAGER' && user.branchId !== currentUser.branchId) {
        throw new ForbiddenException('Bu foydalanuvchini ko\'rish huquqingiz yo\'q');
      }
      if (currentUser.role === 'BRANCH_STAFF' && user.id !== currentUser.id) {
        throw new ForbiddenException('Bu foydalanuvchini ko\'rish huquqingiz yo\'q');
      }
    }

    const { password, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any) {
    const user = await this.findOne(id, currentUser);

    // Parol yangilash
    let updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        branch: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        userId: currentUser.id,
        changes: updateUserDto as any,
      },
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string, currentUser: any) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Foydalanuvchini o\'chirish huquqingiz yo\'q');
    }

    await this.findOne(id, currentUser);

    await this.prisma.user.delete({
      where: { id },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'User',
        entityId: id,
        userId: currentUser.id,
      },
    });

    return { message: 'Foydalanuvchi o\'chirildi' };
  }
}

