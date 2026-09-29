import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getStockReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shopId = req.query.shopId as string;
    const commodityId = req.query.commodityId as string;

    const where: Record<string, unknown> = {};
    if (shopId) where.shopId = shopId;
    if (commodityId) where.commodityId = commodityId;

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        shop: { select: { name: true, shopId: true, district: true } },
        commodity: { select: { name: true, commodityCode: true, unit: true } },
      },
      orderBy: { availableStock: 'asc' },
    });

    const summary = {
      totalItems: inventory.length,
      totalAvailable: inventory.reduce((s, i) => s + i.availableStock, 0),
      totalDistributed: inventory.reduce((s, i) => s + i.distributedStock, 0),
      lowStock: inventory.filter((i) => i.status === 'LOW_STOCK').length,
      outOfStock: inventory.filter((i) => i.status === 'OUT_OF_STOCK').length,
    };

    sendSuccess(res, { inventory, summary });
  } catch (err) {
    sendError(res, 'Failed to generate stock report', 500);
  }
};

export const getBeneficiaryReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const district = req.query.district as string;
    const where: Record<string, unknown> = {};
    if (district) where.district = district;

    const [total, active, byDistrict, byCardType] = await Promise.all([
      prisma.beneficiary.count({ where }),
      prisma.beneficiary.count({ where: { ...where, isActive: true } }),
      prisma.beneficiary.groupBy({ by: ['district'], _count: { id: true }, where }),
      prisma.rationCard.groupBy({ by: ['cardType'], _count: { id: true } }),
    ]);

    sendSuccess(res, { total, active, inactive: total - active, byDistrict, byCardType });
  } catch (err) {
    sendError(res, 'Failed to generate beneficiary report', 500);
  }
};

export const getDistributionReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const shopId = req.query.shopId as string;

    const where: Record<string, unknown> = {};
    if (shopId) where.shopId = shopId;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo + 'T23:59:59') }),
      };
    }

    const [byCommodity, byShop, total] = await Promise.all([
      prisma.distribution.groupBy({
        by: ['commodityId'],
        _count: { id: true },
        _sum: { quantity: true },
        where,
      }),
      prisma.distribution.groupBy({
        by: ['shopId'],
        _count: { id: true },
        _sum: { quantity: true },
        where,
      }),
      prisma.distribution.count({ where }),
    ]);

    // Enrich with names
    const commodities = await prisma.commodity.findMany({ select: { id: true, name: true, unit: true } });
    const shops = await prisma.shop.findMany({ select: { id: true, name: true, shopId: true } });

    const enrichedByCommodity = byCommodity.map((b) => ({
      ...b,
      commodityName: commodities.find((c) => c.id === b.commodityId)?.name || b.commodityId,
      unit: commodities.find((c) => c.id === b.commodityId)?.unit || '',
    }));

    const enrichedByShop = byShop.map((b) => ({
      ...b,
      shopName: shops.find((s) => s.id === b.shopId)?.name || b.shopId,
    }));

    sendSuccess(res, { total, byCommodity: enrichedByCommodity, byShop: enrichedByShop });
  } catch (err) {
    sendError(res, 'Failed to generate distribution report', 500);
  }
};

export const getTransactionReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const period = req.query.period as string; // daily, monthly

    const where: Record<string, unknown> = {};
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo + 'T23:59:59') }),
      };
    }

    const [total, byStatus, byMonth] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.groupBy({ by: ['status'], _count: { id: true }, where }),
      prisma.transaction.groupBy({
        by: ['month', 'year'],
        _count: { id: true },
        _sum: { quantity: true, totalAmount: true },
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      }),
    ]);

    const totalAmount = await prisma.transaction.aggregate({ _sum: { totalAmount: true }, where });

    sendSuccess(res, {
      total,
      totalAmount: totalAmount._sum.totalAmount || 0,
      byStatus,
      byMonth,
    });
  } catch (err) {
    sendError(res, 'Failed to generate transaction report', 500);
  }
};

export const getAnalyticsDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const year = now.getFullYear();

    // Monthly distribution trend for current year
    const monthlyTrend = await prisma.transaction.groupBy({
      by: ['month', 'year'],
      _count: { id: true },
      _sum: { quantity: true },
      where: { year },
      orderBy: { month: 'asc' },
    });

    // Commodity breakdown
    const commodityDist = await prisma.transaction.groupBy({
      by: ['commodityId'],
      _sum: { quantity: true },
      _count: { id: true },
    });
    const commodities = await prisma.commodity.findMany({ select: { id: true, name: true, unit: true } });
    const enrichedCommodity = commodityDist.map((c) => ({
      ...c,
      name: commodities.find((cm) => cm.id === c.commodityId)?.name || 'Unknown',
      unit: commodities.find((cm) => cm.id === c.commodityId)?.unit || '',
    }));

    // Shop-wise distribution (top 10)
    const shopDist = await prisma.transaction.groupBy({
      by: ['shopId'],
      _count: { id: true },
      _sum: { quantity: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
    const shops = await prisma.shop.findMany({ select: { id: true, name: true } });
    const enrichedShop = shopDist.map((s) => ({
      ...s,
      shopName: shops.find((sh) => sh.id === s.shopId)?.name || 'Unknown',
    }));

    // Inventory status breakdown
    const inventoryStatus = await prisma.inventory.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Beneficiary growth (by creation month)
    const beneficiaryGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: { role: 'BENEFICIARY' },
      _count: { id: true },
    });

    // Summary counts
    const [totalBeneficiaries, totalShops, totalTransactions, todayTxn] = await Promise.all([
      prisma.beneficiary.count(),
      prisma.shop.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { createdAt: { gte: new Date(now.toDateString()) } } }),
    ]);

    sendSuccess(res, {
      summary: { totalBeneficiaries, totalShops, totalTransactions, todayTxn },
      monthlyTrend,
      commodityDistribution: enrichedCommodity,
      shopDistribution: enrichedShop,
      inventoryStatus,
      beneficiaryGrowth: beneficiaryGrowth.length,
    });
  } catch (err) {
    sendError(res, 'Failed to fetch analytics', 500);
  }
};

export const getAdminDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const today = new Date(now.toDateString());

    const [users, beneficiaries, distributors, activeShops, todayTxn, totalTxn, inventorySummary, recentAudit] = await Promise.all([
      prisma.user.count(),
      prisma.beneficiary.count(),
      prisma.distributor.count(),
      prisma.shop.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.count(),
      prisma.inventory.aggregate({ _sum: { availableStock: true } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { performedBy: { select: { firstName: true, lastName: true, role: true } } } }),
    ]);

    const lowStockAlerts = await prisma.inventory.findMany({
      where: { status: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] } },
      include: {
        shop: { select: { name: true } },
        commodity: { select: { name: true, unit: true } },
      },
      take: 10,
    });

    sendSuccess(res, {
      summary: {
        users,
        beneficiaries,
        distributors,
        activeShops,
        todayTxn,
        totalTxn,
        totalInventory: inventorySummary._sum.availableStock || 0,
      },
      lowStockAlerts,
      recentAudit,
    });
  } catch (err) {
    sendError(res, 'Failed to fetch admin dashboard', 500);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const action = req.query.action as string;
    const entity = req.query.entity as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo + 'T23:59:59') }),
      };
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          performedBy: { select: { firstName: true, lastName: true, role: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    sendSuccess(res, { data: items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    sendError(res, 'Failed to fetch audit logs', 500);
  }
};
