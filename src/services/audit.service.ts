import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logAudit = async (
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  oldValue: any = null,
  newValue: any = null,
) => {
  return await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
    },
  });
};
