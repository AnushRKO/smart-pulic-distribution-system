import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getBeneficiaries,
  getBeneficiaryById,
  createBeneficiary,
  updateBeneficiary,
  getBeneficiaryByRationCard,
} from '../controllers/beneficiary.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorize('ADMINISTRATOR', 'GOVERNMENT_OFFICIAL', 'DISTRIBUTOR', 'BENEFICIARY'), getBeneficiaries);
router.get('/verify/:cardNumber', authorize('ADMINISTRATOR', 'DISTRIBUTOR'), getBeneficiaryByRationCard);
router.get('/:id', authorize('ADMINISTRATOR', 'GOVERNMENT_OFFICIAL', 'DISTRIBUTOR', 'BENEFICIARY'), getBeneficiaryById);
router.post('/', authorize('ADMINISTRATOR'), createBeneficiary);
router.put('/:id', authorize('ADMINISTRATOR', 'GOVERNMENT_OFFICIAL'), updateBeneficiary);

export default router;
