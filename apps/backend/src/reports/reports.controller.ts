import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard statistikasi' })
  @ApiQuery({ name: 'range', required: false, enum: ['week', 'month', 'year'] })
  getDashboard(@Request() req, @Query('range') range?: string) {
    return this.reportsService.getDashboard(req.user, range);
  }

  @Get('leads')
  @ApiOperation({ summary: 'Lidlar hisoboti' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'source', required: false })
  getLeadsReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
    @Query('source') source?: string,
  ) {
    return this.reportsService.getLeadsReport(req.user, {
      startDate,
      endDate,
      branchId,
      source,
    });
  }

  @Get('deals')
  @ApiOperation({ summary: 'Bitimlar hisoboti' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'stage', required: false })
  getDealsReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
    @Query('stage') stage?: string,
  ) {
    return this.reportsService.getDealsReport(req.user, {
      startDate,
      endDate,
      branchId,
      stage,
    });
  }

  @Get('performance')
  @ApiOperation({ summary: 'Xodimlar faolligi hisoboti' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  getPerformanceReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.reportsService.getPerformanceReport(req.user, {
      startDate,
      endDate,
      branchId,
    });
  }
}



