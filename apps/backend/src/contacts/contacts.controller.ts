import { Controller, Get, Param, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha mijozlarni olish' })
  findAll(@Request() req, @Query() filters: any) {
    return this.contactsService.findAll(req.user, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mijozni ID bo\'yicha olish' })
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }
}



