import { useEffect, useState } from 'react';
import { Users, User, Store, Boxes, ClipboardList, Truck, AlertTriangle } from 'lucide-react';
import { reportService } from '../../services';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthNames, formatDateTime, inventoryStatusColor } from '../../utils/helpers';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportService.getAdminDashboard(),
      reportService.getAnalytics(),
    ]).then(([d, a]) => {
      setData(d.data.data);
      setAnalyticsData(a.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const s = data.summary;
  const monthlyData = ((analyticsData?.monthlyTrend) || []).map((m: any) => ({
    name: monthNames[m.month - 1],
    transactions: m._count.id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Administrator Dashboard</h1>
        <p className="text-sm text-gray-500">Complete system overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Users" value={s.users} icon={<Users className="text-primary-600" size={18}/>} iconBg="bg-primary-100"/>
        <StatCard title="Beneficiaries" value={s.beneficiaries} icon={<User className="text-secondary-600" size={18}/>} iconBg="bg-secondary-100"/>
        <StatCard title="Distributors" value={s.distributors} icon={<Truck className="text-purple-600" size={18}/>} iconBg="bg-purple-100"/>
        <StatCard title="Active Shops" value={s.activeShops} icon={<Store className="text-accent-600" size={18}/>} iconBg="bg-accent-100"/>
        <StatCard title="Today's Txns" value={s.todayTxn} icon={<ClipboardList className="text-blue-600" size={18}/>} iconBg="bg-blue-100"/>
        <StatCard title="Total Stock" value={s.totalInventory?.toFixed(0)} icon={<Boxes className="text-green-600" size={18}/>} iconBg="bg-green-100"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Transaction Trend (This Year)</h2>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No transactions yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip/>
                <Bar dataKey="transactions" fill="#1d4ed8" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-amber-500" size={18}/>
            <h2 className="font-semibold">Stock Alerts</h2>
          </div>
          {(data.lowStockAlerts || []).length === 0 ? (
            <p className="text-sm text-gray-500">All stock levels are healthy.</p>
          ) : (
            <div className="space-y-2">
              {data.lowStockAlerts.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 text-sm">
                  <div>
                    <p className="font-medium">{a.commodity?.name}</p>
                    <p className="text-xs text-gray-500">{a.shop?.name}</p>
                  </div>
                  <span className={`badge ${inventoryStatusColor[a.status]}`}>
                    {a.availableStock} {a.commodity?.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Recent System Activity</h2>
        <div className="space-y-1">
          {(data.recentAudit || []).map((log: any) => (
            <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-100 text-sm last:border-0">
              <span className="badge bg-gray-100 text-gray-600 text-xs">{log.action.replace(/_/g,' ')}</span>
              <p className="text-gray-700 flex-1">{log.description}</p>
              <p className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(log.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
