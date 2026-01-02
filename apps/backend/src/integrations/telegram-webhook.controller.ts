import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { TelegramIntegrationService } from './services/telegram.service';
import { PrismaService } from '../common/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Telegram Webhook')
@Controller('telegram')
export class TelegramWebhookController {
  constructor(
    private integrationsService: IntegrationsService,
    private telegramService: TelegramIntegrationService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Telegram webhook - xabarlarni qabul qilish' })
  async webhook(@Body() body: any) {
    try {
      const settings = await this.prisma.settings.findUnique({
        where: { id: 'singleton' },
      });

      if (!settings?.telegramBotToken) {
        return { ok: false, error: 'Telegram bot token topilmadi' };
      }

      const defaultBranch = await this.prisma.branch.findFirst({
        orderBy: { createdAt: 'asc' },
      });

      if (!defaultBranch) {
        return { ok: false, error: 'Filial topilmadi' };
      }

      // Telegram update'ni qayta ishlash
      if (body.message) {
        await this.telegramService.saveMessageAsMessage(body, defaultBranch.id);
      }

      return { ok: true };
    } catch (error: any) {
      console.error('Telegram webhook error:', error);
      return { ok: false, error: error.message };
    }
  }

  @Get('webhook')
  @Public()
  @ApiOperation({ summary: 'Telegram webhook verification' })
  verifyWebhook(@Query('token') token: string) {
    // Telegram webhook verification
    return { ok: true, token };
  }

  @Post('set-webhook')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Telegram webhook o\'rnatish' })
  async setWebhook(@Request() req, @Body() body: { webhookUrl: string }) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Webhook o\'rnatish huquqingiz yo\'q');
    }

    const settings = await this.prisma.settings.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings?.telegramBotToken) {
      throw new Error('Telegram bot token topilmadi');
    }

    return this.telegramService.setWebhook(settings.telegramBotToken, body.webhookUrl);
  }

  @Post('delete-webhook')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Telegram webhook o\'chirish' })
  async deleteWebhook(@Request() req) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new Error('Webhook o\'chirish huquqingiz yo\'q');
    }

    const settings = await this.prisma.settings.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings?.telegramBotToken) {
      throw new Error('Telegram bot token topilmadi');
    }

    return this.telegramService.deleteWebhook(settings.telegramBotToken);
  }
}

