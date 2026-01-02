import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import axios from 'axios';
import { ReviewPlatform } from '@prisma/client';

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Google Places API orqali sharhlarni olish
   */
  async fetchReviews(apiKey: string, placeId: string) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            fields: 'reviews,rating,user_ratings_total',
            key: apiKey,
            language: 'uz',
          },
        },
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return {
        reviews: response.data.result.reviews || [],
        rating: response.data.result.rating || 0,
        totalRatings: response.data.result.user_ratings_total || 0,
      };
    } catch (error: any) {
      this.logger.error('Google Maps reviews fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Google Maps sharhini CRM'ga saqlash
   */
  async saveReviewAsReview(
    review: any,
    placeId: string,
    branchId?: string,
  ) {
    try {
      // Sharh allaqachon mavjudligini tekshirish
      const existingReview = await this.prisma.review.findFirst({
        where: {
          externalId: review.review_id?.toString() || review.time?.toString(),
          platform: ReviewPlatform.GOOGLE_MAPS,
        },
      });

      if (existingReview) {
        this.logger.log(`Review already exists: ${existingReview.id}`);
        return existingReview;
      }

      // Contact'ni topish yoki yaratish
      const authorName = review.author_name || 'Noma\'lum';
      let contact = await this.prisma.contact.findFirst({
        where: {
          OR: [
            { fullName: authorName },
            { phone: review.author_url || '' },
          ],
        },
      });

      if (!contact && branchId) {
        contact = await this.prisma.contact.create({
          data: {
            fullName: authorName,
            phone: review.author_url || '',
            branchId,
            tags: ['google-maps'],
          },
        });
      }

      // Review'ni saqlash
      const savedReview = await this.prisma.review.create({
        data: {
          platform: ReviewPlatform.GOOGLE_MAPS,
          rating: review.rating || 0,
          comment: review.text || null,
          authorName,
          authorPhoto: review.profile_photo_url || null,
          externalId: review.review_id?.toString() || review.time?.toString(),
          platformUrl: review.author_url || null,
          metadata: {
            placeId,
            relativeTimeDescription: review.relative_time_description,
            time: review.time,
            language: review.language,
          },
          branchId: branchId || null,
          contactId: contact?.id || null,
        },
      });

      // Agar contact mavjud bo'lsa, unga tegishli Message ham yaratamiz
      if (contact && savedReview.comment) {
        await this.prisma.message.create({
          data: {
            type: 'GOOGLE_MAPS_REVIEW' as any, // MessageType enum'ga qo'shish kerak
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
      this.logger.error('Save Google Maps review error:', error);
      throw error;
    }
  }

  /**
   * Google Maps sharhiga javob yuborish
   * Note: Bu Google My Business API talab qiladi
   */
  async replyToReview(apiKey: string, reviewId: string, responseText: string) {
    try {
      // Google My Business API orqali javob yuborish
      // Bu OAuth2 va maxsus ruxsatlar talab qiladi
      this.logger.warn('Google Maps review reply requires Google My Business API with OAuth2');
      return { success: false, message: 'Google Maps review reply requires Google My Business API' };
    } catch (error: any) {
      this.logger.error('Google Maps reply error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Place ID'ni koordinatalar orqali topish
   */
  async findPlaceId(apiKey: string, lat: number, lng: number, name?: string) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
        {
          params: {
            input: name || `${lat},${lng}`,
            inputtype: name ? 'textquery' : 'textquery',
            locationbias: `point:${lat},${lng}`,
            fields: 'place_id,name',
            key: apiKey,
          },
        },
      );

      if (response.data.status === 'OK' && response.data.candidates.length > 0) {
        return response.data.candidates[0].place_id;
      }

      return null;
    } catch (error: any) {
      this.logger.error('Google Maps find place ID error:', error.response?.data || error.message);
      throw error;
    }
  }
}

