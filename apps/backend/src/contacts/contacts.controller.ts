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
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi mijoz yaratish' })
  create(@Body() createContactDto: CreateContactDto, @Request() req) {
    return this.contactsService.create(createContactDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha mijozlarni olish' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  findAll(@Request() req, @Query() filters: any) {
    return this.contactsService.findAll(req.user, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mijozni ID bo\'yicha olish' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.contactsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mijozni yangilash' })
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto, @Request() req) {
    return this.contactsService.update(id, updateContactDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Mijozni o\'chirish' })
  remove(@Param('id') id: string, @Request() req) {
    return this.contactsService.remove(id, req.user);
  }
}



