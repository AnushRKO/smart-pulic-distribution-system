import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { inventoryService, shopService, commodityService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { Boxes, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Inventory, Shop, Commodity } from '../../types';
import { inventoryStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function AdminInventory() {
  const [data, setData] = useState<Inventory[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ shopId:'', commodityId:'', quantity:'', notes:'' });

  const load = () => {
    setLoading(true);
    Promise.all([
      inventoryService.getAll({ page, limit: 15 }),
      inventoryService.getSummary(),
      shopService.getAll({ limit: 100 }),
      commodityService.getAll({ status: 'ACTIVE', limit: 100 }),
    ]).then(([invRes, sumRes, shopRes, comRes]) => {
      setData(invRes.data.data || []); setTotalPages(invRes.data.pagination?.totalPages || 1);
      setSummary(sumRes.data.data || {});
      setShops(shopRes.data.data || []);
      setCommodities(comRes.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const addStock = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await inventoryService.addStock({ ...form, quantity: parseFloat(form.quantity) });
      toast.success('Stock added successfully'); setShowAdd(false);
      setForm({ shopId:'', commodityId:'', quantity:'', notes:'' }); load();
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Inventory Management</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Stock</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Stock" value={`${(summary.totalAvailableStock||0).toFixed(0)}`} icon={<Boxes className="text-primary-600" size={20}/>} iconBg="bg-primary-100"/>
        <StatCard title="Available" value={summary.available || 0} icon={<CheckCircle className="text-secondary-600" size={20}/>} iconBg="bg-secondary-100"/>
        <StatCard title="Low Stock" value={summary.lowStock || 0} icon={<AlertTriangle className="text-amber-500" size={20}/>} iconBg="bg-amber-100"/>
        <StatCard title="Out of Stock" value={summary.outOfStock || 0} icon={<XCircle className="text-red-500" size={20}/>} iconBg="bg-red-100"/>
      </div>

      <div className="card">
        {data.length === 0 ? <EmptyState title="No inventory records"/> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Commodity</th>
                  <th className="table-header">Shop</th>
                  <th className="table-header">Opening</th>
                  <th className="table-header">Received</th>
                  <th className="table-header">Distributed</th>
                  <th className="table-header">Available</th>
                  <th className="table-header">Threshold</th>
                  <th className="table-header">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(i => (
                    <tr key={i.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{i.commodity?.name}</td>
                      <td className="table-cell text-xs">{i.shop?.name}<br/><span className="text-gray-400">{i.shop?.district}</span></td>
                      <td className="table-cell">{i.openingStock}</td>
                      <td className="table-cell text-secondary-600">+{i.receivedStock}</td>
                      <td className="table-cell text-red-500">-{i.distributedStock}</td>
                      <td className="table-cell font-semibold">{i.availableStock} {i.commodity?.unit}</td>
                      <td className="table-cell text-gray-500">{i.threshold}</td>
                      <td className="table-cell"><span className={`badge ${inventoryStatusColor[i.status]}`}>{i.status.replace('_',' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3"><Pagination page={page} totalPages={totalPages} onPageChange={setPage}/></div>
          </>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Stock">
        <form onSubmit={addStock} className="space-y-3">
          <div><label className="label">Shop</label>
            <select className="input" value={form.shopId} onChange={e=>setForm(f=>({...f,shopId:e.target.value}))} required>
              <option value="">Select shop</option>
              {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">Commodity</label>
            <select className="input" value={form.commodityId} onChange={e=>setForm(f=>({...f,commodityId:e.target.value}))} required>
              <option value="">Select commodity</option>
              {commodities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.unit})</option>)}
            </select>
          </div>
          <div><label className="label">Quantity</label><input type="number" min={0.1} step={0.1} className="input" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} required/></div>
          <div><label className="label">Notes</label><input className="input" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding...' : 'Add Stock'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
