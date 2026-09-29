import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime } from '../../utils/helpers';
import { Notification } from '../../types';
import toast from 'react-hot-toast';

const typeColors: Record<string, string> = {
  DISTRIBUTION_COMPLETED: 'bg-green-100 text-green-700',
  STOCK_AVAILABLE: 'bg-blue-100 text-blue-700',
  LOW_STOCK: 'bg-yellow-100 text-yellow-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
  SYSTEM: 'bg-gray-100 text-gray-700',
  ACCOUNT: 'bg-purple-100 text-purple-700',
  ALERT: 'bg-orange-100 text-orange-700',
};

export default function BeneficiaryNotifications() {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationService.getAll({ limit: 50 })
      .then(r => setData(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await notificationService.markAllRead();
    toast.success('All marked as read');
    load();
  };

  const markOne = async (id: string) => {
    await notificationService.markRead(id);
    setData(d => d.map(n => n.id === id ? {...n, status: 'READ'} : n));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        {data.some(n => n.status === 'UNREAD') && (
          <button onClick={markAll} className="flex items-center gap-1.5 text-sm text-primary-700 hover:underline">
            <CheckCheck size={16}/> Mark all as read
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <EmptyState title="No notifications" icon={<Bell size={24} className="text-gray-400"/>}/>
      ) : (
        <div className="space-y-2">
          {data.map(n => (
            <div key={n.id}
              onClick={() => n.status === 'UNREAD' && markOne(n.id)}
              className={`card p-4 cursor-pointer transition-colors ${n.status === 'UNREAD' ? 'border-l-4 border-l-primary-500 bg-blue-50/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge text-xs ${typeColors[n.type] || 'bg-gray-100 text-gray-600'}`}>{n.type.replace(/_/g,' ')}</span>
                    {n.status === 'UNREAD' && <span className="w-2 h-2 rounded-full bg-primary-600 inline-block"/>}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
