import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { createAuditLog } from '../services/audit.service';
import { generateShopId } from '../utils/idGenerator';

export const getShops = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const district = req.query.district as string;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shopId: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (district) where.district = district;

    // Distributor sees only their shops
    if (req.user?.role === 'DISTRIBUTOR') {
      const dist = await prisma.distributor.findUnique({ where: { userId: req.user.userId } });
      if (dist) where.distributorId = dist.id;
    }

    const [items, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          distributor: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
          _count: { select: { rationCards: true, distributions: true } },
        },
      }),
      prisma.shop.count({ where }),
    ]);
    sendPaginated(res, items, total, page, limit);
  } catch (err) {
    sendError(res, 'Failed to fetch shops', 500);
  }
};

export const getShopById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: req.params.id },
      include: {
        distributor: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } },
        inventory: { include: { commodity: true } },
        _count: { select: { rationCards: true } },
      },
    });
    if (!shop) { sendError(res, 'Shop not found', 404); return; }
    sendSuccess(res, shop);
  } catch (err) {
    sendError(res, 'Failed to fetch shop', 500);
  }
};

export const createShop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, address, area, district, state, phone, distributorId } = req.body;
    const count = await prisma.shop.count();

    const shop = await prisma.shop.create({
      data: {
        shopId: generateShopId(count + 1),
        name, address, area, district, state, phone,
        ...(distributorId && { distributorId }),
      },
    });

    await createAuditLog({
      performedById: req.user?.userId,
      action: 'SHOP_CREATED',
      entity: 'Shop',
      entityId: shop.id,
      description: `Shop created: ${name}`,
    });

    sendSuccess(res, shop, 'Shop created successfully', 201);
  } catch (err) {
    sendError(res, 'Failed to create shop', 500);
  }
};

export const updateShop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, address, area, district, state, phone, distributorId, status } = req.body;
    const shop = await prisma.shop.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(area && { area }),
        ...(district && { district }),
        ...(state && { state }),
        ...(phone && { phone }),
        ...(distributorId !== undefined && { distributorId }),
        ...(status && { status }),
      },
    });

    await createAuditLog({
      performedById: req.user?.userId,
      action: 'SHOP_UPDATED',
      entity: 'Shop',
      entityId: shop.id,
      description: `Shop updated: ${shop.name}`,
    });

    sendSuccess(res, shop, 'Shop updated');
  } catch (err) {
    sendError(res, 'Failed to update shop', 500);
  }
};
