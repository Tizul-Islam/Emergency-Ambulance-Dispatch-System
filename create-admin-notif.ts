import prisma from './src/utils/prisma';
import { Role } from './src/generated/prisma/client';

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (admin) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        title: 'Test Admin Notification',
        message: 'This is a test notification for the admin.',
        type: 'SYSTEM',
      }
    });
    console.log('Notification created for admin:', admin.id);
  } else {
    console.log('No admin found.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
