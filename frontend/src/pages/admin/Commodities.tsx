import { useEffect, useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { commodityService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { Commodity } from '../../types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function AdminCommodities() {
  const [data, setData] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Commodity | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ commodityCode:'', name:'', unit:'KG', description:'', subsidizedRate:'', marketRate:'', status:'ACTIVE' });

  const load = () => {
    setLoading(true);
    commodityService.getAll({ limit: 100 })
      .then(r => setData(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ commodityCode:'', name:'', unit:'KG', description:'', subsidizedRate:'', marketRate:'', status:'ACTIVE' }); setShowModal(true); };
  const openEdit = (c: Commodity) => {
    setEditing(c);
    setForm({ commodityCode: c.commodityCode, name: c.name, unit: c.unit, description: c.description || '', subsidizedRate: String(c.subsidizedRate), marketRate: String(c.marketRate || ''), status: c.status });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) {
        await commodityService.update(editing.id, form);
        toast.success('Commodity updated');
      } else {
        await commodityService.create(form);
        toast.success('Commodity created');
      }
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
        <h1 className="text-xl font-bold text-gray-900">Commodity Management</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Commodity</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length === 0 ? <div className="col-span-3"><EmptyState title="No commodities"/></div> :
          data.map(c => (
            <div key={c.id} className="card p-5 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <span className={`badge text-xs ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                </div>
                <p className="text-xs text-gray-400 font-mono mb-2">{c.commodityCode}</p>
                <div className="text-xs space-y-1 text-gray-600">
                  <p>Unit: <b>{c.unit}</b></p>
                  <p>Subsidized Rate: <b>₹{c.subsidizedRate}/{c.unit}</b></p>
                  {c.marketRate && <p>Market Rate: <b>₹{c.marketRate}/{c.unit}</b></p>}
                  {c.description && <p className="text-gray-400">{c.description}</p>}
                </div>
              </div>
              <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded ml-2"><Edit2 size={14}/></button>
            </div>
          ))
        }
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Commodity' : 'Add Commodity'}>
        <form onSubmit={handleSave} className="space-y-3">
          {!editing && <div><label className="label">Commodity Code</label><input className="input" value={form.commodityCode} onChange={e=>setForm(f=>({...f,commodityCode:e.target.value}))} placeholder="COM-RICE" required/></div>}
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/></div>
          <div><label className="label">Unit</label>
            <select className="input" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}>
              <option value="KG">KG</option><option value="LITER">Liter</option><option value="GRAM">Gram</option><option value="PIECE">Piece</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Subsidized Rate (₹)</label><input type="number" step="0.01" className="input" value={form.subsidizedRate} onChange={e=>setForm(f=>({...f,subsidizedRate:e.target.value}))} required/></div>
            <div><label className="label">Market Rate (₹)</label><input type="number" step="0.01" className="input" value={form.marketRate} onChange={e=>setForm(f=>({...f,marketRate:e.target.value}))}/></div>
          </div>
          <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
          {editing && <div><label className="label">Status</label>
            <select className="input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
              <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
            </select>
          </div>}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
