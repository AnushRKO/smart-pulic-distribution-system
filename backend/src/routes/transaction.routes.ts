import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getTransactions, getTransactionById, getTransactionStats } from '../controllers/transaction.controller';

const router = Router();
router.use(authenticate);

router.get('/stats', getTransactionStats);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);

export default router;
