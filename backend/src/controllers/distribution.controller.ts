import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { createAuditLog } from '../services/audit.service';
import { sendNotification } from '../services/notification.service';
import { generateTransactionId, generateDistributionId } from '../utils/idGenerator';

export const createDistribution = async (req: AuthRequest, res: Response): Promise<void> => {
  const { rationCardNumber, commodityId, quantity, shopId, notes } = req.body;
  const qty = parseFloat(quantity);

  if (!rationCardNumber || !commodityId || !shopId || !(qty > 0)) {
    sendError(res, 'rationCardNumber, commodityId, shopId and quantity > 0 are required.', 400);
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify ration card
      const rationCard = await tx.rationCard.findUnique({
        where: { cardNumber: rationCardNumber },
        include: {
          beneficiary: { include: { user: true } },
          entitlements: true,
          assignedShop: true,
        },
      });
      if (!rationCard)                   throw new Error('RATION_CARD_NOT_FOUND');
      if (rationCard.status !== 'ACTIVE') throw new Error('RATION_CARD_INACTIVE');
      if (!rationCard.beneficiary.isActive) throw new Error('BENEFICIARY_INACTIVE');

      // 2. Entitlement check
      const ent = rationCard.entitlements.find((e: any) => e.commodityId === commodityId && e.isActive);
      if (!ent) throw new Error('NO_ENTITLEMENT');
      const remaining = ent.monthlyQuota - ent.collectedThisMonth;
      if (qty > remaining) throw new Error(`EXCEEDS_ENTITLEMENT:${remaining}`);

      // 3. Inventory check (atomic)
      const inv = await tx.inventory.findUnique({ where: { shopId_commodityId: { shopId, commodityId } } });
      if (!inv) throw new Error('NO_INVENTORY');
      if (inv.availableStock < qty) throw new Error(`INSUFFICIENT_STOCK:${inv.availableStock}`);

      // 4. Deduct inventory
      const newAvailable = inv.availableStock - qty;
      const newStatus    = newAvailable <= 0 ? 'OUT_OF_STOCK' : newAvailable <= inv.threshold ? 'LOW_STOCK' : 'AVAILABLE';
      await tx.inventory.update({
        where: { id: inv.id },
        data: { distributedStock: inv.distributedStock + qty, availableStock: newAvailable, status: newStatus, lastUpdatedAt: new Date() },
      });
      await tx.inventoryTransaction.create({
        data: { inventoryId: inv.id, type: 'DISTRIBUTE', quantity: qty, previousStock: inv.availableStock, newStock: newAvailable, notes, createdById: req.user?.userId },
      });

      // 5. Update entitlement
      await tx.entitlement.update({ where: { id: ent.id }, data: { collectedThisMonth: ent.collectedThisMonth + qty } });

      // 6. Commodity info
      const commodity = await tx.commodity.findUnique({ where: { id: commodityId } });
      if (!commodity) throw new Error('COMMODITY_NOT_FOUND');

      // 7. Distribution record
      const distribution = await tx.distribution.create({
        data: { distributionId: generateDistributionId(), beneficiaryId: rationCard.beneficiary.id, shopId, commodityId, quantity: qty, distributedById: req.user?.userId, notes },
      });

      // 8. Transaction record
      const transaction = await tx.transaction.create({
        data: {
          transactionId: generateTransactionId(),
          beneficiaryId: rationCard.beneficiary.id,
          rationCardId:  rationCard.id,
          shopId, commodityId,
          distributionId: distribution.id,
          quantity: qty,
          unitPrice:   commodity.subsidizedRate,
          totalAmount: qty * commodity.subsidizedRate,
          status: 'COMPLETED',
          month: new Date().getMonth() + 1,
          year:  new Date().getFullYear(),
          notes,
        },
      });

      return { distribution, transaction, beneficiary: rationCard.beneficiary, commodity, newAvailable, newStatus, shopId };
    });

    // 9. Audit + notifications (outside tx)
    await createAuditLog({ performedById: req.user?.userId, action: 'DISTRIBUTION_CREATED', entity: 'Distribution', entityId: result.distribution.id, description: `Distribution: ${result.transaction.transactionId}` });

    await sendNotification({
      userId:  result.beneficiary.userId,
      type:    'DISTRIBUTION_COMPLETED',
      title:   'Distribution Completed',
      message: `Transaction ${result.transaction.transactionId} — ${qty} ${result.commodity.unit} of ${result.commodity.name} collected.`,
    });

    if (result.newStatus === 'LOW_STOCK' || result.newStatus === 'OUT_OF_STOCK') {
      const shop = await prisma.shop.findUnique({ where: { id: result.shopId }, include: { distributor: { include: { user: true } } } });
      if (shop?.distributor?.user) {
        await sendNotification({
          userId:  shop.distributor.user.id,
          type:    result.newStatus,
          title:   result.newStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock Alert',
          message: `${result.commodity.name} at ${shop.name}: ${result.newAvailable} ${result.commodity.unit} remaining.`,
        });
      }
    }

    sendSuccess(res, { distribution: result.distribution, transaction: result.transaction }, 'Distribution completed successfully', 201);
  } catch (err: any) {
    const msg: string = err.message || '';
    if (msg === 'RATION_CARD_NOT_FOUND')   { sendError(res, 'Ration card not found.', 404); return; }
    if (msg === 'RATION_CARD_INACTIVE')    { sendError(res, 'This ration card is inactive.', 400); return; }
    if (msg === 'BENEFICIARY_INACTIVE')    { sendError(res, 'This beneficiary account is inactive.', 400); return; }
    if (msg === 'NO_ENTITLEMENT')          { sendError(res, 'No active entitlement for this commodity.', 400); return; }
    if (msg === 'NO_INVENTORY')            { sendError(res, 'No inventory record found for this commodity at this shop.', 400); return; }
    if (msg === 'COMMODITY_NOT_FOUND')     { sendError(res, 'Commodity not found.', 400); return; }
    if (msg.startsWith('EXCEEDS_ENTITLEMENT')) {
      const rem = msg.split(':')[1];
      sendError(res, `Quantity exceeds entitlement. Remaining: ${rem} units.`, 400); return;
    }
    if (msg.startsWith('INSUFFICIENT_STOCK')) {
      const avail = msg.split(':')[1];
      sendError(res, `Insufficient stock. Available: ${avail} units.`, 400); return;
    }
    console.error('Distribution error:', err);
    sendError(res, 'Distribution failed. Please try again.', 500);
  }
};

