import {
  PrismaClient,
  Role,
  TripStatus,
  AmbulanceStatus,
  RequestStatus,
  RequestPriority,
} from '@prisma/client';
import { AppError } from '../../utils/AppError';
import { logAudit } from '../audit/audit.service';

const prisma = new PrismaClient();

export const getUsers = async (role: Role | undefined, page: number, limit: number) => {
  const where: { deletedAt: null; role?: Role } = { deletedAt: null };
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const searchUsers = async (filters: { q: string; page: number; limit: number }) => {
  const { q, page, limit } = filters;
  const where = {
    deletedAt: null,
    OR: [
      { name: { contains: q, mode: 'insensitive' as any } },
      { email: { contains: q, mode: 'insensitive' as any } },
      { phone: { contains: q, mode: 'insensitive' as any } },
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const changeUserRole = async (userId: string, newRole: Role, actorId: string) => {
  const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
  if (!user) throw new AppError(404, 'User not found');

  if (user.role === newRole) return user;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  await logAudit(actorId, 'CHANGE_ROLE', 'User', userId, user.role, newRole);

  return updatedUser;
};

export const getDashboardStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const activeTripsCount = await prisma.trip.count({
    where: { status: TripStatus.ONGOING },
  });

  const completedTripsTodayCount = await prisma.trip.count({
    where: {
      status: TripStatus.COMPLETED,
      createdAt: { gte: todayStart },
    },
  });

  const totalAmbulances = await prisma.ambulance.count({ where: { deletedAt: null } });
  const inUseAmbulances = await prisma.ambulance.count({
    where: {
      deletedAt: null,
      status: { not: AmbulanceStatus.AVAILABLE },
    },
  });
  const ambulanceUtilization =
    totalAmbulances === 0 ? 0 : (inUseAmbulances / totalAmbulances) * 100;

  const requestsByPriority = await prisma.emergencyRequest.groupBy({
    by: ['priority'],
    _count: { priority: true },
    where: { deletedAt: null },
  });
  const priorityBreakdown = requestsByPriority.map((item) => ({
    priority: item.priority,
    count: item._count.priority,
  }));

  const dispatches = await prisma.dispatch.findMany({
    select: {
      assignedAt: true,
      emergencyRequest: { select: { createdAt: true } },
    },
    take: 1000,
    orderBy: { assignedAt: 'desc' },
  });

  let totalDiff = 0;
  let diffCount = 0;
  for (const d of dispatches) {
    if (d.assignedAt && d.emergencyRequest?.createdAt) {
      const diffMs = d.assignedAt.getTime() - d.emergencyRequest.createdAt.getTime();
      if (diffMs >= 0) {
        totalDiff += diffMs;
        diffCount++;
      }
    }
  }
  const avgResponseTimeMin = diffCount === 0 ? 0 : totalDiff / diffCount / 60000;

  return {
    activeTripsCount,
    completedTripsTodayCount,
    ambulanceUtilization: parseFloat(ambulanceUtilization.toFixed(2)),
    priorityBreakdown,
    avgResponseTimeMin: parseFloat(avgResponseTimeMin.toFixed(2)),
  };
};

export const getAuditLogs = async (entity: string | undefined, page: number, limit: number) => {
  const where: { entity?: string } = {};
  if (entity) where.entity = entity;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data: logs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const getIncidentHistory = async (
  dateFrom: string,
  dateTo: string,
  priority: RequestPriority | undefined,
  page: number,
  limit: number,
) => {
  const where: Record<string, unknown> = {
    status: { in: [RequestStatus.COMPLETED, RequestStatus.CANCELLED] },
    deletedAt: null,
  };

  if (priority) where.priority = priority;

  if (dateFrom || dateTo) {
    const createdAt: { gte?: Date; lte?: Date } = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo);
    where.createdAt = createdAt;
  }

  const [incidents, total] = await Promise.all([
    prisma.emergencyRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { name: true, phone: true } },
        dispatches: {
          take: 1,
          orderBy: { assignedAt: 'desc' },
          include: { ambulance: true, driver: true, trips: true },
        },
      },
    }),
    prisma.emergencyRequest.count({ where }),
  ]);

  return { data: incidents, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
