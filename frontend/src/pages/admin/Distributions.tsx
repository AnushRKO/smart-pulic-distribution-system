import { useEffect, useState } from 'react';
import { distributionService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { formatDateTime } from '../../utils/helpers';
import { Distribution } from '../../types';

export default function AdminDistributions() {
  const [data, setData] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    distributionService.getAll({ page, limit: 15 })
      .then(r => { setData(r.data.data || []); setTotalPages(r.data.pagination?.totalPages || 1); })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Distribution Records</h1>
      <div className="card">
        {data.length === 0 ? <EmptyState title="No distributions"/> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Distribution ID</th>
                  <th className="table-header">Beneficiary</th>
                  <th className="table-header">Shop</th>
                  <th className="table-header">Commodity</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Txn ID</th>
                  <th className="table-header">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="table-cell font-mono text-xs text-primary-700">{d.distributionId}</td>
                      <td className="table-cell text-xs">{d.beneficiary?.user?.firstName} {d.beneficiary?.user?.lastName}</td>
                      <td className="table-cell text-xs">{d.shop?.name}</td>
                      <td className="table-cell">{d.commodity?.name}</td>
                      <td className="table-cell">{d.quantity} {d.commodity?.unit}</td>
                      <td className="table-cell font-mono text-xs">{d.transaction?.transactionId || '—'}</td>
                      <td className="table-cell text-xs text-gray-500">{formatDateTime(d.createdAt)}</td>
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