export const getDistributions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page    = parseInt(req.query.page  as string) || 1;
    const limit   = parseInt(req.query.limit as string) || 20;
    const shopId  = req.query.shopId        as string;
    const benId   = req.query.beneficiaryId as string;
    const dateFrom = req.query.dateFrom     as string;
    const dateTo   = req.query.dateTo       as string;
    const skip    = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (shopId) where.shopId = shopId;
    if (benId)  where.beneficiaryId = benId;
    if (dateFrom || dateTo) {
      where.createdAt = { ...(dateFrom && { gte: new Date(dateFrom) }), ...(dateTo && { lte: new Date(dateTo + 'T23:59:59') }) };
    }
    if (req.user?.role === 'DISTRIBUTOR') {
      const dist = await prisma.distributor.findUnique({ where: { userId: req.user.userId }, include: { shops: { select: { id: true } } } });
      if (dist) where.shopId = { in: dist.shops.map((s: any) => s.id) };
    }
    if (req.user?.role === 'BENEFICIARY') {
      const ben = await prisma.beneficiary.findUnique({ where: { userId: req.user.userId } });
      if (ben) where.beneficiaryId = ben.id;
    }

    const [items, total] = await Promise.all([
      prisma.distribution.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          beneficiary: { include: { user: { select: { firstName:true, lastName:true } } } },
          shop:        { select: { name:true, shopId:true } },
          commodity:   { select: { name:true, unit:true } },
          transaction: { select: { transactionId:true, status:true, totalAmount:true } },
        },
      }),
      prisma.distribution.count({ where }),
    ]);
    sendPaginated(res, items, total, page, limit);
  } catch { sendError(res, 'Failed to fetch distributions', 500); }
};

export const getDistributionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await prisma.distribution.findUnique({
      where: { id: req.params.id },
      include: {
        beneficiary: { include: { user: { select: { firstName:true, lastName:true, phone:true } }, rationCard: true } },
        shop: true, commodity: true, transaction: true,
      },
    });
    if (!item) { sendError(res, 'Distribution not found', 404); return; }
    sendSuccess(res, item);
  } catch { sendError(res, 'Failed to fetch distribution', 500); }
};
