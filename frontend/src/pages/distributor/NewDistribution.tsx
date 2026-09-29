import { useState } from 'react';
import { CheckCircle, Search, ArrowRight, Printer } from 'lucide-react';
import { beneficiaryService, distributionService, inventoryService } from '../../services';
import { useAuthStore } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { formatDateTime, cardTypeLabel } from '../../utils/helpers';
import { RationCard, Inventory, Transaction } from '../../types';

type Step = 1 | 2 | 3 | 4;

export default function NewDistribution() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [cardNumber, setCardNumber] = useState('');
  const [rationCard, setRationCard] = useState<RationCard | null>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ transaction: Transaction } | null>(null);
  const [verifyError, setVerifyError] = useState('');

  // Step 1: Verify ration card
  const verifyCard = async () => {
    if (!cardNumber.trim()) return;
    setLoading(true); setVerifyError('');
    try {
      const res = await beneficiaryService.verifyByCard(cardNumber.trim());
      const rc = res.data.data as RationCard;
      setRationCard(rc);

      // Load inventory for assigned shop
      if (rc.assignedShop?.id) {
        setSelectedShop(rc.assignedShop.id);
        const invRes = await inventoryService.getAll({ shopId: rc.assignedShop.id, limit: 50 });
        setInventory(invRes.data.data || []);
      }
      setStep(2);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setVerifyError(e.response?.data?.message || 'Ration card not found');
    } finally { setLoading(false); }
  };

  // Step 3: Submit distribution
  const submitDistribution = async () => {
    if (!rationCard || !selectedCommodity || !selectedShop || !quantity) return;
    setLoading(true);
    try {
      const res = await distributionService.create({
        rationCardNumber: cardNumber,
        commodityId: selectedCommodity,
        shopId: selectedShop,
        quantity: parseFloat(quantity),
      });
      setResult(res.data.data);
      setStep(4);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || 'Distribution failed');
    } finally { setLoading(false); }
  };

  const reset = () => {
    setStep(1); setCardNumber(''); setRationCard(null);
    setInventory([]); setSelectedCommodity(''); setQuantity('');
    setResult(null); setVerifyError('');
  };

  const selectedInv = inventory.find(i => i.commodityId === selectedCommodity);
  const selectedEnt = rationCard?.entitlements?.find(e => e.commodityId === selectedCommodity);
  const remaining = selectedEnt ? selectedEnt.monthlyQuota - selectedEnt.collectedThisMonth : 0;

  const stepLabels = ['Verify Card', 'Select Commodity', 'Confirm', 'Receipt'];

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900">New Distribution</h1>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i+1 ? 'bg-secondary-500 text-white' : step === i+1 ? 'bg-primary-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > i+1 ? '✓' : i+1}
            </div>
            <span className={`text-xs hidden sm:block ${step === i+1 ? 'text-primary-700 font-semibold' : 'text-gray-400'}`}>{label}</span>
            {i < stepLabels.length - 1 && <div className={`flex-1 h-0.5 ${step > i+1 ? 'bg-secondary-400' : 'bg-gray-200'}`}/>}
          </div>
        ))}
      </div>

      {/* Step 1: Verify */}
      {step === 1 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Step 1: Enter Ration Card Number</h2>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="RC-2026-000001" value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyCard()}/>
            <button onClick={verifyCard} disabled={loading} className="btn-primary flex items-center gap-2">
              <Search size={16}/> {loading ? '...' : 'Verify'}
            </button>
          </div>
          {verifyError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{verifyError}</p>}
        </div>
      )}

      {/* Step 2: Beneficiary details + commodity */}
      {step === 2 && rationCard && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Step 2: Beneficiary Details</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="text-secondary-600" size={18}/>
              <span className="font-semibold text-secondary-700">Beneficiary Verified</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-gray-500">Name</p><p className="font-medium">{rationCard.beneficiary?.user?.firstName} {rationCard.beneficiary?.user?.lastName}</p></div>
              <div><p className="text-gray-500">Card Number</p><p className="font-medium">{rationCard.cardNumber}</p></div>
              <div><p className="text-gray-500">Card Type</p><p className="font-medium">{cardTypeLabel[rationCard.cardType]}</p></div>
              <div><p className="text-gray-500">Assigned Shop</p><p className="font-medium">{rationCard.assignedShop?.name}</p></div>
              <div><p className="text-gray-500">Family Members</p><p className="font-medium">{rationCard.familyMembers?.length || 0}</p></div>
            </div>
          </div>

          <div>
            <label className="label">Select Commodity</label>
            <select className="input" value={selectedCommodity} onChange={e => setSelectedCommodity(e.target.value)}>
              <option value="">-- Select Commodity --</option>
              {(rationCard.entitlements || []).filter(e => e.isActive).map(e => {
                const inv = inventory.find(i => i.commodityId === e.commodityId);
                const rem = e.monthlyQuota - e.collectedThisMonth;
                return (
                  <option key={e.commodityId} value={e.commodityId} disabled={rem <= 0 || !inv || inv.availableStock <= 0}>
                    {e.commodity?.name} — Remaining: {rem} {e.commodity?.unit}
                    {(!inv || inv.availableStock <= 0) ? ' (OUT OF STOCK)' : rem <= 0 ? ' (FULLY COLLECTED)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedCommodity && (
            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-3">
              <div><p className="text-gray-500">Available Stock</p><p className="font-medium">{selectedInv?.availableStock || 0} {selectedInv?.commodity?.unit}</p></div>
              <div><p className="text-gray-500">Entitlement Remaining</p><p className="font-medium text-primary-700">{remaining} {selectedEnt?.commodity?.unit}</p></div>
            </div>
          )}

          <div>
            <label className="label">Quantity</label>
            <input type="number" className="input" value={quantity}
              onChange={e => setQuantity(e.target.value)}
              min={0.1} step={0.1}
              max={Math.min(remaining, selectedInv?.availableStock || 0)}
              placeholder="Enter quantity"/>
            {selectedCommodity && <p className="text-xs text-gray-500 mt-1">Max: {Math.min(remaining, selectedInv?.availableStock || 0)} {selectedInv?.commodity?.unit}</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
            <button onClick={() => setStep(3)} disabled={!selectedCommodity || !quantity || parseFloat(quantity) <= 0}
              className="btn-primary flex items-center gap-2">
              Proceed <ArrowRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && rationCard && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Step 3: Confirm Distribution</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            {[
              ['Beneficiary', `${rationCard.beneficiary?.user?.firstName} ${rationCard.beneficiary?.user?.lastName}`],
              ['Ration Card', rationCard.cardNumber],
              ['Shop', rationCard.assignedShop?.name],
              ['Commodity', selectedInv?.commodity?.name],
              ['Quantity', `${quantity} ${selectedInv?.commodity?.unit}`],
              ['Distributor', `${user?.firstName} ${user?.lastName}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-800">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
            <button onClick={submitDistribution} disabled={loading} className="btn-success flex items-center gap-2">
              <CheckCircle size={16}/> {loading ? 'Processing...' : 'Confirm & Record'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Receipt */}
      {step === 4 && result && (
        <div className="card p-6 space-y-5">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="text-green-600" size={32}/>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Distribution Successful!</h2>
            <p className="text-gray-500 text-sm mt-1">Transaction recorded successfully</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm border">
            <div className="text-center mb-3">
              <p className="text-xs text-gray-500">Transaction ID</p>
              <p className="font-mono text-lg font-bold text-primary-700">{result.transaction.transactionId}</p>
            </div>
            {[
              ['Date & Time', formatDateTime(result.transaction.createdAt)],
              ['Beneficiary', `${rationCard?.beneficiary?.user?.firstName} ${rationCard?.beneficiary?.user?.lastName}`],
              ['Commodity', selectedInv?.commodity?.name],
              ['Quantity', `${result.transaction.quantity} ${selectedInv?.commodity?.unit}`],
              ['Amount', `₹${result.transaction.totalAmount.toFixed(2)}`],
              ['Status', result.transaction.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-800">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
              <Printer size={16}/> Print Receipt
            </button>
            <button onClick={reset} className="btn-primary">New Distribution</button>
          </div>
        </div>
      )}
    </div>
  );
}
