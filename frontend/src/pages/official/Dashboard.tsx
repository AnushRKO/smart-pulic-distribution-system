import { useEffect, useState } from 'react';
import { Users, Store, Boxes, ClipboardList, AlertTriangle } from 'lucide-react';
import { reportService } from '../../services';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { monthNames, inventoryStatusColor } from '../../utils/helpers';

const COLORS = ['#1d4ed8','#22c55e','#f97316','#a855f7','#ef4444','#06b6d4'];

export default function OfficialDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getAnalytics()
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-gray-500 p-6">No analytics data available.</div>;

  const monthlyData = (data.monthlyTrend || []).map((m: any) => ({
    name: monthNames[m.month - 1],
    transactions: m._count.id,
    quantity: parseFloat((m._sum.quantity || 0).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Government Official Dashboard</h1>
        <p className="text-sm text-gray-500">System-wide monitoring and analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Beneficiaries" value={data.summary.totalBeneficiaries} icon={<Users className="text-primary-600" size={22}/>} iconBg="bg-primary-100"/>
        <StatCard title="Active Shops" value={data.summary.totalShops} icon={<Store className="text-secondary-600" size={22}/>} iconBg="bg-secondary-100"/>
        <StatCard title="Total Transactions" value={data.summary.totalTransactions} icon={<ClipboardList className="text-purple-600" size={22}/>} iconBg="bg-purple-100"/>
        <StatCard title="Today's Transactions" value={data.summary.todayTxn} icon={<Boxes className="text-accent-600" size={22}/>} iconBg="bg-accent-100"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Distribution Trend</h2>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No transaction data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{fontSize:12}}/>
                <YAxis tick={{fontSize:12}}/>
                <Tooltip/>
                <Bar dataKey="transactions" fill="#1d4ed8" name="Transactions" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Commodity Distribution</h2>
          {(data.commodityDistribution || []).length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.commodityDistribution} dataKey="_sum.quantity" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {data.commodityDistribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toFixed(1) + ' units'}/>
                <Legend/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={18}/> Inventory Status Overview
        </h2>
        <div className="flex gap-4 flex-wrap">
          {(data.inventoryStatus || []).map((s: any) => (
            <div key={s.status} className={`badge text-sm px-3 py-1.5 ${inventoryStatusColor[s.status as any] || 'bg-gray-100 text-gray-600'}`}>
              {s.status.replace('_',' ')}: {s._count.id}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
