import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Integratsiya sozlamalari' })
  getSettings() {
    return this.integrationsService.getSettings();
  }

  @Patch(':platform')
  @ApiOperation({ summary: 'Integratsiya sozlamalarini yangilash' })
  updateIntegration(@Param('platform') platform: string, @Body() data: any, @Request() req) {
    // Faqat SUPER_ADMIN integratsiyalarni sozlashi mumkin
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Integratsiyalarni sozlash huquqingiz yo\'q');
    }
    return this.integrationsService.updateIntegration(platform, data);
  }

  @Post(':platform/test')
  @ApiOperation({ summary: 'Integratsiyani test qilish' })
  testIntegration(@Param('platform') platform: string, @Request() req) {
    // Faqat SUPER_ADMIN integratsiyalarni test qilishi mumkin
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Integratsiyalarni test qilish huquqingiz yo\'q');
    }
    return this.integrationsService.testIntegration(platform);
  }
}



