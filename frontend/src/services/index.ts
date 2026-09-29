import api from '../utils/api';

// ── Auth ──────────────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: object) => api.put('/auth/change-password', data),
  updateProfile: (data: object) => api.put('/auth/profile', data),
};

// ── Users ─────────────────────────────────────────────────────────────
export const userService = {
  getAll: (params?: object) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: object) => api.post('/users', data),
  update: (id: string, data: object) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  resetPassword: (id: string, data: object) => api.post(`/users/${id}/reset-password`, data),
};

// ── Beneficiaries ─────────────────────────────────────────────────────
export const beneficiaryService = {
  getAll: (params?: object) => api.get('/beneficiaries', { params }),
  getById: (id: string) => api.get(`/beneficiaries/${id}`),
  verifyByCard: (cardNumber: string) => api.get(`/beneficiaries/verify/${cardNumber}`),
  create: (data: object) => api.post('/beneficiaries', data),
  update: (id: string, data: object) => api.put(`/beneficiaries/${id}`, data),
};

// ── Commodities ───────────────────────────────────────────────────────
export const commodityService = {
  getAll: (params?: object) => api.get('/commodities', { params }),
  getById: (id: string) => api.get(`/commodities/${id}`),
  create: (data: object) => api.post('/commodities', data),
  update: (id: string, data: object) => api.put(`/commodities/${id}`, data),
};

// ── Shops ─────────────────────────────────────────────────────────────
export const shopService = {
  getAll: (params?: object) => api.get('/shops', { params }),
  getById: (id: string) => api.get(`/shops/${id}`),
  create: (data: object) => api.post('/shops', data),
  update: (id: string, data: object) => api.put(`/shops/${id}`, data),
};

// ── Inventory ─────────────────────────────────────────────────────────
export const inventoryService = {
  getAll: (params?: object) => api.get('/inventory', { params }),
  getById: (id: string) => api.get(`/inventory/${id}`),
  getSummary: () => api.get('/inventory/summary'),
  addStock: (data: object) => api.post('/inventory', data),
  updateThreshold: (id: string, data: object) => api.put(`/inventory/${id}/threshold`, data),
};

// ── Distributions ─────────────────────────────────────────────────────
export const distributionService = {
  getAll: (params?: object) => api.get('/distributions', { params }),
  getById: (id: string) => api.get(`/distributions/${id}`),
  create: (data: object) => api.post('/distributions', data),
};

// ── Transactions ──────────────────────────────────────────────────────
export const transactionService = {
  getAll: (params?: object) => api.get('/transactions', { params }),
  getById: (id: string) => api.get(`/transactions/${id}`),
  getStats: () => api.get('/transactions/stats'),
};

// ── Notifications ─────────────────────────────────────────────────────
export const notificationService = {
  getAll: (params?: object) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
};

// ── Reports ───────────────────────────────────────────────────────────
export const reportService = {
  getStock: (params?: object) => api.get('/reports/stock', { params }),
  getBeneficiaries: (params?: object) => api.get('/reports/beneficiaries', { params }),
  getDistribution: (params?: object) => api.get('/reports/distribution', { params }),
  getTransactions: (params?: object) => api.get('/reports/transactions', { params }),
  getAnalytics: () => api.get('/reports/analytics'),
  getAdminDashboard: () => api.get('/reports/admin-dashboard'),
  getAuditLogs: (params?: object) => api.get('/reports/audit-logs', { params }),
};
