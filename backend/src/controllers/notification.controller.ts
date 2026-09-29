import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Not authenticated', 401); return; }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: req.user.userId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);
    sendPaginated(res, items, total, page, limit);
  } catch (err) {
    sendError(res, 'Failed to fetch notifications', 500);
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Not authenticated', 401); return; }
    const count = await prisma.notification.count({ where: { userId: req.user.userId, status: 'UNREAD' } });
    sendSuccess(res, { count });
  } catch (err) {
    sendError(res, 'Failed to fetch count', 500);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Not authenticated', 401); return; }
    const notif = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notif || notif.userId !== req.user.userId) { sendError(res, 'Notification not found', 404); return; }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { status: 'READ' },
    });
    sendSuccess(res, updated, 'Marked as read');
  } catch (err) {
    sendError(res, 'Failed to update notification', 500);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Not authenticated', 401); return; }
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, status: 'UNREAD' },
      data: { status: 'READ' },
    });
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    sendError(res, 'Failed to update notifications', 500);
  }
};
