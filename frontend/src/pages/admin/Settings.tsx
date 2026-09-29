import { useState } from 'react';
import { Settings, Info } from 'lucide-react';

export default function AdminSettings() {
  const [tab, setTab] = useState<'general'|'security'|'notifications'>('general');

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Settings size={22}/> System Settings
      </h1>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['general','security','notifications'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? 'bg-white shadow-sm text-primary-700' : 'text-gray-600 hover:text-gray-800'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">General Settings</h2>
          {[
            ['System Name', 'Smart Public Distribution System'],
            ['State', 'Maharashtra'],
            ['Distribution Cycle', 'Monthly'],
            ['Support Email', 'support@smartpds.gov.in'],
            ['System Version', '1.0.0'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">{k}</span>
              <span className="text-sm text-gray-500">{v}</span>
            </div>
          ))}
          <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0"/>
            <p className="text-xs text-blue-700">System settings are managed via the <code className="bg-blue-100 px-1 rounded">.env</code> file and database <code className="bg-blue-100 px-1 rounded">system_settings</code> table.</p>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Security Configuration</h2>
          {[
            ['JWT Expiry', '24 hours'],
            ['Password Min Length', '6 characters'],
            ['Rate Limit', '500 requests / 15 min'],
            ['CORS Origin', 'http://localhost:5173 (dev)'],
            ['Auth Method', 'JWT Bearer Token'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">{k}</span>
              <span className="text-sm text-gray-500 font-mono">{v}</span>
            </div>
          ))}
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-700">⚠ Change <code>JWT_SECRET</code> in production. Never commit <code>.env</code> to version control.</p>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Notification Settings</h2>
          {[
            ['In-App Notifications', 'Enabled ✓'],
            ['Email Provider', 'Mock (Development)'],
            ['SMS Provider', 'Mock (Development)'],
            ['Low Stock Threshold', '100 units'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">{k}</span>
              <span className="text-sm text-gray-500">{v}</span>
            </div>
          ))}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-700">Configure real email (EMAIL_HOST, EMAIL_USER) and SMS (SMS_API_KEY) providers in the <code>.env</code> file to enable actual delivery.</p>
          </div>
        </div>
      )}
    </div>
  );
}
