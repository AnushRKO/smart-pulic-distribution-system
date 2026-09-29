import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { createDistribution, getDistributions, getDistributionById } from '../controllers/distribution.controller';

const router = Router();
router.use(authenticate);

router.post('/', authorize('ADMINISTRATOR', 'DISTRIBUTOR'), createDistribution);
router.get('/', authorize('ADMINISTRATOR', 'GOVERNMENT_OFFICIAL', 'DISTRIBUTOR', 'BENEFICIARY'), getDistributions);
router.get('/:id', authorize('ADMINISTRATOR', 'GOVERNMENT_OFFICIAL', 'DISTRIBUTOR', 'BENEFICIARY'), getDistributionById);

export default router;
