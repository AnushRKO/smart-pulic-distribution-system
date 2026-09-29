import { useEffect, useState } from 'react';
import { reportService } from '../../services';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { inventoryStatusColor, monthNames } from '../../utils/helpers';

export default function AdminReports() {
  const [tab, setTab] = useState<'stock'|'beneficiary'|'distribution'|'transaction'>('stock');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'stock') res = await reportService.getStock();
      else if (tab === 'beneficiary') res = await reportService.getBeneficiaries();
      else if (tab === 'distribution') res = await reportService.getDistribution();
      else res = await reportService.getTransactions();
      setData(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const tabs = [
    {key:'stock', label:'Stock'},
    {key:'beneficiary', label:'Beneficiaries'},
    {key:'distribution', label:'Distribution'},
    {key:'transaction', label:'Transactions'},
  ] as const;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Reports</h1>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? 'bg-white shadow-sm text-primary-700' : 'text-gray-600 hover:text-gray-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : !data ? null : (
        <>
          {tab === 'stock' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[['Total Items', data.summary.totalItems],['Available', data.summary.totalAvailable?.toFixed(0)+' units'],['Distributed', data.summary.totalDistributed?.toFixed(0)+' units'],['Alerts', (data.summary.lowStock||0)+(data.summary.outOfStock||0)]].map(([k,v])=>(
                  <div key={k} className="card p-4 text-center"><p className="text-2xl font-bold">{v}</p><p className="text-xs text-gray-500 mt-1">{k}</p></div>
                ))}
              </div>
              <div className="card overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50"><tr>
                    <th className="table-header">Commodity</th><th className="table-header">Shop</th>
                    <th className="table-header">Available</th><th className="table-header">Distributed</th>
                    <th className="table-header">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.inventory?.map((i: any) => (
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

          {tab === 'beneficiary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[['Total',data.total],['Active',data.active],['Inactive',data.inactive]].map(([k,v])=>(
                  <div key={k} className="card p-4 text-center"><p className="text-2xl font-bold">{v}</p><p className="text-xs text-gray-500 mt-1">{k}</p></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4">
                  <h3 className="font-semibold mb-3">By District</h3>
                  {data.byDistrict?.map((d: any) => (
                    <div key={d.district} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                      <span>{d.district||'Unknown'}</span><span className="font-semibold">{d._count.id}</span>
                    </div>
                  ))}
                </div>
                <div className="card p-4">
                  <h3 className="font-semibold mb-3">By Card Type</h3>
                  {data.byCardType?.map((d: any) => (
                    <div key={d.cardType} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                      <span className="badge bg-blue-100 text-blue-700">{d.cardType}</span>
                      <span className="font-semibold">{d._count.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'distribution' && (
            <div className="space-y-4">
              <div className="card p-4 text-center w-36"><p className="text-2xl font-bold">{data.total}</p><p className="text-xs text-gray-500">Total Distributions</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4">
                  <h3 className="font-semibold mb-3">By Commodity</h3>
                  {data.byCommodity?.map((d: any) => (
                    <div key={d.commodityId} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                      <span>{d.commodityName}</span><span className="font-semibold">{d._sum.quantity?.toFixed(1)} {d.unit}</span>
                    </div>
                  ))}
                </div>
                <div className="card p-4">
                  <h3 className="font-semibold mb-3">By Shop</h3>
                  {data.byShop?.map((d: any) => (
                    <div key={d.shopId} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                      <span>{d.shopName}</span><span className="font-semibold">{d._count.id} distributions</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'transaction' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[['Total',data.total],['Total Amount','₹'+data.totalAmount?.toFixed(2)]].map(([k,v])=>(
                  <div key={k} className="card p-4 text-center"><p className="text-2xl font-bold">{v}</p><p className="text-xs text-gray-500 mt-1">{k}</p></div>
                ))}
              </div>
              <div className="card p-4">
                <h3 className="font-semibold mb-3">By Month</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr><th className="table-header">Month</th><th className="table-header">Count</th><th className="table-header">Quantity</th><th className="table-header">Amount</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.byMonth?.map((m: any) => (
                        <tr key={`${m.year}-${m.month}`} className="hover:bg-gray-50">
                          <td className="table-cell">{monthNames[m.month-1]} {m.year}</td>
                          <td className="table-cell">{m._count.id}</td>
                          <td className="table-cell">{m._sum.quantity?.toFixed(1)}</td>
                          <td className="table-cell">₹{m._sum.totalAmount?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
