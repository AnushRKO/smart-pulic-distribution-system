import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  getMe,
  changePassword,
  updateProfile,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters.'),
    body('firstName').notEmpty().withMessage('First name is required.'),
    body('lastName').notEmpty().withMessage('Last name is required.'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters.'),
  ],
  validate,
  changePassword
);

router.put('/profile', authenticate, updateProfile);

export default router;
