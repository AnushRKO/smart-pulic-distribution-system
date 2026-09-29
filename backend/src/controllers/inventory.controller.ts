import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { createAuditLog } from '../services/audit.service';
import { sendNotification, sendBulkNotifications } from '../services/notification.service';

type InventoryStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

const calcStatus = (available: number, threshold: number): InventoryStatus => {
  if (available <= 0) return 'OUT_OF_STOCK';
  if (available <= threshold) return 'LOW_STOCK';
  return 'AVAILABLE';
};

export const getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page        = parseInt(req.query.page  as string) || 1;
    const limit       = parseInt(req.query.limit as string) || 20;
    const shopId      = req.query.shopId      as string;
    const commodityId = req.query.commodityId as string;
    const status      = req.query.status      as string;
    const skip        = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (shopId)      where.shopId      = shopId;
    if (commodityId) where.commodityId = commodityId;
    if (status)      where.status      = status;

    if (req.user?.role === 'DISTRIBUTOR') {
      const dist = await prisma.distributor.findUnique({ where: { userId: req.user.userId }, include: { shops: { select: { id: true } } } });
      if (dist?.shops.length) where.shopId = { in: dist.shops.map((s) => s.id) };
    }

    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where, skip, take: limit, orderBy: { updatedAt: 'desc' },
        include: {
          shop:      { select: { id:true, name:true, shopId:true, district:true } },
          commodity: { select: { id:true, name:true, commodityCode:true, unit:true } },
        },
      }),
      prisma.inventory.count({ where }),
    ]);
    sendPaginated(res, items, total, page, limit);
  } catch { sendError(res, 'Failed to fetch inventory', 500); }
};

export const getInventorySummary = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [total, low, out, available, agg] = await Promise.all([
      prisma.inventory.count(),
      prisma.inventory.count({ where: { status: 'LOW_STOCK' } }),
      prisma.inventory.count({ where: { status: 'OUT_OF_STOCK' } }),
      prisma.inventory.count({ where: { status: 'AVAILABLE' } }),
      prisma.inventory.aggregate({ _sum: { availableStock: true } }),
    ]);
    sendSuccess(res, { total, available, lowStock: low, outOfStock: out, totalAvailableStock: agg._sum.availableStock || 0 });
  } catch { sendError(res, 'Failed to fetch inventory summary', 500); }
};

export const addStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shopId, commodityId, quantity, notes } = req.body;
    const qty = parseFloat(quantity);
    if (!shopId || !commodityId || qty <= 0) { sendError(res, 'shopId, commodityId and quantity > 0 are required.', 400); return; }

    let inventory = await prisma.inventory.findUnique({ where: { shopId_commodityId: { shopId, commodityId } } });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: { shopId, commodityId, openingStock: qty, receivedStock: qty, availableStock: qty, status: 'AVAILABLE' },
      });
    } else {
      const newAvailable = inventory.availableStock + qty;
      inventory = await prisma.inventory.update({
        where: { id: inventory.id },
        data: { receivedStock: inventory.receivedStock + qty, availableStock: newAvailable, status: calcStatus(newAvailable, inventory.threshold), lastUpdatedAt: new Date() },
      });
    }

    await prisma.inventoryTransaction.create({
      data: { inventoryId: inventory.id, type: 'RECEIVE', quantity: qty, previousStock: inventory.availableStock - qty, newStock: inventory.availableStock, notes, createdById: req.user?.userId },
    });
    await createAuditLog({ performedById: req.user?.userId, action: 'STOCK_ADDED', entity: 'Inventory', entityId: inventory.id, description: `Stock added: ${qty} units` });

    if (inventory.status === 'AVAILABLE') {
      const shop = await prisma.shop.findUnique({ where: { id: shopId }, include: { rationCards: { select: { beneficiary: { select: { userId: true } } } } } });
      const commodity = await prisma.commodity.findUnique({ where: { id: commodityId } });
      if (shop && commodity) {
        const userIds = shop.rationCards.map((rc: any) => rc.beneficiary?.userId).filter(Boolean) as string[];
        if (userIds.length > 0) {
          await sendBulkNotifications(userIds.slice(0, 50), 'STOCK_AVAILABLE', 'Stock Available', `${commodity.name} is now available at ${shop.name}.`);
        }
      }
    }
    sendSuccess(res, inventory, 'Stock added successfully');
  } catch (err) { console.error(err); sendError(res, 'Failed to add stock', 500); }
};

export const getInventoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await prisma.inventory.findUnique({
      where: { id: req.params.id },
      include: { shop: true, commodity: true, transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!item) { sendError(res, 'Inventory record not found', 404); return; }
    sendSuccess(res, item);
  } catch { sendError(res, 'Failed to fetch inventory item', 500); }
};

export const updateInventoryThreshold = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inv = await prisma.inventory.findUnique({ where: { id: req.params.id } });
    if (!inv) { sendError(res, 'Inventory not found', 404); return; }
    const threshold = parseFloat(req.body.threshold);
    const updated = await prisma.inventory.update({
      where: { id: req.params.id },
      data: { threshold, status: calcStatus(inv.availableStock, threshold) },
    });
    sendSuccess(res, updated, 'Threshold updated');
  } catch { sendError(res, 'Failed to update threshold', 500); }
};
