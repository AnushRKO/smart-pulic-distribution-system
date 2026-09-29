import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getStockReport,
  getBeneficiaryReport,
  getDistributionReport,
  getTransactionReport,
  getAnalyticsDashboard,
  getAdminDashboard,
  getAuditLogs,
} from '../controllers/report.controller';

const router = Router();
router.use(authenticate, authorize('ADMINISTRATOR', 'GOVERNMENT_OFFICIAL'));

router.get('/stock', getStockReport);
router.get('/beneficiaries', getBeneficiaryReport);
router.get('/distribution', getDistributionReport);
router.get('/transactions', getTransactionReport);
router.get('/analytics', getAnalyticsDashboard);
router.get('/admin-dashboard', getAdminDashboard);
router.get('/audit-logs', getAuditLogs);

export default router;
