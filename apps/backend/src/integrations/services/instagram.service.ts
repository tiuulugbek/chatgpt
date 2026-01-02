import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import axios from 'axios';
import { MessageType } from '@prisma/client';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Instagram Graph API orqali izohlarni olish
   */
  async fetchComments(accessToken: string, mediaId: string) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/${mediaId}/comments`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,text,username,timestamp,like_count',
          },
        },
      );

      return response.data.data || [];
    } catch (error: any) {
      this.logger.error('Instagram comments fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Instagram Graph API orqali DM'larni olish
   */
  async fetchDirectMessages(accessToken: string, userId: string) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/${userId}/conversations`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,participants,messages{id,from,text,timestamp}',
          },
        },
      );

      return response.data.data || [];
    } catch (error: any) {
      this.logger.error('Instagram DM fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Instagram izohini CRM'ga saqlash
   */
  async saveCommentAsMessage(
    comment: any,
    mediaId: string,
    branchId: string,
  ) {
    try {
      // Contact'ni topish yoki yaratish
      let contact = await this.prisma.contact.findFirst({
        where: {
          OR: [
            { phone: comment.username },
            { email: comment.username },
          ],
        },
      });

      if (!contact) {
        contact = await this.prisma.contact.create({
          data: {
            fullName: comment.username || 'Noma\'lum foydalanuvchi',
            phone: comment.username || '',
            branchId,
            tags: ['instagram'],
          },
        });
      }

      // Message'ni saqlash
      const message = await this.prisma.message.create({
        data: {
          content: comment.text,
          type: MessageType.INSTAGRAM_COMMENT,
          direction: 'INBOUND',
          contactId: contact.id,
          branchId,
          externalId: comment.id,
          metadata: {
            mediaId,
            username: comment.username,
            timestamp: comment.timestamp,
            likeCount: comment.like_count,
          },
        },
      });

      return message;
    } catch (error: any) {
      this.logger.error('Save Instagram comment error:', error);
      throw error;
    }
  }

  /**
   * Instagram DM'ni CRM'ga saqlash
   */
  async saveDirectMessageAsMessage(
    message: any,
    conversationId: string,
    branchId: string,
  ) {
    try {
      // Contact'ni topish yoki yaratish
      const fromUser = message.from?.username || 'Noma\'lum';
      let contact = await this.prisma.contact.findFirst({
        where: {
          OR: [
            { phone: fromUser },
            { email: fromUser },
          ],
        },
      });

      if (!contact) {
        contact = await this.prisma.contact.create({
          data: {
            fullName: fromUser,
            phone: fromUser,
            branchId,
            tags: ['instagram'],
          },
        });
      }

      // Message'ni saqlash
      const savedMessage = await this.prisma.message.create({
        data: {
          content: message.text,
          type: MessageType.INSTAGRAM_DM,
          direction: 'INBOUND',
          contactId: contact.id,
          branchId,
          externalId: message.id,
          metadata: {
            conversationId,
            from: message.from,
            timestamp: message.timestamp,
          },
        },
      });

      return savedMessage;
    } catch (error: any) {
      this.logger.error('Save Instagram DM error:', error);
      throw error;
    }
  }

  /**
   * Instagram'ga javob yuborish (izoh)
   */
  async replyToComment(accessToken: string, commentId: string, message: string) {
    try {
      const response = await axios.post(
        `https://graph.instagram.com/${commentId}/replies`,
        {
          message,
        },
        {
          params: {
            access_token: accessToken,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Instagram reply error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Instagram'ga DM yuborish
   */
  async sendDirectMessage(accessToken: string, userId: string, message: string) {
    try {
      const response = await axios.post(
        `https://graph.instagram.com/${userId}/messages`,
        {
          recipient: { id: userId },
          message: { text: message },
        },
        {
          params: {
            access_token: accessToken,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Instagram send DM error:', error.response?.data || error.message);
      throw error;
    }
  }
}

