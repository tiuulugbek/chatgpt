import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import axios from 'axios';
import { MessageType } from '@prisma/client';

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * YouTube Data API orqali video izohlarni olish
   */
  async fetchComments(apiKey: string, videoId: string) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/commentThreads',
        {
          params: {
            part: 'snippet',
            videoId,
            key: apiKey,
            maxResults: 100,
            order: 'time',
          },
        },
      );

      return response.data.items || [];
    } catch (error: any) {
      this.logger.error('YouTube comments fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * YouTube kanalining barcha videolarini olish
   */
  async fetchChannelVideos(apiKey: string, channelId: string) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            part: 'snippet',
            channelId,
            key: apiKey,
            maxResults: 50,
            order: 'date',
            type: 'video',
          },
        },
      );

      return response.data.items || [];
    } catch (error: any) {
      this.logger.error('YouTube videos fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * YouTube izohini CRM'ga saqlash
   */
  async saveCommentAsMessage(
    commentThread: any,
    videoId: string,
    branchId: string,
  ) {
    try {
      const snippet = commentThread.snippet?.topLevelComment?.snippet;
      if (!snippet) return null;

      const authorName = snippet.authorDisplayName || 'Noma\'lum';
      const authorChannelId = snippet.authorChannelId?.value || '';

      // Contact'ni topish yoki yaratish
      let contact = await this.prisma.contact.findFirst({
        where: {
          OR: [
            { phone: authorChannelId },
            { email: authorChannelId },
          ],
        },
      });

      if (!contact) {
        contact = await this.prisma.contact.create({
          data: {
            fullName: authorName,
            phone: authorChannelId,
            branchId,
            tags: ['youtube'],
          },
        });
      }

      // Message'ni saqlash
      const message = await this.prisma.message.create({
        data: {
          content: snippet.textDisplay,
          type: MessageType.YOUTUBE_COMMENT,
          direction: 'INBOUND',
          contactId: contact.id,
          branchId,
          externalId: commentThread.id,
          metadata: {
            videoId,
            authorName,
            authorChannelId,
            publishedAt: snippet.publishedAt,
            likeCount: snippet.likeCount,
            updatedAt: snippet.updatedAt,
          },
        },
      });

      return message;
    } catch (error: any) {
      this.logger.error('Save YouTube comment error:', error);
      throw error;
    }
  }

  /**
   * YouTube'ga izoh javob yuborish
   */
  async replyToComment(apiKey: string, commentId: string, text: string) {
    try {
      // YouTube API orqali javob yuborish uchun o'z API'ni ishlatish kerak
      // Bu funksiya oauth2 va maxsus ruxsatlar talab qiladi
      this.logger.warn('YouTube comment reply requires OAuth2 authentication');
      return { success: false, message: 'YouTube comment reply requires OAuth2' };
    } catch (error: any) {
      this.logger.error('YouTube reply error:', error.response?.data || error.message);
      throw error;
    }
  }
}

