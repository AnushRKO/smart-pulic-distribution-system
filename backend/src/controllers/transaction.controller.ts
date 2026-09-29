import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const shopId = req.query.shopId as string;
    const commodityId = req.query.commodityId as string;
    const status = req.query.status as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { beneficiary: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
        { beneficiary: { user: { lastName: { contains: search, mode: 'insensitive' } } } },
      ];
    }
    if (shopId) where.shopId = shopId;
    if (commodityId) where.commodityId = commodityId;
    if (status) where.status = status;
    if (month) where.month = month;
    if (year) where.year = year;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo + 'T23:59:59') }),
      };
    }

    // Role-based scoping
    if (req.user?.role === 'BENEFICIARY') {
      const ben = await prisma.beneficiary.findUnique({ where: { userId: req.user.userId } });
      if (ben) where.beneficiaryId = ben.id;
    }
    if (req.user?.role === 'DISTRIBUTOR') {
      const dist = await prisma.distributor.findUnique({
        where: { userId: req.user.userId },
        include: { shops: { select: { id: true } } },
      });
      if (dist) where.shopId = { in: dist.shops.map((s) => s.id) };
    }

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          beneficiary: { include: { user: { select: { firstName: true, lastName: true } } } },
          rationCard: { select: { cardNumber: true, cardType: true } },
          shop: { select: { name: true, shopId: true } },
          commodity: { select: { name: true, unit: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);
    sendPaginated(res, items, total, page, limit);
  } catch (err) {
    sendError(res, 'Failed to fetch transactions', 500);
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const txn = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        beneficiary: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } },
        rationCard: { include: { familyMembers: true } },
        shop: { include: { distributor: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        commodity: true,
        distribution: true,
      },
    });
    if (!txn) { sendError(res, 'Transaction not found', 404); return; }
    sendSuccess(res, txn);
  } catch (err) {
    sendError(res, 'Failed to fetch transaction', 500);
  }
};

export const getTransactionStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const today = new Date(now.toDateString());

    const [total, todayCount, monthly, byStatus] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.count({ where: { month, year } }),
      prisma.transaction.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    sendSuccess(res, { total, today: todayCount, monthly, byStatus });
  } catch (err) {
    sendError(res, 'Failed to fetch stats', 500);
  }
};
