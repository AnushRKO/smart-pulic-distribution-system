import { useEffect, useState } from 'react';
import { Plus, Eye, Edit2 } from 'lucide-react';
import { beneficiaryService, shopService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { Beneficiary, Shop } from '../../types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function AdminBeneficiaries() {
  const [data, setData] = useState<Beneficiary[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewBen, setViewBen] = useState<Beneficiary | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email:'', firstName:'', lastName:'', phone:'',
    address:'', district:'', state:'', pincode:'', gender:'Male',
    rationCardType:'BPL', assignedShopId:'',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      beneficiaryService.getAll({ page, limit: 15, search }),
      shopService.getAll({ limit: 100, status: 'ACTIVE' }),
    ]).then(([bRes, sRes]) => {
      setData(bRes.data.data || []); setTotalPages(bRes.data.pagination?.totalPages || 1);
      setShops(sRes.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await beneficiaryService.create(form);
      toast.success('Beneficiary created'); setShowCreate(false); load();
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || 'Failed to create');
    } finally { setSaving(false); }
  };

  const openView = async (b: Beneficiary) => {
    const res = await beneficiaryService.getById(b.id);
    setViewBen(res.data.data);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Beneficiary Management</h1>
        <div className="flex gap-2">
          <input className="input w-60" placeholder="Search name or card..." value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(1), load())}/>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16}/> Add Beneficiary
          </button>
        </div>
      </div>

      <div className="card">
        {data.length === 0 ? <EmptyState title="No beneficiaries"/> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Beneficiary ID</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Ration Card</th>
                  <th className="table-header">District</th>
                  <th className="table-header">Card Type</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="table-cell font-mono text-xs text-primary-700">{b.beneficiaryId}</td>
                      <td className="table-cell font-medium">{b.user?.firstName} {b.user?.lastName}</td>
                      <td className="table-cell text-xs">{b.rationCard?.cardNumber || '—'}</td>
                      <td className="table-cell">{b.district || '—'}</td>
                      <td className="table-cell"><span className="badge bg-blue-100 text-blue-700">{b.rationCard?.cardType || '—'}</span></td>
                      <td className="table-cell">
                        <span className={`badge ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button onClick={() => openView(b)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Eye size={14}/></button>
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

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Beneficiary" size="lg">
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">First Name</label><input className="input" value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} required/></div>
            <div><label className="label">Last Name</label><input className="input" value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} required/></div>
            <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
            <div><label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div><label className="label">Card Type</label>
              <select className="input" value={form.rationCardType} onChange={e=>setForm(f=>({...f,rationCardType:e.target.value}))}>
                <option value="BPL">BPL</option><option value="AAY">AAY</option>
                <option value="APL">APL</option><option value="PHH">PHH</option>
              </select>
            </div>
            <div className="col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/></div>
            <div><label className="label">District</label><input className="input" value={form.district} onChange={e=>setForm(f=>({...f,district:e.target.value}))}/></div>
            <div><label className="label">State</label><input className="input" value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}/></div>
            <div><label className="label">Assigned Shop</label>
              <select className="input" value={form.assignedShopId} onChange={e=>setForm(f=>({...f,assignedShopId:e.target.value}))}>
                <option value="">None</option>
                {shops.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewBen} onClose={() => setViewBen(null)} title="Beneficiary Details" size="lg">
        {viewBen && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Beneficiary ID', viewBen.beneficiaryId],
                ['Name', `${viewBen.user?.firstName} ${viewBen.user?.lastName}`],
                ['Email', viewBen.user?.email],
                ['Phone', viewBen.user?.phone || '—'],
                ['District', viewBen.district || '—'],
                ['State', viewBen.state || '—'],
                ['Status', viewBen.isActive ? 'Active' : 'Inactive'],
                ['Ration Card', viewBen.rationCard?.cardNumber || 'None'],
              ].map(([k,v]) => (
                <div key={k}><p className="text-gray-500">{k}</p><p className="font-medium">{v}</p></div>
              ))}
            </div>
            {viewBen.rationCard?.familyMembers && viewBen.rationCard.familyMembers.length > 0 && (
              <div>
                <p className="font-semibold text-gray-800 mb-2">Family Members</p>
                {viewBen.rationCard.familyMembers.map(m => (
                  <div key={m.id} className="flex justify-between py-1.5 border-b border-gray-100">
                    <span>{m.name}</span><span className="text-gray-500">{m.relationship}</span>
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
