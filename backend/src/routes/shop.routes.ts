import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getShops, getShopById, createShop, updateShop } from '../controllers/shop.controller';

const router = Router();
router.use(authenticate);

router.get('/', getShops);
router.get('/:id', getShopById);
router.post('/', authorize('ADMINISTRATOR'), createShop);
router.put('/:id', authorize('ADMINISTRATOR'), updateShop);

export default router;
