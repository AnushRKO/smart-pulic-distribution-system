import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { createAuditLog } from '../services/audit.service';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page  = parseInt(req.query.page  as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const role   = req.query.role   as string;
    const status = req.query.status as string;
    const skip   = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName:  { contains: search } },
        { email:     { contains: search } },
      ];
    }
    if (role)   where.role   = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        select: { id:true, email:true, firstName:true, lastName:true, phone:true, role:true, status:true, lastLoginAt:true, createdAt:true },
      }),
      prisma.user.count({ where }),
    ]);
    sendPaginated(res, users, total, page, limit);
  } catch { sendError(res, 'Failed to fetch users', 500); }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id:true, email:true, firstName:true, lastName:true, phone:true, role:true, status:true, lastLoginAt:true, createdAt:true,
        beneficiary: true, distributor: { include: { shops: true } } },
    });
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, user);
  } catch { sendError(res, 'Failed to fetch user', 500); }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { sendError(res, 'Email already exists', 409); return; }
    const passwordHash = await bcrypt.hash(password || 'Admin@1234', 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone, role },
      select: { id:true, email:true, firstName:true, lastName:true, role:true, status:true, createdAt:true },
    });
    await createAuditLog({ performedById: req.user?.userId, action: 'USER_CREATED', entity: 'User', entityId: user.id, description: `Admin created user: ${email}` });
    sendSuccess(res, user, 'User created successfully', 201);
  } catch (err: any) {
    if (err.code === 'P2002') { sendError(res, 'Email already exists', 409); return; }
    sendError(res, 'Failed to create user', 500);
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, role, status } = req.body;
    const targetId = req.params.id;
    if (role && role !== 'ADMINISTRATOR') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMINISTRATOR', status: 'ACTIVE' } });
      const targetUser  = await prisma.user.findUnique({ where: { id: targetId } });
      if (targetUser?.role === 'ADMINISTRATOR' && adminCount <= 1) {
        sendError(res, 'Cannot change role of the last active administrator.', 400); return;
      }
    }
    const user = await prisma.user.update({
      where: { id: targetId },
      data: { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(phone !== undefined && { phone }), ...(role && { role }), ...(status && { status }) },
      select: { id:true, email:true, firstName:true, lastName:true, role:true, status:true },
    });
    await createAuditLog({ performedById: req.user?.userId, action: 'USER_UPDATED', entity: 'User', entityId: user.id, description: `User updated: ${user.email}` });
    sendSuccess(res, user, 'User updated successfully');
  } catch { sendError(res, 'Failed to update user', 500); }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.params.id === req.user?.userId) { sendError(res, 'You cannot deactivate your own account.', 400); return; }
    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'INACTIVE' } });
    sendSuccess(res, null, 'User deactivated successfully');
  } catch { sendError(res, 'Failed to deactivate user', 500); }
};

export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hash = await bcrypt.hash(req.body.newPassword || 'Admin@1234', 12);
    await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash: hash } });
    await createAuditLog({ performedById: req.user?.userId, action: 'PASSWORD_CHANGED', entity: 'User', entityId: req.params.id, description: `Admin reset password for user: ${req.params.id}` });
    sendSuccess(res, null, 'Password reset successfully');
  } catch { sendError(res, 'Failed to reset password', 500); }
};
