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
  Building2
} from 'lucide-react';
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

import CustomerAppointments from './src/components/CustomerAppointments';
import UserProfile from './src/components/UserProfile';
// import Settings from './src/pages/Settings';

const AIAppointmentSystem = () => {
  const { user, logout } = useAuth();
  const selectedView = useStore((state) => state.selectedView);
  const setSelectedView = useStore((state) => state.setSelectedView);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Panel', roles: ['salon_owner', 'admin'] },
    { id: 'customer-appointments', icon: CalendarIcon, label: 'Randevularım', roles: ['customer'] }, // New item
    { id: 'business-profile', icon: Building2, label: 'İşletme Profili', roles: ['salon_owner'] },
    { id: 'appointments', icon: CalendarIcon, label: 'Randevular', roles: ['salon_owner', 'admin', 'professional'] },
    { id: 'professionals', icon: Users, label: 'Personel', roles: ['salon_owner', 'admin'] },
    { id: 'customers', icon: UserCircle, label: 'Müşteriler', roles: ['salon_owner', 'admin'] },
    { id: 'services', icon: Briefcase, label: 'Hizmetler', roles: ['salon_owner', 'admin'] },
    { id: 'reports', icon: Bot, label: 'AI Raporlar', roles: ['salon_owner', 'admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (item.roles && !item.roles.includes(user.role)) return false;
    return true;
  });

  const renderContent = () => {
    switch (selectedView) {
      case 'dashboard': return <Dashboard />;
      case 'customer-appointments': return <CustomerAppointments />; // New case
      case 'business-profile': return <BusinessProfile />;
      case 'appointments': return <AppointmentList />;
      case 'create-appointment': return <CreateAppointment />;
      case 'professionals': return <ProfessionalManagement />;
      case 'customers': return <CustomerList />;
      case 'customer-detail': return <CustomerDetail />;
      case 'services': return <ServiceManagement />;
      case 'appointment-detail': return <AppointmentDetail />;
      case 'user-profile': return <UserProfile />;
      // case 'settings': return <Settings />;
      case 'reports':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Yapay Zeka Raporları</h3>
            <p className="text-slate-500 max-w-md">
              Gelişmiş AI algoritmalarımız verilerinizi analiz ederek size özel iş zekası raporları hazırlıyor.
            </p>
            <span className="mt-6 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              Çok Yakında
            </span>
          </div>
        );
      default: return <Dashboard />;
    }
  };

  const currentTitle = menuItems.find(m => m.id === selectedView)?.label || (selectedView === 'user-profile' ? 'Profilim' : 'Panel');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <AppointmentCreateModal />
      <CustomerCreateModal />
      <AIChatAssistant />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-lg">AI Randevu</span>
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
            <h1 className="text-xl font-bold text-white tracking-tight">ALOKUAFÖR</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="mb-8">
            <button
              onClick={() => { setSelectedView('create-appointment'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Yeni Randevu</span>
            </button>
          </div>

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
              onClick={(e) => { e.stopPropagation(); logout(); }}
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
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
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
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AIAppointmentSystem;
