import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { createAuditLog } from '../services/audit.service';
import { generateBeneficiaryId, generateRationCardNumber } from '../utils/idGenerator';

export const getBeneficiaries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const district = req.query.district as string;
    const isActive = req.query.isActive as string;
    const skip = (page - 1) * limit;

    // Beneficiary can only see their own record
    if (req.user?.role === 'BENEFICIARY') {
      const ben = await prisma.beneficiary.findUnique({
        where: { userId: req.user.userId },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          rationCard: { include: { familyMembers: true, assignedShop: true, entitlements: { include: { commodity: true } } } },
        },
      });
      sendSuccess(res, ben ? [ben] : []);
      return;
    }

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { beneficiaryId: { contains: search, mode: 'insensitive' } },
        { rationCard: { cardNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (district) where.district = district;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [items, total] = await Promise.all([
      prisma.beneficiary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          rationCard: { select: { cardNumber: true, cardType: true, status: true } },
        },
      }),
      prisma.beneficiary.count({ where }),
    ]);

    sendPaginated(res, items, total, page, limit);
  } catch (err) {
    sendError(res, 'Failed to fetch beneficiaries', 500);
  }
};

export const getBeneficiaryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ben = await prisma.beneficiary.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true } },
        rationCard: {
          include: {
            familyMembers: true,
            assignedShop: { select: { id: true, name: true, shopId: true, address: true } },
            entitlements: { include: { commodity: true } },
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { commodity: true, shop: { select: { name: true } } },
        },
      },
    });
    if (!ben) { sendError(res, 'Beneficiary not found', 404); return; }

    // Beneficiaries can only access their own data
    if (req.user?.role === 'BENEFICIARY' && ben.userId !== req.user.userId) {
      sendError(res, 'Access denied', 403); return;
    }

    sendSuccess(res, ben);
  } catch (err) {
    sendError(res, 'Failed to fetch beneficiary', 500);
  }
};

export const createBeneficiary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      email, password, firstName, lastName, phone,
      dateOfBirth, gender, address, district, state, pincode, aadharNumber,
      rationCardType, assignedShopId,
    } = req.body;

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password || 'Beneficiary@1234', 12);

    const count = await prisma.beneficiary.count();
    const rcCount = await prisma.rationCard.count();

    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone, role: 'BENEFICIARY' },
    });

    const beneficiary = await prisma.beneficiary.create({
      data: {
        userId: user.id,
        beneficiaryId: generateBeneficiaryId(count + 1),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender, address, district, state, pincode, aadharNumber,
      },
    });

    if (rationCardType) {
      await prisma.rationCard.create({
        data: {
          cardNumber: generateRationCardNumber(rcCount + 1),
          cardType: rationCardType,
          beneficiaryId: beneficiary.id,
          assignedShopId,
          issueDate: new Date(),
        },
      });
    }

    await createAuditLog({
      performedById: req.user?.userId,
      action: 'BENEFICIARY_CREATED',
      entity: 'Beneficiary',
      entityId: beneficiary.id,
      description: `Beneficiary created: ${firstName} ${lastName}`,
    });

    const result = await prisma.beneficiary.findUnique({
      where: { id: beneficiary.id },
      include: { user: { select: { firstName: true, lastName: true, email: true } }, rationCard: true },
    });
    sendSuccess(res, result, 'Beneficiary created successfully', 201);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'P2002') { sendError(res, 'Email or Aadhar number already exists.', 409); return; }
    sendError(res, 'Failed to create beneficiary', 500);
  }
};

export const updateBeneficiary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { address, district, state, pincode, gender, isActive } = req.body;

    const ben = await prisma.beneficiary.update({
      where: { id: req.params.id },
      data: { address, district, state, pincode, gender, ...(isActive !== undefined && { isActive }) },
    });

    await createAuditLog({
      performedById: req.user?.userId,
      action: 'BENEFICIARY_UPDATED',
      entity: 'Beneficiary',
      entityId: ben.id,
      description: `Beneficiary updated: ${ben.beneficiaryId}`,
    });

    sendSuccess(res, ben, 'Beneficiary updated');
  } catch (err) {
    sendError(res, 'Failed to update beneficiary', 500);
  }
};

export const getBeneficiaryByRationCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cardNumber } = req.params;
    const rationCard = await prisma.rationCard.findUnique({
      where: { cardNumber },
      include: {
        beneficiary: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        familyMembers: true,
        assignedShop: { select: { id: true, name: true, shopId: true } },
        entitlements: { include: { commodity: true } },
      },
    });
    if (!rationCard) { sendError(res, 'Ration card not found', 404); return; }
    sendSuccess(res, rationCard);
  } catch (err) {
    sendError(res, 'Failed to verify beneficiary', 500);
  }
};
