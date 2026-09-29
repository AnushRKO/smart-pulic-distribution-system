import { format, parseISO } from 'date-fns';
import { TransactionStatus, InventoryStatus, RationCardType, ShopStatus, Role } from '../types';

export const formatDate = (d?: string | Date | null) => {
  if (!d) return '—';
  try { return format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy'); }
  catch { return '—'; }
};

export const formatDateTime = (d?: string | Date | null) => {
  if (!d) return '—';
  try { return format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy, hh:mm a'); }
  catch { return '—'; }
};

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

export const statusColor: Record<TransactionStatus, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
  FAILED:    'bg-red-100 text-red-700',
};

export const inventoryStatusColor: Record<InventoryStatus, string> = {
  AVAILABLE:    'bg-green-100 text-green-700',
  LOW_STOCK:    'bg-yellow-100 text-yellow-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700',
};

export const cardTypeLabel: Record<RationCardType, string> = {
  APL: 'Above Poverty Line',
  BPL: 'Below Poverty Line',
  AAY: 'Antyodaya Anna Yojana',
  PHH: 'Priority Household',
};

export const shopStatusColor: Record<ShopStatus, string> = {
  ACTIVE:    'bg-green-100 text-green-700',
  INACTIVE:  'bg-gray-100 text-gray-600',
  SUSPENDED: 'bg-red-100 text-red-700',
};

export const roleLabel: Record<Role, string> = {
  BENEFICIARY:         'Beneficiary',
  DISTRIBUTOR:         'Distributor',
  GOVERNMENT_OFFICIAL: 'Govt. Official',
  ADMINISTRATOR:       'Administrator',
};

export const roleColor: Record<Role, string> = {
  BENEFICIARY:         'bg-blue-100 text-blue-700',
  DISTRIBUTOR:         'bg-purple-100 text-purple-700',
  GOVERNMENT_OFFICIAL: 'bg-orange-100 text-orange-700',
  ADMINISTRATOR:       'bg-red-100 text-red-700',
};

export const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
