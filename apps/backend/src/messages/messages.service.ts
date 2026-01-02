import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageDirection, MessageType } from '@prisma/client';
import { TelegramIntegrationService } from '../integrations/services/telegram.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramIntegrationService,
  ) {}

  async create(createMessageDto: CreateMessageDto, currentUser: any) {
    // Agar Telegram xabari bo'lsa va OUTBOUND bo'lsa, Telegram'ga yuborish
    if (createMessageDto.type === MessageType.TELEGRAM && createMessageDto.direction === MessageDirection.OUTBOUND) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: createMessageDto.contactId! },
      });

      if (!contact) {
        throw new Error('Contact topilmadi');
      }

      // Settings'dan bot token olish
      const settings = await this.prisma.settings.findUnique({
        where: { id: 'singleton' },
      });

      if (!settings?.telegramBotToken) {
        throw new Error('Telegram bot token topilmadi');
      }

      // Contact'ning telefon raqamini chatId sifatida ishlatish
      const chatId = contact.phone || contact.email;
      if (!chatId) {
        throw new Error('Contact telefon raqami yoki email topilmadi');
      }

      // Telegram'ga xabar yuborish va saqlash
      await this.telegramService.sendMessage(
        settings.telegramBotToken,
        chatId,
        createMessageDto.content,
        contact.branchId || undefined,
        contact.id,
        currentUser.id,
      );

      // Database'ga saqlash (sendMessage ichida ham saqlanadi, lekin bu yerda ham saqlaymiz)
      const message = await this.prisma.message.create({
        data: {
          ...createMessageDto,
          userId: currentUser.id,
          branchId: contact.branchId || undefined,
        },
        include: {
          contact: true,
          user: true,
          lead: true,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'Message',
          entityId: message.id,
          userId: currentUser.id,
          changes: createMessageDto as any,
        },
      });

      return message;
    }

    // Boshqa xabarlar uchun oddiy saqlash
    const message = await this.prisma.message.create({
      data: {
        ...createMessageDto,
        userId: currentUser.id,
      },
      include: {
        contact: true,
        user: true,
        lead: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Message',
        entityId: message.id,
        userId: currentUser.id,
        changes: createMessageDto as any,
      },
    });

    return message;
  }

  async findAll(currentUser: any, filters?: any) {
    let where: any = {};

    // Filial cheklovi
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.branchId) {
      where.contact = {
        branchId: currentUser.branchId,
      };
    }

    if (filters?.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters?.leadId) {
      where.leadId = filters.leadId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.direction) {
      where.direction = filters.direction;
    }

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead === 'true';
    }

    return this.prisma.message.findMany({
      where,
      include: {
        contact: true,
        user: true,
        lead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit || 100,
    });
  }

  async markAsRead(messageId: string, currentUser: any) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}



