import { Link } from 'react-router-dom';
import { ShieldCheck, BarChart2, Bell, Users, Boxes, Lock, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: <ShieldCheck className="text-primary-600" size={28}/>, title: 'Centralized Management', desc: 'Single platform managing all PDS operations from commodity procurement to final distribution.' },
  { icon: <Boxes className="text-secondary-600" size={28}/>, title: 'Real-Time Inventory', desc: 'Track stock levels across all shops in real time. Get instant alerts for low or out-of-stock commodities.' },
  { icon: <Lock className="text-accent-600" size={28}/>, title: 'Secure Role-Based Access', desc: 'Four-level access control ensures every user sees only what they need — nothing more.' },
  { icon: <CheckCircle className="text-primary-600" size={28}/>, title: 'Transparent Transactions', desc: 'Every distribution creates a traceable transaction record with a unique ID, time-stamp and receipt.' },
  { icon: <Bell className="text-secondary-600" size={28}/>, title: 'Smart Notifications', desc: 'In-app notifications keep beneficiaries informed about stock availability and completed distributions.' },
  { icon: <BarChart2 className="text-accent-600" size={28}/>, title: 'Analytics & Reports', desc: 'Interactive charts and exportable reports give officials complete visibility into system performance.' },
];

const workflow = [
  'BENEFICIARY','VERIFICATION','ENTITLEMENT','DISTRIBUTION','TRANSACTION','REPORTING'
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-700 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-white"/>
            </div>
            <div>
              <p className="font-bold text-primary-900 text-sm leading-tight">Smart PDS</p>
              <p className="text-gray-400 text-xs">Distribution System</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-primary-700">Features</a>
            <a href="#workflow" className="hover:text-primary-700">How it Works</a>
            <a href="#roles" className="hover:text-primary-700">Roles</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">Login</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">Register</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-accent-500/20 text-accent-300 text-xs font-semibold px-3 py-1 rounded-full border border-accent-500/30 mb-6">
            Government of Maharashtra — Digital PDS Initiative
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            Smart Public Distribution System
          </h1>
          <p className="text-blue-200 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Digitalizing essential commodity distribution for transparency, efficiency and accountability.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-3 rounded-xl transition flex items-center gap-2">
              Login to System <ArrowRight size={18}/>
            </Link>
            <a href="#workflow" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl transition">
              Explore System
            </a>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-16 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Distribution Workflow</h2>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {workflow.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="bg-white border-2 border-primary-200 rounded-xl px-5 py-3 text-center">
                  <p className="text-xs text-primary-400 font-medium">Step {i+1}</p>
                  <p className="font-bold text-primary-800 text-sm">{step}</p>
                </div>
                {i < workflow.length - 1 && <div className="text-primary-300 font-bold text-xl">↓</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">Key Features</h2>
          <p className="text-center text-gray-500 mb-12">Everything you need to manage public distribution at scale</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-16 bg-primary-900 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-10">Who Uses Smart PDS?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role:'Beneficiary', color:'bg-blue-500', icon:<Users size={24}/>, desc:'View entitlements, track distributions and receive notifications.' },
              { role:'Distributor', color:'bg-purple-500', icon:<Boxes size={24}/>, desc:'Manage shop inventory and record commodity distributions.' },
              { role:'Govt. Official', color:'bg-orange-500', icon:<BarChart2 size={24}/>, desc:'Monitor system-wide data, analytics and reports.' },
              { role:'Administrator', color:'bg-green-500', icon:<ShieldCheck size={24}/>, desc:'Full system access including user and commodity management.' },
            ].map(r => (
              <div key={r.role} className="bg-white/10 rounded-xl p-5 text-center border border-white/10">
                <div className={`w-12 h-12 ${r.color} rounded-full flex items-center justify-center text-white mx-auto mb-3`}>{r.icon}</div>
                <h3 className="text-white font-semibold mb-2">{r.role}</h3>
                <p className="text-blue-200 text-xs leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo accounts */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Try the Demo</h2>
          <p className="text-gray-500 mb-8">Use these accounts to explore the system with pre-loaded data</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Role</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Administrator',   'admin@smartpds.local',       'Admin@1234'],
                  ['Govt. Official',  'official@smartpds.local',    'Official@1234'],
                  ['Distributor',     'distributor@smartpds.local', 'Dist@1234'],
                  ['Beneficiary',     'beneficiary@smartpds.local', 'Ben@1234'],
                ].map(([role, email, pass]) => (
                  <tr key={role} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{role}</td>
                    <td className="table-cell text-primary-700 font-mono text-xs">{email}</td>
                    <td className="table-cell font-mono text-xs">{pass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8">
            <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base">
              Login Now <ArrowRight size={18}/>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 px-4 text-center text-sm">
        <p>© 2026 Smart Public Distribution System — Digital India Initiative</p>
        <p className="mt-1 text-xs">Built for transparency, efficiency and accountability in essential commodity distribution.</p>
      </footer>
    </div>
  );
}
