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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER)
  @ApiOperation({ summary: 'Yangi foydalanuvchi yaratish' })
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.create(createUserDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha foydalanuvchilarni olish' })
  @ApiQuery({ name: 'branchId', required: false })
  findAll(@Request() req, @Query('branchId') branchId?: string) {
    return this.usersService.findAll(req.user, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Foydalanuvchini ID bo\'yicha olish' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.usersService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Foydalanuvchini yangilash' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Foydalanuvchini o\'chirish' })
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user);
  }
}


