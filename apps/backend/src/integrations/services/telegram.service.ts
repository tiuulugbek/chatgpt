import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import axios from 'axios';
import { MessageType } from '@prisma/client';

@Injectable()
export class TelegramIntegrationService {
  private readonly logger = new Logger(TelegramIntegrationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Telegram Bot API orqali xabarlarni olish
   */
  async fetchUpdates(botToken: string, offset?: number) {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${botToken}/getUpdates`,
        {
          params: {
            offset,
            timeout: 30,
          },
        },
      );

      return response.data.result || [];
    } catch (error: any) {
      this.logger.error('Telegram updates fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Telegram xabarini CRM'ga saqlash
   */
  async saveMessageAsMessage(
    update: any,
    branchId: string,
  ) {
    try {
      const message = update.message || update.channel_post;
      if (!message) return null;

      const fromUser = message.from;
      const chatId = message.chat.id.toString();
      const text = message.text || message.caption || '';

      // Contact'ni topish yoki yaratish
      let contact = await this.prisma.contact.findFirst({
        where: {
          OR: [
            { phone: chatId },
            { email: chatId },
          ],
        },
      });

      if (!contact && fromUser) {
        const fullName = fromUser.first_name
          ? `${fromUser.first_name} ${fromUser.last_name || ''}`.trim()
          : 'Telegram foydalanuvchi';

        contact = await this.prisma.contact.create({
          data: {
            fullName,
            phone: chatId,
            branchId,
            tags: ['telegram'],
          },
        });
      }

      if (!contact) return null;

      // Message'ni saqlash
      const savedMessage = await this.prisma.message.create({
        data: {
          content: text,
          type: MessageType.TELEGRAM,
          direction: 'INBOUND',
          contactId: contact.id,
          branchId,
          externalId: message.message_id?.toString(),
          metadata: {
            chatId,
            from: fromUser,
            date: message.date,
            chat: message.chat,
          },
        },
      });

      return savedMessage;
    } catch (error: any) {
      this.logger.error('Save Telegram message error:', error);
      throw error;
    }
  }

  /**
   * Telegram'ga xabar yuborish
   */
  async sendMessage(botToken: string, chatId: string, message: string) {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          chat_id: chatId,
          text: message,
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Telegram send message error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Webhook o'rnatish
   */
  async setWebhook(botToken: string, webhookUrl: string) {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          url: webhookUrl,
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Telegram set webhook error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Webhook'ni o'chirish
   */
  async deleteWebhook(botToken: string) {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/deleteWebhook`,
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Telegram delete webhook error:', error.response?.data || error.message);
      throw error;
    }
  }
}

