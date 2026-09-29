import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { createAuditLog } from '../services/audit.service';

export const getCommodities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { commodityCode: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.commodity.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.commodity.count({ where }),
    ]);
    sendPaginated(res, items, total, page, limit);
  } catch (err) {
    sendError(res, 'Failed to fetch commodities', 500);
  }
};

export const getCommodityById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await prisma.commodity.findUnique({ where: { id: req.params.id } });
    if (!item) { sendError(res, 'Commodity not found', 404); return; }
    sendSuccess(res, item);
  } catch (err) {
    sendError(res, 'Failed to fetch commodity', 500);
  }
};

export const createCommodity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commodityCode, name, unit, description, subsidizedRate, marketRate } = req.body;
    const commodity = await prisma.commodity.create({
      data: { commodityCode, name, unit, description, subsidizedRate: parseFloat(subsidizedRate), marketRate: marketRate ? parseFloat(marketRate) : null },
    });

    await createAuditLog({
      performedById: req.user?.userId,
      action: 'COMMODITY_CREATED',
      entity: 'Commodity',
      entityId: commodity.id,
      description: `Commodity created: ${name} (${commodityCode})`,
    });

    sendSuccess(res, commodity, 'Commodity created successfully', 201);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2002') { sendError(res, 'Commodity code already exists', 409); return; }
    sendError(res, 'Failed to create commodity', 500);
  }
};

export const updateCommodity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, unit, description, subsidizedRate, marketRate, status } = req.body;
    const commodity = await prisma.commodity.update({
      where: { id: req.params.id },
      data: {
        name, unit, description,
        ...(subsidizedRate !== undefined && { subsidizedRate: parseFloat(subsidizedRate) }),
        ...(marketRate !== undefined && { marketRate: parseFloat(marketRate) }),
        ...(status && { status }),
      },
    });

    await createAuditLog({
      performedById: req.user?.userId,
      action: 'COMMODITY_UPDATED',
      entity: 'Commodity',
      entityId: commodity.id,
      description: `Commodity updated: ${commodity.name}`,
    });

    sendSuccess(res, commodity, 'Commodity updated');
  } catch (err) {
    sendError(res, 'Failed to update commodity', 500);
  }
};
