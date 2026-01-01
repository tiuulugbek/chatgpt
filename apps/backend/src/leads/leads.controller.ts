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
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi lid yaratish' })
  create(@Body() createLeadDto: CreateLeadDto, @Request() req) {
    return this.leadsService.create(createLeadDto, req.user);
  }

  @Public()
  @Post('public')
  @ApiOperation({ summary: 'Ochiq API orqali lid yaratish (sayt uchun)' })
  createPublic(@Body() createLeadDto: CreateLeadDto) {
    // Public endpoint - saytdan kelgan murojaatlar uchun
    return this.leadsService.create(createLeadDto, { id: 'system', role: 'SYSTEM', branchId: null });
  }

  @Get()
  @ApiOperation({ summary: 'Barcha lidlarni olish' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'assigneeId', required: false })
  findAll(@Request() req, @Query() filters: any) {
    return this.leadsService.findAll(req.user, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lidni ID bo\'yicha olish' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.leadsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Lidni yangilash' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto, @Request() req) {
    return this.leadsService.update(id, updateLeadDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Lidni o\'chirish' })
  remove(@Param('id') id: string, @Request() req) {
    return this.leadsService.remove(id, req.user);
  }
}


