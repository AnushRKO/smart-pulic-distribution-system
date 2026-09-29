import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getUsers, getUserById, createUser, updateUser, deleteUser, resetUserPassword } from '../controllers/user.controller';

const router = Router();
router.use(authenticate, authorize('ADMINISTRATOR'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', resetUserPassword);

export default router;
