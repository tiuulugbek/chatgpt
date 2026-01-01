import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Database seed boshlandi...');

  // Filiallar yaratish
  const branch1 = await prisma.branch.upsert({
    where: { code: 'TASH' },
    update: {},
    create: {
      name: 'Toshkent filiali',
      code: 'TASH',
      address: 'Toshkent shahri',
      phone: '+998 71 123 45 67',
      email: 'tashkent@soundz.uz',
      region: 'Toshkent',
      isActive: true,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { code: 'AND' },
    update: {},
    create: {
      name: 'Andijon filiali',
      code: 'AND',
      address: 'Andijon shahri',
      phone: '+998 74 123 45 67',
      email: 'andijon@soundz.uz',
      region: 'Andijon',
      isActive: true,
    },
  });

  console.log('✅ Filiallar yaratildi');

  // Super Admin yaratish
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@soundz.uz' },
    update: {},
    create: {
      email: 'admin@soundz.uz',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  // Filial rahbari yaratish
  const branchManagerPassword = await bcrypt.hash('manager123', 10);
  const branchManager = await prisma.user.upsert({
    where: { email: 'manager@soundz.uz' },
    update: {},
    create: {
      email: 'manager@soundz.uz',
      password: branchManagerPassword,
      firstName: 'Filial',
      lastName: 'Rahbari',
      role: UserRole.BRANCH_MANAGER,
      branchId: branch1.id,
      isActive: true,
    },
  });

  // Filial xodimi yaratish
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@soundz.uz' },
    update: {},
    create: {
      email: 'staff@soundz.uz',
      password: staffPassword,
      firstName: 'Filial',
      lastName: 'Xodimi',
      role: UserRole.BRANCH_STAFF,
      branchId: branch1.id,
      isActive: true,
    },
  });

  console.log('✅ Foydalanuvchilar yaratildi');
  console.log('📧 Super Admin: admin@soundz.uz / admin123');
  console.log('📧 Filial Rahbari: manager@soundz.uz / manager123');
  console.log('📧 Filial Xodimi: staff@soundz.uz / staff123');

  // Sozlamalar yaratish
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      autoAssignEnabled: false,
      notificationEnabled: true,
    },
  });

  console.log('✅ Sozlamalar yaratildi');
  console.log('🎉 Seed yakunlandi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


