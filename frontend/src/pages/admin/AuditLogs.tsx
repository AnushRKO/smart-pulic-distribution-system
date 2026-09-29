import { useEffect, useState } from 'react';
import { reportService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { formatDateTime, roleLabel } from '../../utils/helpers';
import { AuditLog } from '../../types';

export default function AdminAuditLogs() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState('');

  const load = () => {
    setLoading(true);
    reportService.getAuditLogs({ page, limit: 20, ...(action && { action }) })
      .then(r => {
        setData(r.data.data?.data || []);
        setTotalPages(r.data.data?.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, action]);

  const actionBadgeColor: Record<string, string> = {
    LOGIN: 'bg-blue-100 text-blue-700', LOGOUT: 'bg-gray-100 text-gray-600',
    USER_CREATED: 'bg-green-100 text-green-700', USER_UPDATED: 'bg-yellow-100 text-yellow-700',
    DISTRIBUTION_CREATED: 'bg-purple-100 text-purple-700', STOCK_ADDED: 'bg-teal-100 text-teal-700',
    BENEFICIARY_CREATED: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>
        <select className="input w-56" value={action} onChange={e => { setAction(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          {['LOGIN','LOGOUT','USER_CREATED','USER_UPDATED','DISTRIBUTION_CREATED','STOCK_ADDED','BENEFICIARY_CREATED','COMMODITY_UPDATED','SHOP_CREATED'].map(a => (
            <option key={a} value={a}>{a.replace(/_/g,' ')}</option>
          ))}
        </select>
      </div>
      <div className="card">
        {loading ? <LoadingSpinner /> : data.length === 0 ? <EmptyState title="No audit logs"/> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">Performed By</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Entity</th>
                  <th className="table-header">Description</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="table-cell text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="table-cell text-xs">
                        {log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : '—'}
                        {log.performedBy && <p className="text-gray-400">{roleLabel[log.performedBy.role as any]}</p>}
                      </td>
                      <td className="table-cell">
                        <span className={`badge text-xs ${actionBadgeColor[log.action] || 'bg-gray-100 text-gray-600'}`}>{log.action.replace(/_/g,' ')}</span>
                      </td>
                      <td className="table-cell text-xs text-gray-600">{log.entity || '—'}</td>
                      <td className="table-cell text-xs">{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3"><Pagination page={page} totalPages={totalPages} onPageChange={setPage}/></div>
          </>
        )}
      </div>
    </div>
  );
}
