import { useEffect, useState } from 'react';
import { transactionService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { formatDate, statusColor } from '../../utils/helpers';
import { Transaction } from '../../types';

export default function AdminTransactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = () => {
    setLoading(true);
    transactionService.getAll({ page, limit: 15, search, ...(status && { status }) })
      .then(r => { setData(r.data.data || []); setTotalPages(r.data.pagination?.totalPages || 1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, status]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
      <div className="flex gap-2 flex-wrap">
        <input className="input w-64" placeholder="Search transaction ID or name..." value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(1), load())}/>
        <select className="input w-44" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button onClick={() => { setPage(1); load(); }} className="btn-secondary">Filter</button>
      </div>
      <div className="card">
        {loading ? <LoadingSpinner /> : data.length === 0 ? <EmptyState title="No transactions found"/> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Txn ID</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Beneficiary</th>
                  <th className="table-header">Card</th>
                  <th className="table-header">Shop</th>
                  <th className="table-header">Commodity</th>
                  <th className="table-header">Qty</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="table-cell font-mono text-xs text-primary-700">{t.transactionId}</td>
                      <td className="table-cell text-xs">{formatDate(t.createdAt)}</td>
                      <td className="table-cell text-xs">{t.beneficiary?.user?.firstName} {t.beneficiary?.user?.lastName}</td>
                      <td className="table-cell text-xs">{t.rationCard?.cardNumber}</td>
                      <td className="table-cell text-xs">{t.shop?.name}</td>
                      <td className="table-cell">{t.commodity?.name}</td>
                      <td className="table-cell">{t.quantity} {t.commodity?.unit}</td>
                      <td className="table-cell">₹{t.totalAmount.toFixed(2)}</td>
                      <td className="table-cell"><span className={`badge ${statusColor[t.status]}`}>{t.status}</span></td>
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
