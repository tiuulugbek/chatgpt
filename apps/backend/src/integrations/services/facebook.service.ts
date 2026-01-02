import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import axios from 'axios';
import { MessageType } from '@prisma/client';

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Facebook Graph API orqali post izohlarni olish
   */
  async fetchComments(accessToken: string, postId: string) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${postId}/comments`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,message,from,created_time,like_count',
          },
        },
      );

      return response.data.data || [];
    } catch (error: any) {
      this.logger.error('Facebook comments fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Facebook Page xabarlarini olish
   */
  async fetchPageMessages(accessToken: string, pageId: string) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${pageId}/conversations`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,participants,messages{id,from,message,created_time}',
          },
        },
      );

      return response.data.data || [];
    } catch (error: any) {
      this.logger.error('Facebook messages fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Facebook izohini CRM'ga saqlash
   */
  async saveCommentAsMessage(
    comment: any,
    postId: string,
    branchId: string,
  ) {
    try {
      const fromUser = comment.from?.name || 'Noma\'lum';
      const fromId = comment.from?.id || '';

      // Contact'ni topish yoki yaratish
      let contact = await this.prisma.contact.findFirst({
        where: {
          OR: [
            { phone: fromId },
            { email: fromId },
          ],
        },
      });

      if (!contact) {
        contact = await this.prisma.contact.create({
          data: {
            fullName: fromUser,
            phone: fromId,
            branchId,
            tags: ['facebook'],
          },
        });
      }

      // Message'ni saqlash
      const message = await this.prisma.message.create({
        data: {
          content: comment.message,
          type: MessageType.FACEBOOK_COMMENT,
          direction: 'INBOUND',
          contactId: contact.id,
          branchId,
          externalId: comment.id,
          metadata: {
            postId,
            from: comment.from,
            createdTime: comment.created_time,
            likeCount: comment.like_count,
          },
        },
      });

      return message;
    } catch (error: any) {
      this.logger.error('Save Facebook comment error:', error);
      throw error;
    }
  }

  /**
   * Facebook xabarini CRM'ga saqlash
   */
  async saveMessageAsMessage(
    message: any,
    conversationId: string,
    branchId: string,
  ) {
    try {
      const fromUser = message.from?.name || 'Noma\'lum';
      const fromId = message.from?.id || '';

      // Contact'ni topish yoki yaratish
      let contact = await this.prisma.contact.findFirst({
        where: {
          OR: [
            { phone: fromId },
            { email: fromId },
          ],
        },
      });

      if (!contact) {
        contact = await this.prisma.contact.create({
          data: {
            fullName: fromUser,
            phone: fromId,
            branchId,
            tags: ['facebook'],
          },
        });
      }

      // Message'ni saqlash
      const savedMessage = await this.prisma.message.create({
        data: {
          content: message.message,
          type: MessageType.FACEBOOK_MESSAGE,
          direction: 'INBOUND',
          contactId: contact.id,
          branchId,
          externalId: message.id,
          metadata: {
            conversationId,
            from: message.from,
            createdTime: message.created_time,
          },
        },
      });

      return savedMessage;
    } catch (error: any) {
      this.logger.error('Save Facebook message error:', error);
      throw error;
    }
  }

  /**
   * Facebook'ga izoh javob yuborish
   */
  async replyToComment(accessToken: string, commentId: string, message: string) {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${commentId}/comments`,
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
      this.logger.error('Facebook reply error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Facebook'ga xabar yuborish
   */
  async sendMessage(accessToken: string, recipientId: string, message: string) {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/me/messages`,
        {
          recipient: { id: recipientId },
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
      this.logger.error('Facebook send message error:', error.response?.data || error.message);
      throw error;
    }
  }
}

