import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'', role:'BENEFICIARY' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const api = (await import('../../utils/api')).default;
      await api.post('/auth/register', form);
      await login(form.email, form.password);
      const { user } = (await import('../../hooks/useAuth')).useAuthStore.getState();
      toast.success('Account created successfully!');
      const paths: Record<string, string> = { BENEFICIARY:'/beneficiary/dashboard', DISTRIBUTOR:'/distributor/dashboard' };
      navigate(paths[form.role] || '/dashboard');
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={28} className="text-white"/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Register for Smart PDS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input className="input" value={form.firstName} onChange={e=>set('firstName',e.target.value)} required placeholder="Ramesh"/>
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" value={form.lastName} onChange={e=>set('lastName',e.target.value)} required placeholder="Kumar"/>
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={e=>set('email',e.target.value)} required placeholder="you@example.com"/>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="9876543210"/>
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={e=>set('role',e.target.value)}>
                <option value="BENEFICIARY">Beneficiary</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={form.password} onChange={e=>set('password',e.target.value)} required minLength={6} placeholder="Min 6 characters"/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-700 font-medium hover:underline">Sign In</Link>
          </p>
          <div className="mt-3 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
