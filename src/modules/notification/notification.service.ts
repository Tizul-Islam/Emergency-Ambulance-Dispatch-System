import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/AppError';

const prisma = new PrismaClient();

export const createNotification = async (
  userId: string,
  title: string,
  type: string,
  message: string,
) => {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      type,
      message,
    },
  });
};

export const getMyNotifications = async (userId: string, page: number, limit: number) => {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return {
    data: notifications,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const markAsRead = async (id: string, userId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id },
  });

  if (!notification) throw new AppError(404, 'Notification not found');
  if (notification.userId !== userId) throw new AppError(403, 'Permission denied');

  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};
