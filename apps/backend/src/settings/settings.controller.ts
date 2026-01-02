import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Sozlamalarni olish' })
  get() {
    return this.settingsService.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Sozlamalarni yangilash' })
  update(@Body() updateDto: any, @Request() req) {
    // Faqat SUPER_ADMIN sozlamalarni o'zgartira oladi
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Sozlamalarni o\'zgartirish huquqingiz yo\'q');
    }
    return this.settingsService.update(updateDto);
  }
}

