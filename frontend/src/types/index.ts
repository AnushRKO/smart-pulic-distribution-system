export type Role = 'BENEFICIARY' | 'DISTRIBUTOR' | 'GOVERNMENT_OFFICIAL' | 'ADMINISTRATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'FAILED';
export type InventoryStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type RationCardType = 'APL' | 'BPL' | 'AAY' | 'PHH';
export type RationCardStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
export type NotificationType = 'STOCK_AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISTRIBUTION_COMPLETED' | 'ACCOUNT' | 'SYSTEM' | 'ALERT';
export type NotificationStatus = 'UNREAD' | 'READ';
export type ShopStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string; email: string; firstName: string; lastName: string;
  phone?: string; role: Role; status: UserStatus;
  lastLoginAt?: string; createdAt: string;
  beneficiary?: Beneficiary; distributor?: Distributor;
}

export interface Beneficiary {
  id: string; userId: string; beneficiaryId: string;
  dateOfBirth?: string; gender?: string; address?: string;
  district?: string; state?: string; pincode?: string;
  aadharNumber?: string; isActive: boolean; createdAt: string;
  user?: { firstName: string; lastName: string; email: string; phone?: string };
  rationCard?: RationCard; transactions?: Transaction[];
}

export interface RationCard {
  id: string; cardNumber: string; cardType: RationCardType;
  beneficiaryId: string; assignedShopId?: string;
  issueDate: string; expiryDate?: string; status: RationCardStatus;
  assignedShop?: Shop; familyMembers?: FamilyMember[];
  entitlements?: Entitlement[];
}

export interface FamilyMember {
  id: string; rationCardId: string; name: string;
  dateOfBirth?: string; gender?: string; relationship: string; aadharNumber?: string;
}

export interface Distributor {
  id: string; userId: string; distributorId: string;
  licenseNumber?: string; shops?: Shop[];
}

export interface Shop {
  id: string; shopId: string; name: string; address: string;
  area?: string; district?: string; state?: string;
  phone?: string; distributorId?: string; status: ShopStatus;
  distributor?: Distributor; inventory?: Inventory[];
  _count?: { rationCards: number };
}

export interface Commodity {
  id: string; commodityCode: string; name: string;
  unit: string; description?: string;
  subsidizedRate: number; marketRate?: number; status: string;
}

export interface Inventory {
  id: string; shopId: string; commodityId: string;
  openingStock: number; receivedStock: number;
  distributedStock: number; availableStock: number;
  threshold: number; status: InventoryStatus;
  shop?: { id: string; name: string; shopId: string; district?: string };
  commodity?: { id: string; name: string; commodityCode: string; unit: string };
}

export interface Entitlement {
  id: string; rationCardId: string; commodityId: string;
  monthlyQuota: number; collectedThisMonth: number;
  lastResetDate: string; isActive: boolean;
  commodity?: Commodity;
}

export interface Distribution {
  id: string; distributionId: string; beneficiaryId: string;
  shopId: string; commodityId: string; quantity: number;
  distributedById?: string; notes?: string; createdAt: string;
  beneficiary?: Beneficiary; shop?: Shop; commodity?: Commodity;
  transaction?: Transaction;
}

export interface Transaction {
  id: string; transactionId: string; beneficiaryId: string;
  rationCardId: string; shopId: string; commodityId: string;
  distributionId?: string; quantity: number; unitPrice: number;
  totalAmount: number; status: TransactionStatus;
  month: number; year: number; notes?: string; createdAt: string;
  beneficiary?: Beneficiary;
  rationCard?: RationCard;
  shop?: { name: string; shopId: string };
  commodity?: { name: string; unit: string };
}

export interface Notification {
  id: string; userId: string; type: NotificationType;
  title: string; message: string;
  status: NotificationStatus; createdAt: string;
}

export interface AuditLog {
  id: string; userId?: string; performedById?: string;
  action: string; entity?: string; entityId?: string;
  description: string; ipAddress?: string; createdAt: string;
  performedBy?: { firstName: string; lastName: string; role: string; email: string };
}

export interface PaginatedResponse<T> {
  success: boolean; message: string; data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiResponse<T> {
  success: boolean; message: string; data: T;
}
