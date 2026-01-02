import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ReviewPlatform } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: any, filters?: any) {
    let where: any = {};

    // Filial cheklovi
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.branchId = currentUser.branchId;
    }

    if (filters?.platform) {
      where.platform = filters.platform;
    }

    if (filters?.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters?.rating) {
      where.rating = parseInt(filters.rating);
    }

    if (filters?.minRating) {
      where.rating = { gte: parseInt(filters.minRating) };
    }

    if (filters?.hasResponse !== undefined) {
      if (filters.hasResponse === 'true') {
        where.response = { not: null };
      } else {
        where.response = null;
      }
    }

    return this.prisma.review.findMany({
      where,
      include: {
        branch: true,
        contact: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        branch: true,
        contact: true,
      },
    });
  }

  async update(id: string, updateDto: any, currentUser: any) {
    const review = await this.prisma.review.update({
      where: { id },
      data: {
        ...updateDto,
        respondedBy: currentUser.id,
        respondedAt: updateDto.response ? new Date() : null,
      },
      include: {
        branch: true,
        contact: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Review',
        entityId: review.id,
        userId: currentUser.id,
        changes: updateDto as any,
      },
    });

    return review;
  }

  async delete(id: string, currentUser: any) {
    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Review',
        entityId: id,
        userId: currentUser.id,
      },
    });

    return this.prisma.review.delete({
      where: { id },
    });
  }

  async getStatistics(currentUser: any, filters?: any) {
    let where: any = {};

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.branchId = currentUser.branchId;
    }

    if (filters?.branchId) {
      where.branchId = filters.branchId;
    }

    const [total, byPlatform, byRating, averageRating, withResponse, withoutResponse] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.groupBy({
        by: ['platform'],
        _count: { id: true },
        where,
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        _count: { id: true },
        where,
      }),
      this.prisma.review.aggregate({
        _avg: { rating: true },
        where,
      }),
      this.prisma.review.count({
        where: { ...where, response: { not: null } },
      }),
      this.prisma.review.count({
        where: { ...where, response: null },
      }),
    ]);

    return {
      total,
      byPlatform,
      byRating,
      averageRating: averageRating._avg.rating || 0,
      withResponse,
      withoutResponse,
      responseRate: total > 0 ? (withResponse / total) * 100 : 0,
    };
  }
}
