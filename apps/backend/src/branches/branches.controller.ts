import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Branches')
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Yangi filial yaratish' })
  create(@Body() createBranchDto: CreateBranchDto, @Request() req) {
    return this.branchesService.create(createBranchDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha filiallarni olish' })
  findAll(@Request() req) {
    return this.branchesService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Filialni ID bo\'yicha olish' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.branchesService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Filialni yangilash' })
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto, @Request() req) {
    return this.branchesService.update(id, updateBranchDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Filialni o\'chirish' })
  remove(@Param('id') id: string, @Request() req) {
    return this.branchesService.remove(id, req.user);
  }
}


