import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Role } from '../../types';

const roleDashboard: Record<Role, string> = {
  BENEFICIARY:         '/beneficiary/dashboard',
  DISTRIBUTOR:         '/distributor/dashboard',
  GOVERNMENT_OFFICIAL: '/official/dashboard',
  ADMINISTRATOR:       '/admin/dashboard',
};

const demoAccounts = [
  { role: 'Administrator',   email: 'admin@smartpds.local',       pass: 'Admin@1234' },
  { role: 'Govt. Official',  email: 'official@smartpds.local',    pass: 'Official@1234' },
  { role: 'Distributor',     email: 'distributor@smartpds.local', pass: 'Dist@1234' },
  { role: 'Beneficiary',     email: 'beneficiary@smartpds.local', pass: 'Ben@1234' },
];

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      const { user } = useAuthStore.getState();
      toast.success(`Welcome back, ${user?.firstName}!`);
      navigate(roleDashboard[user!.role]);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || 'Login failed');
    }
  };

  const fillDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email); setPassword(acc.pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={28} className="text-white"/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Smart PDS</h1>
            <p className="text-gray-500 text-sm mt-1">Public Distribution System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="you@example.com" required autoComplete="email"/>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10" placeholder="••••••••" required autoComplete="current-password"/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-700 font-medium hover:underline">Register</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button key={acc.role} onClick={() => fillDemo(acc)}
                  className="text-left p-2 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition text-xs">
                  <p className="font-semibold text-gray-700">{acc.role}</p>
                  <p className="text-gray-400 truncate">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
