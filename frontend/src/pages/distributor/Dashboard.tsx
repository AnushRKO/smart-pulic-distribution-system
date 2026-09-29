import { useEffect, useState } from 'react';
import { Users, Boxes, Truck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { inventoryService, transactionService, distributionService } from '../../services';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { inventoryStatusColor, formatDateTime } from '../../utils/helpers';
import { Inventory, Distribution } from '../../types';

export default function DistributorDashboard() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [dists, setDists] = useState<Distribution[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, low: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      inventoryService.getAll({ limit: 50 }),
      distributionService.getAll({ limit: 10 }),
      transactionService.getStats(),
    ]).then(([invRes, distRes, statsRes]) => {
      setInventory(invRes.data.data || []);
      setDists(distRes.data.data || []);
      setStats(statsRes.data.data || {});
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const lowStockItems = inventory.filter(i => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK');
  const totalStock = inventory.reduce((s, i) => s + i.availableStock, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Distributor Dashboard</h1>
          <p className="text-sm text-gray-500">Manage inventory and distributions</p>
        </div>
        <Link to="/distributor/distribution/new" className="btn-primary flex items-center gap-2">
          <Truck size={16}/> New Distribution
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Distributions" value={stats.today} icon={<Truck className="text-primary-600" size={22}/>} iconBg="bg-primary-100"/>
        <StatCard title="Total Stock" value={`${totalStock.toFixed(0)} units`} icon={<Boxes className="text-secondary-600" size={22}/>} iconBg="bg-secondary-100"/>
        <StatCard title="Low Stock Items" value={lowStockItems.length} icon={<AlertTriangle className="text-accent-600" size={22}/>} iconBg="bg-accent-100"/>
        <StatCard title="Total Transactions" value={stats.total} icon={<Users className="text-purple-600" size={22}/>} iconBg="bg-purple-100"/>
      </div>

      {lowStockItems.length > 0 && (
        <div className="card border-l-4 border-l-amber-400 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-amber-500" size={18}/>
            <h2 className="font-semibold text-amber-800">Stock Alerts</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.map(i => (
              <div key={i.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg text-sm">
                <div>
                  <p className="font-medium text-gray-800">{i.commodity?.name}</p>
                  <p className="text-xs text-gray-500">{i.shop?.name}</p>
                </div>
                <span className={`badge ${inventoryStatusColor[i.status]}`}>
                  {i.availableStock} {i.commodity?.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Overview */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Inventory Overview</h2>
          </div>
          {inventory.length === 0 ? <EmptyState title="No inventory data"/> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Commodity</th>
                  <th className="table-header">Available</th>
                  <th className="table-header">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {inventory.slice(0, 8).map(i => (
                    <tr key={i.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <p className="font-medium">{i.commodity?.name}</p>
                        <p className="text-xs text-gray-400">{i.shop?.name}</p>
                      </td>
                      <td className="table-cell">{i.availableStock} {i.commodity?.unit}</td>
                      <td className="table-cell">
                        <span className={`badge ${inventoryStatusColor[i.status]}`}>{i.status.replace('_',' ')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Distributions */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Distributions</h2>
            <Link to="/distributor/transactions" className="text-xs text-primary-700 hover:underline">View all</Link>
          </div>
          {dists.length === 0 ? <EmptyState title="No distributions yet"/> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Beneficiary</th>
                  <th className="table-header">Commodity</th>
                  <th className="table-header">Qty</th>
                  <th className="table-header">Time</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {dists.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="table-cell text-xs">{d.beneficiary?.user?.firstName} {d.beneficiary?.user?.lastName}</td>
                      <td className="table-cell">{d.commodity?.name}</td>
                      <td className="table-cell">{d.quantity} {d.commodity?.unit}</td>
                      <td className="table-cell text-xs text-gray-500">{formatDateTime(d.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
