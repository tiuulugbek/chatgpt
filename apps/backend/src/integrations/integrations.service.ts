import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  // Bu yerda kelajakda Instagram, Facebook, Telegram va boshqa integratsiyalar qo'shiladi
  async getSettings() {
    return this.prisma.settings.findUnique({
      where: { id: 'singleton' },
    });
  }
}



