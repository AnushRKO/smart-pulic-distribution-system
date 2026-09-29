import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getCommodities, getCommodityById, createCommodity, updateCommodity } from '../controllers/commodity.controller';

const router = Router();
router.use(authenticate);

router.get('/', getCommodities);
router.get('/:id', getCommodityById);
router.post('/', authorize('ADMINISTRATOR'), createCommodity);
router.put('/:id', authorize('ADMINISTRATOR'), updateCommodity);

export default router;
