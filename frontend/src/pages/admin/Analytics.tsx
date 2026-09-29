import { useEffect, useState } from 'react';
import { reportService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { monthNames } from '../../utils/helpers';

const COLORS = ['#1d4ed8','#22c55e','#f97316','#a855f7','#ef4444','#06b6d4'];

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getAnalytics()
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-gray-500">No analytics data.</div>;

  const monthlyData = (data.monthlyTrend || []).map((m: any) => ({
    name: monthNames[m.month - 1],
    transactions: m._count.id,
    quantity: parseFloat((m._sum.quantity || 0).toFixed(1)),
  }));

  const shopData = (data.shopDistribution || []).map((s: any) => ({
    name: (s.shopName || 'Unknown').substring(0, 14),
    count: s._count.id,
    qty: parseFloat((s._sum.quantity || 0).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Beneficiaries', data.summary.totalBeneficiaries],
          ['Active Shops', data.summary.totalShops],
          ['Total Transactions', data.summary.totalTransactions],
          ["Today's Txn", data.summary.todayTxn],
        ].map(([k,v]) => (
          <div key={k} className="card p-4 text-center">
            <p className="text-2xl font-bold text-primary-800">{v}</p>
            <p className="text-xs text-gray-500 mt-1">{k}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Monthly Transactions (Area)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip/>
              <Area type="monotone" dataKey="transactions" stroke="#1d4ed8" fill="#dbeafe" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Quantity Distributed</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip/>
              <Bar dataKey="quantity" fill="#22c55e" name="Qty (units)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Commodity Share</h2>
          {(data.commodityDistribution || []).length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.commodityDistribution} dataKey="_count.id" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                  {data.commodityDistribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip/><Legend/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Shop-wise Distributions</h2>
          {shopData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={shopData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis type="number" tick={{fontSize:10}}/>
                <YAxis dataKey="name" type="category" tick={{fontSize:9}} width={100}/>
                <Tooltip/>
                <Bar dataKey="count" fill="#a855f7" name="Distributions" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Inventory Status Overview</h2>
        <div className="flex gap-4 flex-wrap">
          {(data.inventoryStatus || []).map((s: any) => (
            <div key={s.status} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
              s.status === 'AVAILABLE' ? 'bg-green-50 border-green-200 text-green-700' :
              s.status === 'LOW_STOCK' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
              'bg-red-50 border-red-200 text-red-700'
            }`}>
              <span>{s.status.replace('_',' ')}</span>
              <span className="font-bold">{s._count.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
