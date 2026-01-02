import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    const searchTerm = query.toLowerCase().trim();

    const [leads, contacts, deals] = await Promise.all([
      this.prisma.lead.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { contact: { fullName: { contains: searchTerm, mode: 'insensitive' } } },
            { contact: { phone: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        },
        take: 5,
        include: {
          contact: true,
        },
      }),
      this.prisma.contact.findMany({
        where: {
          OR: [
            { fullName: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      this.prisma.deal.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { contact: { fullName: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        },
        take: 5,
        include: {
          contact: true,
        },
      }),
    ]);

    return {
      leads,
      contacts,
      deals,
    };
  }
}

