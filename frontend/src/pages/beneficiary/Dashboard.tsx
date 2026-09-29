import { useEffect, useState } from 'react';
import { Package, CreditCard, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuth';
import { beneficiaryService, transactionService } from '../../services';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, inventoryStatusColor } from '../../utils/helpers';
import { Beneficiary, Transaction } from '../../types';

export default function BeneficiaryDashboard() {
  const { user } = useAuthStore();
  const [ben, setBen] = useState<Beneficiary | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      beneficiaryService.getAll(),
      transactionService.getAll({ limit: 5 }),
    ]).then(([benRes, txnRes]) => {
      setBen(benRes.data.data?.[0] || null);
      setTxns(txnRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const entitlements = ben?.rationCard?.entitlements || [];
  const totalEntitlement = entitlements.reduce((s, e) => s + e.monthlyQuota, 0);
  const collected = entitlements.reduce((s, e) => s + e.collectedThisMonth, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
        <p className="text-sm text-gray-500">Your beneficiary dashboard for this month</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monthly Entitlement" value={`${totalEntitlement} units`} icon={<Package className="text-primary-600" size={22}/>} iconBg="bg-primary-100"/>
        <StatCard title="Collected This Month" value={`${collected} units`} icon={<CheckCircle className="text-secondary-600" size={22}/>} iconBg="bg-secondary-100"/>
        <StatCard title="Remaining" value={`${totalEntitlement - collected} units`} icon={<Clock className="text-accent-600" size={22}/>} iconBg="bg-accent-100"/>
        <StatCard title="Ration Card" value={ben?.rationCard?.cardNumber || '—'} icon={<CreditCard className="text-purple-600" size={22}/>} iconBg="bg-purple-100" subtitle={ben?.rationCard?.cardType}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entitlements */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Monthly Entitlements</h2>
          </div>
          {entitlements.length === 0 ? (
            <EmptyState title="No entitlements" description="Contact your distributor to set up entitlements."/>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Commodity</th>
                  <th className="table-header">Quota</th>
                  <th className="table-header">Collected</th>
                  <th className="table-header">Remaining</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {entitlements.map(e => {
                    const rem = e.monthlyQuota - e.collectedThisMonth;
                    return (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{e.commodity?.name}</td>
                        <td className="table-cell">{e.monthlyQuota} {e.commodity?.unit}</td>
                        <td className="table-cell">{e.collectedThisMonth} {e.commodity?.unit}</td>
                        <td className="table-cell">
                          <span className={`badge ${rem <= 0 ? 'bg-red-100 text-red-700' : rem <= e.monthlyQuota * 0.3 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {rem <= 0 ? 'Collected' : `${rem} ${e.commodity?.unit}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assigned Shop */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Assigned Shop</h2>
            {ben?.rationCard?.assignedShop ? (
              <div className="space-y-2">
                <p className="font-medium text-primary-700">{ben.rationCard.assignedShop.name}</p>
                <p className="text-sm text-gray-500">{ben.rationCard.assignedShop.address}</p>
                <p className="text-sm text-gray-500">Shop ID: {ben.rationCard.assignedShop.shopId}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertTriangle size={16}/> No shop assigned yet
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Family Members</h2>
            {(ben?.rationCard?.familyMembers || []).length === 0 ? (
              <p className="text-sm text-gray-500">No family members registered</p>
            ) : (
              <ul className="space-y-1.5">
                {ben?.rationCard?.familyMembers?.map(m => (
                  <li key={m.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{m.name}</span>
                    <span className="text-gray-500">{m.relationship}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        {txns.length === 0 ? (
          <EmptyState title="No transactions yet" description="Your distributions will appear here."/>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>
                <th className="table-header">Transaction ID</th>
                <th className="table-header">Date</th>
                <th className="table-header">Commodity</th>
                <th className="table-header">Qty</th>
                <th className="table-header">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {txns.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs font-medium text-primary-700">{t.transactionId}</td>
                    <td className="table-cell">{formatDate(t.createdAt)}</td>
                    <td className="table-cell">{t.commodity?.name}</td>
                    <td className="table-cell">{t.quantity} {t.commodity?.unit}</td>
                    <td className="table-cell"><span className="badge bg-green-100 text-green-700">{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
