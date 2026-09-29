import { useEffect, useState } from 'react';
import { beneficiaryService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { Beneficiary } from '../../types';

export default function OfficialBeneficiaries() {
  const [data, setData] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    beneficiaryService.getAll({ page, limit: 15, search })
      .then(r => { setData(r.data.data || []); setTotalPages(r.data.pagination?.totalPages || 1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Beneficiaries</h1>
        <div className="flex gap-2">
          <input className="input w-64" placeholder="Search name or ID..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (setPage(1), load())}/>
          <button onClick={() => { setPage(1); load(); }} className="btn-secondary">Search</button>
        </div>
      </div>
      <div className="card">
        {data.length === 0 ? <EmptyState title="No beneficiaries found"/> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50"><tr>
                  <th className="table-header">Beneficiary ID</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Ration Card</th>
                  <th className="table-header">District</th>
                  <th className="table-header">Card Type</th>
                  <th className="table-header">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="table-cell font-mono text-xs text-primary-700">{b.beneficiaryId}</td>
                      <td className="table-cell font-medium">{b.user?.firstName} {b.user?.lastName}</td>
                      <td className="table-cell text-xs">{b.rationCard?.cardNumber || '—'}</td>
                      <td className="table-cell">{b.district || '—'}</td>
                      <td className="table-cell"><span className="badge bg-blue-100 text-blue-700">{b.rationCard?.cardType || '—'}</span></td>
                      <td className="table-cell">
                        <span className={`badge ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </span>
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
