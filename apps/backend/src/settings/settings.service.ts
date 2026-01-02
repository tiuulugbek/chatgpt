import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let settings = await this.prisma.settings.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          id: 'singleton',
          enabledPlatforms: [
            'INSTAGRAM_COMMENT',
            'INSTAGRAM_DM',
            'FACEBOOK_COMMENT',
            'FACEBOOK_MESSAGE',
            'TELEGRAM',
            'YOUTUBE_COMMENT',
            'EMAIL',
            'PHONE_CALL',
            'INTERNAL_NOTE',
          ],
        },
      });
    }

    return settings;
  }

  async update(data: any) {
    const settings = await this.prisma.settings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: {
        id: 'singleton',
        ...data,
        enabledPlatforms: data.enabledPlatforms || [
          'INSTAGRAM_COMMENT',
          'INSTAGRAM_DM',
          'FACEBOOK_COMMENT',
          'FACEBOOK_MESSAGE',
          'TELEGRAM',
          'YOUTUBE_COMMENT',
          'EMAIL',
          'PHONE_CALL',
          'INTERNAL_NOTE',
        ],
      },
    });

    return settings;
  }
}

