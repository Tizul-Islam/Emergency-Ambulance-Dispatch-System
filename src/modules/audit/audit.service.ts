
import prisma from '../../utils/prisma';

export const logAudit = async (
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  oldValue: any = null,
  newValue: any = null,
  ipAddress?: string,
) => {
  return await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      ipAddress,
    },
  });
};
