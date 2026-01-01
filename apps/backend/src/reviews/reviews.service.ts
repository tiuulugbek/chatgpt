import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: any, filters?: any) {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.branchId = currentUser.branchId;
    }

    if (filters?.platform) {
      where.platform = filters.platform;
    }

    if (filters?.branchId) {
      where.branchId = filters.branchId;
    }

    return this.prisma.review.findMany({
      where,
      include: {
        branch: true,
        contact: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}


