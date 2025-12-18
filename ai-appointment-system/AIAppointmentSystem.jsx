import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Briefcase,
  UserCircle,
  Menu,
  X,
  LogOut,
  Bot,
  PlusCircle,
  Sparkles,
  Bell,
  Search,
  Settings,
  Scissors,
  Building2,
  MessageCircle,
  Wallet // New Icon
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from './src/store';
import { useAuth } from './src/context/AuthContext';
import Dashboard from './src/components/Dashboard';
import ProfessionalManagement from './src/components/ProfessionalManagement';
import ServiceManagement from './src/components/ServiceManagement';
import CustomerList from './src/components/CustomerList';
import CustomerDetail from './src/components/CustomerDetail';
import AppointmentCreateModal from './src/components/AppointmentCreateModal';
import CustomerCreateModal from './src/components/CustomerCreateModal';
import AppointmentDetail from './src/components/AppointmentDetail';
import AppointmentList from './src/components/AppointmentList';
import CreateAppointment from './src/components/CreateAppointment';
import AIChatAssistant from './src/components/AIChatAssistant';
import BusinessProfile from './src/components/BusinessProfile';
import Inbox from './src/pages/Inbox';
import Finance from './src/pages/Finance'; // New Import

import CustomerAppointments from './src/components/CustomerAppointments';
import UserProfile from './src/components/UserProfile';
import SettingsPage from './src/pages/Settings';
import AIReports from './src/components/AIReports';
import Notifications from './src/components/Notifications';

const AIAppointmentSystem = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({ customers: [], appointments: [], services: [] });

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 1) {
      setIsSearching(true);
      setTimeout(() => {
        setSearchResults({ customers: [], appointments: [] });
        setIsSearching(false);
        setShowResults(true);
      }, 500);
    } else {
      setShowResults(false);
    }
  };

  const { user, logout } = useAuth();

  // Normalize role to Uppercase to handle 'salon_owner' vs 'SALON_OWNER' mismatch
  const currentRole = (user?.role || '').toUpperCase();

  const {
    selectedView,
    setSelectedView,
    sidebarOpen,
    toggleSidebar,
    modals,
    closeModal,
    openModal
  } = useStore();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Panel', roles: ['SALON_OWNER', 'SUPER_ADMIN'] },
    { id: 'customer-appointments', icon: CalendarIcon, label: 'Randevularım', roles: ['CUSTOMER'] },
    { id: 'business-profile', icon: Building2, label: 'İşletme Profili', roles: ['SALON_OWNER'] },
    { id: 'appointments', icon: CalendarIcon, label: 'Randevular', roles: ['SALON_OWNER', 'SUPER_ADMIN', 'STAFF'] },
    { id: 'professionals', icon: Users, label: 'Personel', roles: ['SALON_OWNER', 'SUPER_ADMIN'] },
    { id: 'customers', icon: UserCircle, label: 'Müşteriler', roles: ['SALON_OWNER', 'SUPER_ADMIN'] },
    { id: 'finance', icon: Wallet, label: 'Muhasebe', roles: ['SALON_OWNER', 'SUPER_ADMIN'] },
    { id: 'inbox', icon: MessageCircle, label: 'Mesajlar', roles: ['SALON_OWNER', 'SUPER_ADMIN'] },
    { id: 'services', icon: Briefcase, label: 'Hizmetler', roles: ['SALON_OWNER', 'SUPER_ADMIN'] },
    { id: 'settings', icon: Settings, label: 'Ayarlar', roles: ['SALON_OWNER', 'SUPER_ADMIN'] },
    { id: 'reports', icon: Bot, label: 'AI Raporlar', roles: ['SALON_OWNER', 'SUPER_ADMIN'] },
    { id: 'user-profile', icon: UserCircle, label: 'Profilim', roles: ['CUSTOMER', 'SALON_OWNER', 'SUPER_ADMIN', 'STAFF'] }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentRole));

  // ... existing code ...

  // Set default view based on role
  React.useEffect(() => {
    if (currentRole === 'CUSTOMER' && selectedView === 'dashboard') {
      setSelectedView('customer-appointments');
    }
  }, [currentRole, selectedView, setSelectedView]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <AppointmentCreateModal />
      <CustomerCreateModal />
      <AIChatAssistant />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-lg">OdakManage</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 z-40
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight font-sans uppercase">ODAKMANAGE</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {currentRole !== 'CUSTOMER' && (
            <div className="mb-8">
              <button
                onClick={() => { setSelectedView('create-appointment'); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Yeni Randevu</span>
              </button>
            </div>
          )}

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menü</p>
          {filteredMenuItems.map((item) => {
            const isActive = selectedView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setSelectedView(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-slate-800 text-white shadow-sm border-l-4 border-indigo-500'
                  : 'hover:bg-slate-800/50 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div
            onClick={() => { setSelectedView('user-profile'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                (user?.name?.[0] || user?.email?.[0] || 'A').toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || user?.email || 'Admin'}</p>
              <p className="text-xs text-slate-500">Yönetici</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
                window.location.href = '/login';
              }}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="Çıkış"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-slate-50 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900">{currentTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Hızlı arama..."
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => { if (searchQuery.length > 1) setShowResults(true); }}
                // onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay to allow clicks
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 max-h-96 overflow-y-auto z-50 py-2"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-slate-500 text-sm">Aranıyor...</div>
                    ) : (
                      <>
                        {Object.values(searchResults).every(arr => arr.length === 0) ? (
                          <div className="p-4 text-center text-slate-500 text-sm">Sonuç bulunamadı</div>
                        ) : (
                          <>
                            {/* Customers */}
                            {searchResults.customers?.length > 0 && (
                              <div className="mb-2">
                                <div className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase">Müşteriler</div>
                                {searchResults.customers.map(c => (
                                  <button
                                    key={c.id}
                                    onClick={() => { setSelectedView('customers'); setShowResults(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                      {c.name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-slate-700">{c.name}</div>
                                      <div className="text-xs text-slate-500">{c.phone}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Appointments */}
                            {searchResults.appointments?.length > 0 && (
                              <div className="mb-2">
                                <div className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase">Randevular</div>
                                {searchResults.appointments.map(a => (
                                  <button
                                    key={a.id}
                                    onClick={() => { setSelectedView('appointments'); setShowResults(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                      <CalendarIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-slate-700">{a.customer.name}</div>
                                      <div className="text-xs text-slate-500">
                                        {new Date(a.dateTime).toLocaleDateString('tr-TR')} - {a.service.name}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Services */}
                            {searchResults.services?.length > 0 && (
                              <div className="mb-2">
                                <div className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase">Hizmetler</div>
                                {searchResults.services.map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => { setSelectedView('services'); setShowResults(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                                      <Scissors className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-slate-700">{s.name}</div>
                                      <div className="text-xs text-slate-500">{s.duration} dk - ₺{s.price}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
              <AnimatePresence>
                {showNotifications && <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Overlay */}
      {
        mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )
      }
    </div>
  );
};

export default AIAppointmentSystem;
