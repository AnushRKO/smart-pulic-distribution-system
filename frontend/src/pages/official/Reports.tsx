import { useEffect, useState } from 'react';
import { reportService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { inventoryStatusColor } from '../../utils/helpers';

export default function OfficialReports() {
  const [stockData, setStockData] = useState<any>(null);
  const [benData, setBenData] = useState<any>(null);
  const [distData, setDistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stock' | 'beneficiary' | 'distribution'>('stock');

  useEffect(() => {
    Promise.all([
      reportService.getStock(),
      reportService.getBeneficiaries(),
      reportService.getDistribution(),
    ]).then(([s, b, d]) => {
      setStockData(s.data.data);
      setBenData(b.data.data);
      setDistData(d.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Reports</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['stock','beneficiary','distribution'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? 'bg-white shadow-sm text-primary-700' : 'text-gray-600 hover:text-gray-800'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'stock' && stockData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ['Total Items', stockData.summary.totalItems],
              ['Available', stockData.summary.totalAvailable?.toFixed(0) + ' units'],
              ['Distributed', stockData.summary.totalDistributed?.toFixed(0) + ' units'],
              ['Low/Out of Stock', stockData.summary.lowStock + ' / ' + stockData.summary.outOfStock],
            ].map(([k, v]) => (
              <div key={k} className="card p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{v}</p>
                <p className="text-xs text-gray-500 mt-1">{k}</p>
              </div>
            ))}
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>
                <th className="table-header">Commodity</th>
                <th className="table-header">Shop</th>
                <th className="table-header">Available</th>
                <th className="table-header">Distributed</th>
                <th className="table-header">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {(stockData.inventory || []).map((i: any) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{i.commodity?.name}</td>
                    <td className="table-cell text-xs">{i.shop?.name}</td>
                    <td className="table-cell">{i.availableStock} {i.commodity?.unit}</td>
                    <td className="table-cell">{i.distributedStock} {i.commodity?.unit}</td>
                    <td className="table-cell"><span className={`badge ${inventoryStatusColor[i.status]}`}>{i.status.replace('_',' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'beneficiary' && benData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[['Total', benData.total], ['Active', benData.active], ['Inactive', benData.inactive]].map(([k,v]) => (
              <div key={k} className="card p-4 text-center">
                <p className="text-2xl font-bold">{v}</p>
                <p className="text-xs text-gray-500 mt-1">{k} Beneficiaries</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="font-semibold mb-3">By District</h3>
              {(benData.byDistrict || []).map((d: any) => (
                <div key={d.district} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                  <span>{d.district || 'Unknown'}</span>
                  <span className="font-semibold">{d._count.id}</span>
                </div>
              ))}
            </div>
            <div className="card p-4">
              <h3 className="font-semibold mb-3">By Card Type</h3>
              {(benData.byCardType || []).map((d: any) => (
                <div key={d.cardType} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                  <span className="badge bg-blue-100 text-blue-700">{d.cardType}</span>
                  <span className="font-semibold">{d._count.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'distribution' && distData && (
        <div className="space-y-4">
          <div className="card p-4 text-center w-40">
            <p className="text-2xl font-bold">{distData.total}</p>
            <p className="text-xs text-gray-500">Total Distributions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="font-semibold mb-3">By Commodity</h3>
              {(distData.byCommodity || []).map((d: any) => (
                <div key={d.commodityId} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                  <span>{d.commodityName}</span>
                  <span className="font-semibold">{d._sum.quantity?.toFixed(1)} {d.unit}</span>
                </div>
              ))}
            </div>
            <div className="card p-4">
              <h3 className="font-semibold mb-3">By Shop</h3>
              {(distData.byShop || []).map((d: any) => (
                <div key={d.shopId} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                  <span>{d.shopName}</span>
                  <span className="font-semibold">{d._count.id} distributions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
