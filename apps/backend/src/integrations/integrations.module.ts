import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { SettingsModule } from '../settings/settings.module';
import { PrismaModule } from '../common/prisma.module';
import { InstagramService } from './services/instagram.service';
import { FacebookService } from './services/facebook.service';
import { TelegramIntegrationService } from './services/telegram.service';
import { YouTubeService } from './services/youtube.service';

@Module({
  imports: [SettingsModule, PrismaModule],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    InstagramService,
    FacebookService,
    TelegramIntegrationService,
    YouTubeService,
  ],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}



