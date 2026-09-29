import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateBeneficiaryId, generateDistributorId } from '../utils/idGenerator';
import { createAuditLog } from '../services/audit.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      sendError(res, 'An account with this email already exists.', 409);
      return;
    }

    const allowedRoles: string[] = ['BENEFICIARY', 'DISTRIBUTOR'];
    const userRole: string = allowedRoles.includes(role) ? role : 'BENEFICIARY';

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: userRole,
      },
    });

    // Auto-create linked entity
    if (userRole === 'BENEFICIARY') {
      const count = await prisma.beneficiary.count();
      await prisma.beneficiary.create({
        data: {
          userId: user.id,
          beneficiaryId: generateBeneficiaryId(count + 1),
        },
      });
    } else if (userRole === 'DISTRIBUTOR') {
      const count = await prisma.distributor.count();
      await prisma.distributor.create({
        data: {
          userId: user.id,
          distributorId: generateDistributorId(count + 1),
        },
      });
    }

    await createAuditLog({ userId: user.id, performedById: user.id, action: 'USER_CREATED', entity: 'User', entityId: user.id, description: `New user registered: ${email} as ${userRole}` });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }, 'Registration successful', 201);
  } catch (err) {
    console.error('Register error:', err);
    sendError(res, 'Registration failed. Please try again.', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    if (user.status !== 'ACTIVE') {
      sendError(res, 'Your account has been suspended. Please contact the administrator.', 403);
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createAuditLog({ userId: user.id, performedById: user.id, action: 'LOGIN', entity: 'User', entityId: user.id, description: `User logged in: ${email}`, ipAddress: req.ip, userAgent: req.headers['user-agent'] });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    }, 'Login successful');
  } catch (err) {
    console.error('Login error:', err);
    sendError(res, 'Login failed. Please try again.', 500);
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await createAuditLog({ userId: req.user.userId, performedById: req.user.userId, action: 'LOGOUT', entity: 'User', entityId: req.user.userId, description: `User logged out: ${req.user.email}` });
    }
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    sendError(res, 'Logout failed', 500);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        beneficiary: {
          select: {
            id: true,
            beneficiaryId: true,
            district: true,
            address: true,
            rationCard: {
              select: {
                id: true,
                cardNumber: true,
                cardType: true,
                status: true,
                assignedShop: { select: { id: true, name: true, shopId: true } },
              },
            },
          },
        },
        distributor: {
          select: {
            id: true,
            distributorId: true,
            shops: { select: { id: true, name: true, shopId: true, status: true } },
          },
        },
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user, 'User profile retrieved');
  } catch (err) {
    sendError(res, 'Failed to get user profile', 500);
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      sendError(res, 'Current password is incorrect.', 400);
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await createAuditLog({ userId: user.id, performedById: user.id, action: 'PASSWORD_CHANGED', entity: 'User', entityId: user.id, description: `Password changed for user: ${user.email}` });

    sendSuccess(res, null, 'Password changed successfully');
  } catch (err) {
    sendError(res, 'Failed to change password', 500);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }
    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { firstName, lastName, phone },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
    });

    sendSuccess(res, user, 'Profile updated successfully');
  } catch (err) {
    sendError(res, 'Failed to update profile', 500);
  }
};
