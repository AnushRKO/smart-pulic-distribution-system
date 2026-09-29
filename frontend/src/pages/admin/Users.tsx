import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Key } from 'lucide-react';
import { userService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { formatDate, roleLabel, roleColor } from '../../utils/helpers';
import { User, Role } from '../../types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

const emptyForm = { email:'', password:'', firstName:'', lastName:'', phone:'', role:'BENEFICIARY' as Role };

export default function AdminUsers() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [newPass, setNewPass] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    userService.getAll({ page, limit: 15, search })
      .then(r => { setData(r.data.data || []); setTotalPages(r.data.pagination?.totalPages || 1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await userService.create(form);
      toast.success('User created'); setShowCreate(false); setForm(emptyForm); load();
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editUser) return; setSaving(true);
    try {
      await userService.update(editUser.id, { firstName: form.firstName, lastName: form.lastName, phone: form.phone, role: form.role });
      toast.success('User updated'); setEditUser(null); load();
    } catch (err) {
      toast.error('Failed to update');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    try { await userService.delete(id); toast.success('User deactivated'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleResetPass = async (e: React.FormEvent) => {
    e.preventDefault(); if (!resetUser) return; setSaving(true);
    try {
      await userService.resetPassword(resetUser.id, { newPassword: newPass });
      toast.success('Password reset'); setResetUser(null); setNewPass('');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ ...emptyForm, firstName: u.firstName, lastName: u.lastName, phone: u.phone || '', role: u.role });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-2">
          <input className="input w-60" placeholder="Search users..." value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(1), load())}/>
          <button onClick={() => { setShowCreate(true); setForm(emptyForm); }} className="btn-primary flex items-center gap-2">
            <Plus size={16}/> Add User
          </button>
        </div>
      </div>

      <div className="card">
        {data.length === 0 ? <EmptyState title="No users found"/> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Last Login</th>
                  <th className="table-header">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{u.firstName} {u.lastName}</td>
                      <td className="table-cell text-xs text-gray-600">{u.email}</td>
                      <td className="table-cell"><span className={`badge ${roleColor[u.role]}`}>{roleLabel[u.role]}</span></td>
                      <td className="table-cell">
                        <span className={`badge ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span>
                      </td>
                      <td className="table-cell text-xs text-gray-500">{formatDate(u.lastLoginAt)}</td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14}/></button>
                          <button onClick={() => { setResetUser(u); setNewPass(''); }} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><Key size={14}/></button>
                          <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
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

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">First Name</label><input className="input" value={form.firstName} onChange={e => setForm(f=>({...f,firstName:e.target.value}))} required/></div>
            <div><label className="label">Last Name</label><input className="input" value={form.lastName} onChange={e => setForm(f=>({...f,lastName:e.target.value}))} required/></div>
          </div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required/></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}/></div>
          <div><label className="label">Role</label>
            <select className="input" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value as Role}))}>
              <option value="BENEFICIARY">Beneficiary</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="GOVERNMENT_OFFICIAL">Govt. Official</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>
          <div><label className="label">Password</label><input type="password" className="input" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} placeholder="Default: Admin@1234"/></div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        <form onSubmit={handleEdit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">First Name</label><input className="input" value={form.firstName} onChange={e => setForm(f=>({...f,firstName:e.target.value}))} required/></div>
            <div><label className="label">Last Name</label><input className="input" value={form.lastName} onChange={e => setForm(f=>({...f,lastName:e.target.value}))} required/></div>
          </div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}/></div>
          <div><label className="label">Role</label>
            <select className="input" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value as Role}))}>
              <option value="BENEFICIARY">Beneficiary</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="GOVERNMENT_OFFICIAL">Govt. Official</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setEditUser(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={!!resetUser} onClose={() => setResetUser(null)} title="Reset Password" size="sm">
        <form onSubmit={handleResetPass} className="space-y-3">
          <p className="text-sm text-gray-600">Reset password for <b>{resetUser?.firstName} {resetUser?.lastName}</b></p>
          <div><label className="label">New Password</label><input type="password" className="input" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={6}/></div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setResetUser(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Resetting...' : 'Reset'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
