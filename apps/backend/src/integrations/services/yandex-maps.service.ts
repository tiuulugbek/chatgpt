import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import axios from 'axios';
import { ReviewPlatform } from '@prisma/client';

@Injectable()
export class YandexMapsService {
  private readonly logger = new Logger(YandexMapsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Yandex Maps Organization API orqali sharhlarni olish
   */
  async fetchReviews(apiKey: string, orgId: string) {
    try {
      // Yandex Maps API v1.0 orqali sharhlarni olish
      const response = await axios.get(
        `https://api-maps.yandex.ru/services/org/1.0/${orgId}/reviews`,
        {
          params: {
            apikey: apiKey,
            lang: 'uz_UZ',
          },
        },
      );

      return response.data.reviews || [];
    } catch (error: any) {
      this.logger.error('Yandex Maps reviews fetch error:', error.response?.data || error.message);
      
      // Agar API mavjud bo'lmasa, mock data qaytaramiz
      this.logger.warn('Yandex Maps API may not be available, using mock data');
      return [];
    }
  }

  /**
   * Yandex Maps sharhini CRM'ga saqlash
   */
  async saveReviewAsReview(
    review: any,
    orgId: string,
    branchId?: string,
  ) {
    try {
      // Sharh allaqachon mavjudligini tekshirish
      const existingReview = await this.prisma.review.findFirst({
        where: {
          externalId: review.id?.toString() || review.reviewId?.toString(),
          platform: ReviewPlatform.YANDEX_MAPS,
        },
      });

      if (existingReview) {
        this.logger.log(`Review already exists: ${existingReview.id}`);
        return existingReview;
      }

      // Contact'ni topish yoki yaratish
      const authorName = review.authorName || review.author?.name || 'Noma\'lum';
      const authorId = review.authorId || review.author?.id || '';
      
      let contact = await this.prisma.contact.findFirst({
        where: {
          OR: [
            { fullName: authorName },
            { phone: authorId },
          ],
        },
      });

      if (!contact && branchId) {
        contact = await this.prisma.contact.create({
          data: {
            fullName: authorName,
            phone: authorId,
            branchId,
            tags: ['yandex-maps'],
          },
        });
      }

      // Rating'ni 1-5 oralig'iga o'tkazish
      let rating = 0;
      if (review.rating) {
        rating = typeof review.rating === 'number' ? review.rating : parseInt(review.rating);
        if (rating > 5) rating = 5;
        if (rating < 1) rating = 1;
      } else if (review.score) {
        // Agar score 10 ballik tizimda bo'lsa
        rating = Math.round((review.score / 10) * 5);
      }

      // Review'ni saqlash
      const savedReview = await this.prisma.review.create({
        data: {
          platform: ReviewPlatform.YANDEX_MAPS,
          rating,
          comment: review.text || review.comment || null,
          authorName,
          authorPhoto: review.authorPhoto || review.author?.photo || null,
          externalId: review.id?.toString() || review.reviewId?.toString(),
          platformUrl: review.url || null,
          metadata: {
            orgId,
            createdAt: review.createdAt || review.date,
            authorId,
            helpful: review.helpful || 0,
          },
          branchId: branchId || null,
          contactId: contact?.id || null,
        },
      });

      // Agar contact mavjud bo'lsa, unga tegishli Message ham yaratamiz
      if (contact && savedReview.comment) {
        await this.prisma.message.create({
          data: {
            type: 'YANDEX_MAPS_REVIEW' as any, // MessageType enum'ga qo'shish kerak
            direction: 'INBOUND',
            content: savedReview.comment,
            contactId: contact.id,
            branchId: branchId || null,
            externalId: savedReview.externalId,
            platformUrl: savedReview.platformUrl,
            metadata: {
              reviewId: savedReview.id,
              rating: savedReview.rating,
            },
          },
        });
      }

      return savedReview;
    } catch (error: any) {
      this.logger.error('Save Yandex Maps review error:', error);
      throw error;
    }
  }

  /**
   * Yandex Maps sharhiga javob yuborish
   */
  async replyToReview(apiKey: string, orgId: string, reviewId: string, responseText: string) {
    try {
      // Yandex Maps API orqali javob yuborish
      const response = await axios.post(
        `https://api-maps.yandex.ru/services/org/1.0/${orgId}/reviews/${reviewId}/reply`,
        {
          text: responseText,
        },
        {
          params: {
            apikey: apiKey,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Yandex Maps reply error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Organization ID'ni nomi orqali topish
   */
  async findOrganizationId(apiKey: string, name: string, city?: string) {
    try {
      const response = await axios.get(
        'https://geocode-maps.yandex.ru/1.x/',
        {
          params: {
            apikey: apiKey,
            geocode: city ? `${city}, ${name}` : name,
            format: 'json',
            results: 1,
          },
        },
      );

      if (response.data.response.GeoObjectCollection.featureMember.length > 0) {
        const geoObject = response.data.response.GeoObjectCollection.featureMember[0].GeoObject;
        // Organization ID'ni metadata'dan olish kerak
        return geoObject.metaDataProperty?.GeocoderMetaData?.id || null;
      }

      return null;
    } catch (error: any) {
      this.logger.error('Yandex Maps find organization error:', error.response?.data || error.message);
      throw error;
    }
  }
}

