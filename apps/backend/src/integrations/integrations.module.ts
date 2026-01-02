import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { TelegramWebhookController } from './telegram-webhook.controller';
import { IntegrationsService } from './integrations.service';
import { SettingsModule } from '../settings/settings.module';
import { PrismaModule } from '../common/prisma.module';
import { InstagramService } from './services/instagram.service';
import { FacebookService } from './services/facebook.service';
import { TelegramIntegrationService } from './services/telegram.service';
import { YouTubeService } from './services/youtube.service';
import { GoogleMapsService } from './services/google-maps.service';
import { YandexMapsService } from './services/yandex-maps.service';

@Module({
  imports: [SettingsModule, PrismaModule],
  controllers: [IntegrationsController, TelegramWebhookController],
  providers: [
    IntegrationsService,
    InstagramService,
    FacebookService,
    TelegramIntegrationService,
    YouTubeService,
    GoogleMapsService,
    YandexMapsService,
  ],
  exports: [IntegrationsService, TelegramIntegrationService],
})
export class IntegrationsModule {}



