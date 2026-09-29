import { useEffect, useState } from 'react';
import { transactionService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { formatDate, statusColor } from '../../utils/helpers';
import { Transaction } from '../../types';

export default function BeneficiaryTransactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    transactionService.getAll({ page, limit: 10 })
      .then(r => {
        setData(r.data.data || []);
        setTotalPages(r.data.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Transactions</h1>
      <div className="card">
        {data.length === 0 ? (
          <EmptyState title="No transactions" description="Your distribution history will appear here."/>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Transaction ID</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Shop</th>
                  <th className="table-header">Commodity</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="table-cell font-mono text-xs text-primary-700">{t.transactionId}</td>
                      <td className="table-cell">{formatDate(t.createdAt)}</td>
                      <td className="table-cell">{t.shop?.name}</td>
                      <td className="table-cell">{t.commodity?.name}</td>
                      <td className="table-cell">{t.quantity} {t.commodity?.unit}</td>
                      <td className="table-cell">₹{t.totalAmount.toFixed(2)}</td>
                      <td className="table-cell">
                        <span className={`badge ${statusColor[t.status]}`}>{t.status}</span>
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
    </div>
  );
}
