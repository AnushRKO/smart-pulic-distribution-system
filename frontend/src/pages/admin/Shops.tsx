import { useEffect, useState } from 'react';
import { Plus, Edit2, Eye } from 'lucide-react';
import { shopService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { Shop } from '../../types';
import { shopStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function AdminShops() {
  const [data, setData] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Shop | null>(null);
  const [viewShop, setViewShop] = useState<Shop | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:'', address:'', area:'', district:'', state:'', phone:'', status:'ACTIVE' });

  const load = () => {
    setLoading(true);
    shopService.getAll({ page, limit: 10 })
      .then(r => { setData(r.data.data || []); setTotalPages(r.data.pagination?.totalPages || 1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => { setEditing(null); setForm({ name:'', address:'', area:'', district:'', state:'', phone:'', status:'ACTIVE' }); setShowModal(true); };
  const openEdit = (s: Shop) => { setEditing(s); setForm({ name:s.name, address:s.address, area:s.area||'', district:s.district||'', state:s.state||'', phone:s.phone||'', status:s.status }); setShowModal(true); };

  const openView = async (s: Shop) => {
    const res = await shopService.getById(s.id);
    setViewShop(res.data.data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await shopService.update(editing.id, form); toast.success('Shop updated'); }
      else { await shopService.create(form); toast.success('Shop created'); }
      setShowModal(false); load();
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Shop Management</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Shop</button>
      </div>

      <div className="card">
        {data.length === 0 ? <EmptyState title="No shops"/> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Shop ID</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">District</th>
                  <th className="table-header">Distributor</th>
                  <th className="table-header">Beneficiaries</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="table-cell font-mono text-xs text-primary-700">{s.shopId}</td>
                      <td className="table-cell font-medium">{s.name}</td>
                      <td className="table-cell">{s.district || '—'}</td>
                      <td className="table-cell text-xs">{s.distributor?.user?.firstName} {s.distributor?.user?.lastName}</td>
                      <td className="table-cell">{s._count?.rationCards || 0}</td>
                      <td className="table-cell"><span className={`badge ${shopStatusColor[s.status]}`}>{s.status}</span></td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button onClick={() => openView(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Eye size={14}/></button>
                          <button onClick={() => openEdit(s)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><Edit2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3"><Pagination page={page} totalPages={totalPages} onPageChange={setPage}/></div>
          </>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Shop' : 'Add Shop'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div><label className="label">Shop Name</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/></div>
          <div><label className="label">Address</label><input className="input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} required/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Area</label><input className="input" value={form.area} onChange={e=>setForm(f=>({...f,area:e.target.value}))}/></div>
            <div><label className="label">District</label><input className="input" value={form.district} onChange={e=>setForm(f=>({...f,district:e.target.value}))}/></div>
            <div><label className="label">State</label><input className="input" value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}/></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
          </div>
          {editing && <div><label className="label">Status</label>
            <select className="input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
              <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="SUSPENDED">Suspended</option>
            </select>
          </div>}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewShop} onClose={() => setViewShop(null)} title="Shop Details">
        {viewShop && (
          <div className="space-y-3 text-sm">
            {[['Shop ID', viewShop.shopId], ['Name', viewShop.name], ['Address', viewShop.address], ['District', viewShop.district||'—'], ['Phone', viewShop.phone||'—']].map(([k,v]) => (
              <div key={k} className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{k}</span><span className="font-medium">{v}</span>
              </div>
            ))}
            {viewShop.inventory && viewShop.inventory.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Inventory</p>
                {viewShop.inventory.map(i => (
                  <div key={i.id} className="flex justify-between py-1 border-b border-gray-100 text-xs">
                    <span>{i.commodity?.name}</span>
                    <span className="font-medium">{i.availableStock} {i.commodity?.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
