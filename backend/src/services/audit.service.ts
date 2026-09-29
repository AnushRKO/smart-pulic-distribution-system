import prisma from '../utils/prisma';

interface AuditLogParams {
  userId?: string;
  performedById?: string;
  action: string;
  entity?: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export const createAuditLog = async (params: AuditLogParams): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        performedById: params.performedById,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        description: params.description,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      },
    });
  } catch (err) {
    console.error('Audit log creation failed:', err);
  }
};
