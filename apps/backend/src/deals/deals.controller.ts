import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Deals')
@Controller('deals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi bitim yaratish' })
  create(@Body() createDealDto: CreateDealDto, @Request() req) {
    return this.dealsService.create(createDealDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha bitimlarni olish' })
  @ApiQuery({ name: 'stage', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'assigneeId', required: false })
  findAll(@Request() req, @Query() filters: any) {
    return this.dealsService.findAll(req.user, filters);
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Savdo voronkasi (pipeline)' })
  @ApiQuery({ name: 'branchId', required: false })
  getPipeline(@Request() req, @Query('branchId') branchId?: string) {
    return this.dealsService.getPipeline(branchId || '', req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitimni ID bo\'yicha olish' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.dealsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Bitimni yangilash' })
  update(@Param('id') id: string, @Body() updateDealDto: UpdateDealDto, @Request() req) {
    return this.dealsService.update(id, updateDealDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Bitimni o\'chirish' })
  remove(@Param('id') id: string, @Request() req) {
    return this.dealsService.remove(id, req.user);
  }
}



