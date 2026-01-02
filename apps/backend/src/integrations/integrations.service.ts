import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SettingsService } from '../settings/settings.service';
import axios from 'axios';

@Injectable()
export class IntegrationsService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
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
      },
      facebook: {
        enabled: !!(settings?.facebookAccessToken && settings?.facebookAppId),
        appId: settings?.facebookAppId,
        pageId: settings?.facebookPageId,
        hasToken: !!settings?.facebookAccessToken,
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
        if (data.accessToken) updateData.instagramAccessToken = data.accessToken;
        if (data.appId) updateData.instagramAppId = data.appId;
        if (data.appSecret) updateData.instagramAppSecret = data.appSecret;
        break;
      case 'facebook':
        if (data.accessToken) updateData.facebookAccessToken = data.accessToken;
        if (data.appId) updateData.facebookAppId = data.appId;
        if (data.appSecret) updateData.facebookAppSecret = data.appSecret;
        if (data.pageId) updateData.facebookPageId = data.pageId;
        break;
      case 'telegram':
        if (data.botToken) updateData.telegramBotToken = data.botToken;
        if (data.webhookUrl !== undefined) updateData.telegramWebhookUrl = data.webhookUrl;
        break;
      case 'youtube':
        if (data.apiKey) updateData.youtubeApiKey = data.apiKey;
        if (data.channelId) updateData.youtubeChannelId = data.channelId;
        break;
      case 'googleMaps':
        if (data.apiKey) updateData.googleMapsApiKey = data.apiKey;
        if (data.placeIds) updateData.googlePlaceIds = data.placeIds;
        break;
      case 'yandexMaps':
        if (data.apiKey) updateData.yandexApiKey = data.apiKey;
        if (data.orgIds) updateData.yandexOrgIds = data.orgIds;
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
            const mapsResponse = await axios.get(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${settings.googleMapsApiKey}`,
            );
            return {
              success: true,
              message: 'Google Maps integratsiyasi muvaffaqiyatli',
              data: mapsResponse.data.result,
            };
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
}
