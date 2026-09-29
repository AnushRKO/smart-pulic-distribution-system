import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../controllers/notification.controller';

const router = Router();
router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
