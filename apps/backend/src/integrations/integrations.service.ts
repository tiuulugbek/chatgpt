import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { InstagramService } from './services/instagram.service';
import { FacebookService } from './services/facebook.service';
import { TelegramIntegrationService } from './services/telegram.service';
import { YouTubeService } from './services/youtube.service';
import { GoogleMapsService } from './services/google-maps.service';
import { YandexMapsService } from './services/yandex-maps.service';
import axios from 'axios';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private instagramService: InstagramService,
    private facebookService: FacebookService,
    private telegramService: TelegramIntegrationService,
    private youtubeService: YouTubeService,
    private googleMapsService: GoogleMapsService,
    private yandexMapsService: YandexMapsService,
  ) {}

  async getSettings() {
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'singleton' },
    });

    return {
      instagram: {
        enabled: !!(settings?.instagramAccessToken && settings?.instagramAppId),
        appId: settings?.instagramAppId,
        hasToken: !!settings?.instagramAccessToken,
        hasSecret: !!settings?.instagramAppSecret,
      },
      facebook: {
        enabled: !!(settings?.facebookAccessToken && settings?.facebookAppId),
        appId: settings?.facebookAppId,
        pageId: settings?.facebookPageId,
        hasToken: !!settings?.facebookAccessToken,
        hasSecret: !!settings?.facebookAppSecret,
      },
      telegram: {
        enabled: !!settings?.telegramBotToken,
        hasToken: !!settings?.telegramBotToken,
        webhookUrl: settings?.telegramWebhookUrl,
      },
      youtube: {
        enabled: !!(settings?.youtubeApiKey && settings?.youtubeChannelId),
        channelId: settings?.youtubeChannelId,
        hasApiKey: !!settings?.youtubeApiKey,
      },
      googleMaps: {
        enabled: !!settings?.googleMapsApiKey,
        hasApiKey: !!settings?.googleMapsApiKey,
        placeIds: settings?.googlePlaceIds || [],
      },
      yandexMaps: {
        enabled: !!settings?.yandexApiKey,
        hasApiKey: !!settings?.yandexApiKey,
        orgIds: settings?.yandexOrgIds || [],
      },
    };
  }

  async updateIntegration(platform: string, data: any) {
    const updateData: any = {};

    switch (platform) {
      case 'instagram':
        if (data.accessToken && data.accessToken !== '••••••••') {
          updateData.instagramAccessToken = data.accessToken;
        }
        if (data.appId) updateData.instagramAppId = data.appId;
        if (data.appSecret && data.appSecret !== '••••••••') {
          updateData.instagramAppSecret = data.appSecret;
        }
        break;
      case 'facebook':
        if (data.accessToken && data.accessToken !== '••••••••') {
          updateData.facebookAccessToken = data.accessToken;
        }
        if (data.appId) updateData.facebookAppId = data.appId;
        if (data.appSecret && data.appSecret !== '••••••••') {
          updateData.facebookAppSecret = data.appSecret;
        }
        if (data.pageId) updateData.facebookPageId = data.pageId;
        break;
      case 'telegram':
        if (data.botToken && data.botToken !== '••••••••') {
          updateData.telegramBotToken = data.botToken;
        }
        if (data.webhookUrl !== undefined) updateData.telegramWebhookUrl = data.webhookUrl;
        break;
      case 'youtube':
        if (data.apiKey && data.apiKey !== '••••••••') {
          updateData.youtubeApiKey = data.apiKey;
        }
        if (data.channelId) updateData.youtubeChannelId = data.channelId;
        break;
      case 'googleMaps':
        if (data.apiKey && data.apiKey !== '••••••••') {
          updateData.googleMapsApiKey = data.apiKey;
        }
        if (data.placeIds) {
          // String bo'lsa, array'ga o'tkazish
          const placeIdsArray = typeof data.placeIds === 'string'
            ? data.placeIds.split(',').map((id: string) => id.trim()).filter(Boolean)
            : data.placeIds;
          updateData.googlePlaceIds = placeIdsArray;
        }
        break;
      case 'yandexMaps':
        if (data.apiKey && data.apiKey !== '••••••••') {
          updateData.yandexApiKey = data.apiKey;
        }
        if (data.orgIds) {
          // String bo'lsa, array'ga o'tkazish
          const orgIdsArray = typeof data.orgIds === 'string'
            ? data.orgIds.split(',').map((id: string) => id.trim()).filter(Boolean)
            : data.orgIds;
          updateData.yandexOrgIds = orgIdsArray;
        }
        break;
    }

    return this.settingsService.update(updateData);
  }

  async testIntegration(platform: string) {
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'singleton' },
    });

    try {
      switch (platform) {
        case 'instagram':
          if (!settings?.instagramAccessToken || !settings?.instagramAppId) {
            throw new Error('Instagram sozlamalari to\'liq emas');
          }
          // Instagram Graph API test
          const instagramResponse = await axios.get(
            `https://graph.instagram.com/me?fields=id,username&access_token=${settings.instagramAccessToken}`,
          );
          return {
            success: true,
            message: 'Instagram integratsiyasi muvaffaqiyatli',
            data: instagramResponse.data,
          };

        case 'facebook':
          if (!settings?.facebookAccessToken || !settings?.facebookAppId) {
            throw new Error('Facebook sozlamalari to\'liq emas');
          }
          // Facebook Graph API test
          const facebookResponse = await axios.get(
            `https://graph.facebook.com/me?access_token=${settings.facebookAccessToken}`,
          );
          return {
            success: true,
            message: 'Facebook integratsiyasi muvaffaqiyatli',
            data: facebookResponse.data,
          };

        case 'telegram':
          if (!settings?.telegramBotToken) {
            throw new Error('Telegram bot token kiritilmagan');
          }
          // Telegram Bot API test
          const telegramResponse = await axios.get(
            `https://api.telegram.org/bot${settings.telegramBotToken}/getMe`,
          );
          return {
            success: true,
            message: 'Telegram integratsiyasi muvaffaqiyatli',
            data: telegramResponse.data.result,
          };

        case 'youtube':
          if (!settings?.youtubeApiKey || !settings?.youtubeChannelId) {
            throw new Error('YouTube sozlamalari to\'liq emas');
          }
          // YouTube Data API test
          const youtubeResponse = await axios.get(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${settings.youtubeChannelId}&key=${settings.youtubeApiKey}`,
          );
          return {
            success: true,
            message: 'YouTube integratsiyasi muvaffaqiyatli',
            data: youtubeResponse.data.items?.[0]?.snippet,
          };

        case 'googleMaps':
          if (!settings?.googleMapsApiKey) {
            throw new Error('Google Maps API key kiritilmagan');
          }
          // Google Maps API test (Place Details)
          if (settings.googlePlaceIds && settings.googlePlaceIds.length > 0) {
            const placeId = settings.googlePlaceIds[0];
            try {
              const reviewsData = await this.googleMapsService.fetchReviews(
                settings.googleMapsApiKey,
                placeId,
              );
              return {
                success: true,
                message: 'Google Maps integratsiyasi muvaffaqiyatli',
                data: {
                  placeId,
                  rating: reviewsData.rating,
                  totalRatings: reviewsData.totalRatings,
                  reviewsCount: reviewsData.reviews.length,
                },
              };
            } catch (error: any) {
              return {
                success: false,
                message: 'Google Maps API testida xatolik',
                error: error.message,
              };
            }
          }
          return {
            success: true,
            message: 'Google Maps API key mavjud, lekin Place ID\'lar kiritilmagan',
          };

        case 'yandexMaps':
          if (!settings?.yandexApiKey) {
            throw new Error('Yandex Maps API key kiritilmagan');
          }
          return {
            success: true,
            message: 'Yandex Maps API key mavjud',
          };

        default:
          throw new Error('Noma\'lum platforma');
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error?.message || error.message || 'Integratsiya testi muvaffaqiyatsiz',
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Barcha integratsiyalardan xabarlarni olish va saqlash
   */
  async syncAllMessages() {
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      this.logger.warn('Settings not found');
      return;
    }

    const defaultBranch = await this.prisma.branch.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!defaultBranch) {
      this.logger.warn('No branch found');
      return;
    }

    const results = {
      instagram: { success: 0, error: 0 },
      facebook: { success: 0, error: 0 },
      telegram: { success: 0, error: 0 },
      youtube: { success: 0, error: 0 },
    };

    // Instagram izohlarni olish
    if (settings.instagramAccessToken && settings.instagramAppId) {
      try {
        // Bu yerda media ID'lar kerak bo'ladi, lekin hozircha skip qilamiz
        this.logger.log('Instagram sync skipped - media IDs required');
      } catch (error: any) {
        this.logger.error('Instagram sync error:', error);
        results.instagram.error++;
      }
    }

    // Facebook izohlarni olish
    if (settings.facebookAccessToken && settings.facebookPageId) {
      try {
        const comments = await this.facebookService.fetchComments(
          settings.facebookAccessToken,
          settings.facebookPageId,
        );
        for (const comment of comments) {
          try {
            await this.facebookService.saveCommentAsMessage(
              comment,
              settings.facebookPageId,
              defaultBranch.id,
            );
            results.facebook.success++;
          } catch (error: any) {
            this.logger.error('Save Facebook comment error:', error);
            results.facebook.error++;
          }
        }
      } catch (error: any) {
        this.logger.error('Facebook sync error:', error);
        results.facebook.error++;
      }
    }

    // Telegram xabarlarni olish
    if (settings.telegramBotToken) {
      try {
        const updates = await this.telegramService.fetchUpdates(settings.telegramBotToken);
        for (const update of updates) {
          try {
            await this.telegramService.saveMessageAsMessage(update, defaultBranch.id);
            results.telegram.success++;
          } catch (error: any) {
            this.logger.error('Save Telegram message error:', error);
            results.telegram.error++;
          }
        }
      } catch (error: any) {
        this.logger.error('Telegram sync error:', error);
        results.telegram.error++;
      }
    }

    // YouTube izohlarni olish
    if (settings.youtubeApiKey && settings.youtubeChannelId) {
      try {
        const videos = await this.youtubeService.fetchChannelVideos(
          settings.youtubeApiKey,
          settings.youtubeChannelId,
        );
        for (const video of videos.slice(0, 5)) {
          // Faqat oxirgi 5 ta videoni tekshiramiz
          try {
            const comments = await this.youtubeService.fetchComments(
              settings.youtubeApiKey,
              video.id.videoId,
            );
            for (const commentThread of comments) {
              try {
                await this.youtubeService.saveCommentAsMessage(
                  commentThread,
                  video.id.videoId,
                  defaultBranch.id,
                );
                results.youtube.success++;
              } catch (error: any) {
                this.logger.error('Save YouTube comment error:', error);
                results.youtube.error++;
              }
            }
          } catch (error: any) {
            this.logger.error('YouTube comments fetch error:', error);
            results.youtube.error++;
          }
        }
      } catch (error: any) {
        this.logger.error('YouTube sync error:', error);
        results.youtube.error++;
      }
    }

    return results;
  }
}
