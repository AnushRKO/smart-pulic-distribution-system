import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getInventory,
  getInventoryById,
  addStock,
  getInventorySummary,
  updateInventoryThreshold,
} from '../controllers/inventory.controller';

const router = Router();
router.use(authenticate);

router.get('/summary', authorize('ADMINISTRATOR', 'GOVERNMENT_OFFICIAL', 'DISTRIBUTOR'), getInventorySummary);
router.get('/', getInventory);
router.get('/:id', getInventoryById);
router.post('/', authorize('ADMINISTRATOR', 'DISTRIBUTOR'), addStock);
router.put('/:id/threshold', authorize('ADMINISTRATOR'), updateInventoryThreshold);

export default router;
