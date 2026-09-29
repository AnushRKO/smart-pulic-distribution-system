import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, Store, Boxes, Truck, FileText,
  BarChart2, Bell, Settings, LogOut, Menu, X, ChevronDown,
  ShieldCheck, ClipboardList, User, CreditCard, AlertTriangle, Home
} from 'lucide-react';
import { useAuthStore } from '../hooks/useAuth';
import { notificationService } from '../services';
import { roleLabel, roleColor } from '../utils/helpers';
import { Role } from '../types';
import toast from 'react-hot-toast';

interface NavItem { label: string; path: string; icon: React.ReactNode }

const navConfig: Record<Role, NavItem[]> = {
  BENEFICIARY: [
    { label: 'Dashboard',      path: '/beneficiary/dashboard',    icon: <LayoutDashboard size={18}/> },
    { label: 'My Profile',     path: '/beneficiary/profile',      icon: <User size={18}/> },
    { label: 'Transactions',   path: '/beneficiary/transactions', icon: <ClipboardList size={18}/> },
    { label: 'Notifications',  path: '/beneficiary/notifications',icon: <Bell size={18}/> },
  ],
  DISTRIBUTOR: [
    { label: 'Dashboard',      path: '/distributor/dashboard',        icon: <LayoutDashboard size={18}/> },
    { label: 'New Distribution', path: '/distributor/distribution/new', icon: <Truck size={18}/> },
    { label: 'Inventory',      path: '/distributor/inventory',       icon: <Boxes size={18}/> },
    { label: 'Transactions',   path: '/distributor/transactions',    icon: <ClipboardList size={18}/> },
  ],
  GOVERNMENT_OFFICIAL: [
    { label: 'Dashboard',      path: '/official/dashboard',      icon: <LayoutDashboard size={18}/> },
    { label: 'Beneficiaries',  path: '/official/beneficiaries',  icon: <Users size={18}/> },
    { label: 'Reports',        path: '/official/reports',        icon: <FileText size={18}/> },
    { label: 'Analytics',      path: '/official/analytics',      icon: <BarChart2 size={18}/> },
  ],
  ADMINISTRATOR: [
    { label: 'Dashboard',      path: '/admin/dashboard',      icon: <LayoutDashboard size={18}/> },
    { label: 'Users',          path: '/admin/users',          icon: <Users size={18}/> },
    { label: 'Beneficiaries',  path: '/admin/beneficiaries',  icon: <User size={18}/> },
    { label: 'Shops',          path: '/admin/shops',          icon: <Store size={18}/> },
    { label: 'Commodities',    path: '/admin/commodities',    icon: <Package size={18}/> },
    { label: 'Inventory',      path: '/admin/inventory',      icon: <Boxes size={18}/> },
    { label: 'Distributions',  path: '/admin/distributions',  icon: <Truck size={18}/> },
    { label: 'Transactions',   path: '/admin/transactions',   icon: <ClipboardList size={18}/> },
    { label: 'Reports',        path: '/admin/reports',        icon: <FileText size={18}/> },
    { label: 'Analytics',      path: '/admin/analytics',      icon: <BarChart2 size={18}/> },
    { label: 'Audit Logs',     path: '/admin/audit-logs',     icon: <ShieldCheck size={18}/> },
    { label: 'Settings',       path: '/admin/settings',       icon: <Settings size={18}/> },
  ],
};

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unread, setUnread] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = user ? navConfig[user.role] : [];

  useEffect(() => {
    notificationService.getUnreadCount()
      .then(r => setUnread(r.data.data.count))
      .catch(() => {});
    const interval = setInterval(() => {
      notificationService.getUnreadCount()
        .then(r => setUnread(r.data.data.count))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const basePath = user?.role === 'BENEFICIARY' ? '/beneficiary' :
    user?.role === 'DISTRIBUTOR' ? '/distributor' :
    user?.role === 'GOVERNMENT_OFFICIAL' ? '/official' : '/admin';

  const notifPath = user?.role === 'BENEFICIARY' ? '/beneficiary/notifications' :
    user?.role === 'DISTRIBUTOR' ? '/distributor/dashboard' :
    user?.role === 'GOVERNMENT_OFFICIAL' ? '/official/dashboard' : '/admin/dashboard';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'} lg:w-60 bg-primary-900 flex flex-col transition-all duration-300 flex-shrink-0 z-30`}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-primary-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Smart PDS</p>
              <p className="text-blue-300 text-xs">Distribution System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="px-3 py-4 border-t border-primary-700">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-primary-800">
            <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">{user?.firstName} {user?.lastName}</p>
              <span className={`badge text-xs ${user?.role ? roleColor[user.role] : ''}`}>
                {user?.role ? roleLabel[user.role] : ''}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-20 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 hidden lg:flex"
          >
            <Menu size={20}/>
          </button>

          <NavLink to="/" className="text-gray-400 hover:text-gray-600">
            <Home size={18}/>
          </NavLink>

          <div className="flex-1" />

          {/* Notifications */}
          <button
            onClick={() => navigate(notifPath)}
            className="relative p-1.5 rounded-lg hover:bg-gray-100"
          >
            <Bell size={20} className="text-gray-600"/>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <div className="w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.firstName[0]}{user?.lastName[0]}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.role ? roleLabel[user.role] : ''}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400"/>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                <NavLink to={`${basePath}/profile`} onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User size={16}/> Profile
                </NavLink>
                <hr className="my-1 border-gray-100"/>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                  <LogOut size={16}/> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
