import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReviewPlatform } from '@prisma/client';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha sharhlarni olish' })
  @ApiQuery({ name: 'platform', required: false, enum: ReviewPlatform })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'rating', required: false })
  @ApiQuery({ name: 'minRating', required: false })
  @ApiQuery({ name: 'hasResponse', required: false })
  findAll(@Request() req, @Query() filters?: any) {
    return this.reviewsService.findAll(req.user, filters);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Sharhlar statistikasi' })
  @ApiQuery({ name: 'branchId', required: false })
  getStatistics(@Request() req, @Query() filters?: any) {
    return this.reviewsService.getStatistics(req.user, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Sharhni ID bo\'yicha olish' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sharhni yangilash (javob qo\'shish)' })
  update(@Param('id') id: string, @Body() updateDto: any, @Request() req) {
    return this.reviewsService.update(id, updateDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Sharhni o\'chirish' })
  delete(@Param('id') id: string, @Request() req) {
    return this.reviewsService.delete(id, req.user);
  }
}
