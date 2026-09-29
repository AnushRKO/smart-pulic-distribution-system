import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './hooks/useAuth';
import { Role } from './types';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Beneficiary pages
import BeneficiaryDashboard from './pages/beneficiary/Dashboard';
import BeneficiaryProfile from './pages/beneficiary/Profile';
import BeneficiaryTransactions from './pages/beneficiary/Transactions';
import BeneficiaryNotifications from './pages/beneficiary/Notifications';

// Distributor pages
import DistributorDashboard from './pages/distributor/Dashboard';
import DistributionNew from './pages/distributor/NewDistribution';
import DistributorInventory from './pages/distributor/Inventory';
import DistributorTransactions from './pages/distributor/Transactions';

// Official pages
import OfficialDashboard from './pages/official/Dashboard';
import OfficialBeneficiaries from './pages/official/Beneficiaries';
import OfficialReports from './pages/official/Reports';
import OfficialAnalytics from './pages/official/Analytics';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminBeneficiaries from './pages/admin/Beneficiaries';
import AdminShops from './pages/admin/Shops';
import AdminCommodities from './pages/admin/Commodities';
import AdminInventory from './pages/admin/Inventory';
import AdminDistributions from './pages/admin/Distributions';
import AdminTransactions from './pages/admin/Transactions';
import AdminReports from './pages/admin/Reports';
import AdminAnalytics from './pages/admin/Analytics';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/Settings';

import NotFoundPage from './pages/NotFoundPage';

const roleDashboard: Record<Role, string> = {
  BENEFICIARY:         '/beneficiary/dashboard',
  DISTRIBUTOR:         '/distributor/dashboard',
  GOVERNMENT_OFFICIAL: '/official/dashboard',
  ADMINISTRATOR:       '/admin/dashboard',
};

function RoleRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleDashboard[user.role]} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

      {/* Beneficiary */}
      <Route path="/beneficiary" element={<ProtectedRoute roles={['BENEFICIARY']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BeneficiaryDashboard />} />
        <Route path="profile" element={<BeneficiaryProfile />} />
        <Route path="transactions" element={<BeneficiaryTransactions />} />
        <Route path="notifications" element={<BeneficiaryNotifications />} />
      </Route>

      {/* Distributor */}
      <Route path="/distributor" element={<ProtectedRoute roles={['DISTRIBUTOR']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DistributorDashboard />} />
        <Route path="distribution/new" element={<DistributionNew />} />
        <Route path="inventory" element={<DistributorInventory />} />
        <Route path="transactions" element={<DistributorTransactions />} />
      </Route>

      {/* Official */}
      <Route path="/official" element={<ProtectedRoute roles={['GOVERNMENT_OFFICIAL']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OfficialDashboard />} />
        <Route path="beneficiaries" element={<OfficialBeneficiaries />} />
        <Route path="reports" element={<OfficialReports />} />
        <Route path="analytics" element={<OfficialAnalytics />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['ADMINISTRATOR']}><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="beneficiaries" element={<AdminBeneficiaries />} />
        <Route path="shops" element={<AdminShops />} />
        <Route path="commodities" element={<AdminCommodities />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="distributions" element={<AdminDistributions />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
