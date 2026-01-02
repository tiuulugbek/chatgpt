import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi xabar yaratish (javob berish)' })
  create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.messagesService.create(createMessageDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha xabarlarni olish' })
  @ApiQuery({ name: 'contactId', required: false })
  @ApiQuery({ name: 'leadId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'direction', required: false })
  @ApiQuery({ name: 'isRead', required: false })
  findAll(@Request() req, @Query() filters: any) {
    return this.messagesService.findAll(req.user, filters);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Xabarni o\'qilgan deb belgilash' })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.messagesService.markAsRead(id, req.user);
  }
}



