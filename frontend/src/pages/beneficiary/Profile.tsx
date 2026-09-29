import { useEffect, useState } from 'react';
import { useAuthStore } from '../../hooks/useAuth';
import { beneficiaryService } from '../../services';
import { authService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDate, cardTypeLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Beneficiary } from '../../types';
import { AxiosError } from 'axios';

export default function BeneficiaryProfile() {
  const { user, refreshUser } = useAuthStore();
  const [ben, setBen] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    beneficiaryService.getAll()
      .then(r => setBen(r.data.data?.[0] || null))
      .finally(() => setLoading(false));
  }, []);

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900">My Profile</h1>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Full Name', `${user?.firstName} ${user?.lastName}`],
            ['Email', user?.email],
            ['Phone', user?.phone || '—'],
            ['Beneficiary ID', ben?.beneficiaryId || '—'],
            ['Gender', ben?.gender || '—'],
            ['Date of Birth', formatDate(ben?.dateOfBirth)],
            ['Address', ben?.address || '—'],
            ['District', ben?.district || '—'],
            ['State', ben?.state || '—'],
            ['Pincode', ben?.pincode || '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-gray-500">{k}</p>
              <p className="font-medium text-gray-800 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {ben?.rationCard && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Ration Card Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Card Number', ben.rationCard.cardNumber],
              ['Card Type', cardTypeLabel[ben.rationCard.cardType]],
              ['Status', ben.rationCard.status],
              ['Issue Date', formatDate(ben.rationCard.issueDate)],
              ['Expiry Date', formatDate(ben.rationCard.expiryDate)],
              ['Assigned Shop', ben.rationCard.assignedShop?.name || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-gray-500">{k}</p>
                <p className="font-medium text-gray-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePwChange} className="space-y-3 max-w-sm">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))} required/>
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))} required minLength={6}/>
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={pwForm.confirm}
              onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} required/>
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary">{pwLoading ? 'Saving...' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  );
}
