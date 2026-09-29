import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import beneficiaryRoutes from './routes/beneficiary.routes';
import commodityRoutes from './routes/commodity.routes';
import shopRoutes from './routes/shop.routes';
import inventoryRoutes from './routes/inventory.routes';
import distributionRoutes from './routes/distribution.routes';
import transactionRoutes from './routes/transaction.routes';
import notificationRoutes from './routes/notification.routes';
import reportRoutes from './routes/report.routes';
import { notFound, errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: 'Too many requests' });
app.use('/api', limiter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/commodities', commodityRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Smart PDS API running at http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
