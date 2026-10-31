import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Sparkles, 
  Plus, 
  Activity, 
  X,
  Menu,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService, AuthSession } from '../services/authService';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenQuickTriage: () => void;
  onOpenNewAppointment: () => void;
  activePhysiciansCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenQuickTriage,
  onOpenNewAppointment,
  activePhysiciansCount = 5
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(authService.getSession());

  useEffect(() => {
    const unsub = authService.subscribe(() => {
      setSession(authService.getSession());
    });
    return () => unsub();
  }, []);

  // Derive dynamic page title from route
  const getPageTitle = () => {
    if (location.pathname.startsWith('/patient')) return 'Patient Portal';
    if (location.pathname.startsWith('/doctor')) return 'Doctor Portal';
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/patients':
        return 'Patient Records';
      case '/ai-assistant':
      case '/clinic-agent':
      case '/consultation':
        return 'AI Assistant';
      case '/appointments':
        return 'Appointments';
      case '/doctors':
        return 'Physicians & Staff';
      case '/analytics':
        return 'Operations & KPIs';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Urgent Triage Alert',
      desc: 'Arthur Pendelton (CAD) arrived with chest tightness. Assigned to Suite 204.',
      time: '8m ago',
      urgent: true
    },
    {
      id: 2,
      title: 'New Check-in',
      desc: 'Eleanor Sterling checked in for quarterly diabetes & BP review.',
      time: '18m ago',
      urgent: false
    },
    {
      id: 3,
      title: 'Pediatric Queue Notice',
      desc: 'Dr. Rostova has 3 consecutive walk-in consultations prepared.',
      time: '28m ago',
      urgent: false
    },
    {
      id: 4,
      title: 'Lab Results Ready',
      desc: 'Troponin and metabolic panel returned for Patient Arthur Pendelton.',
      time: '45m ago',
      urgent: false
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patients?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile hamburger menu & Page Title */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle (Mobile/Tablet) */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Dynamic Page Title */}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">
              {getPageTitle()}
            </h1>
            <p className="hidden md:block text-[11px] text-slate-400 font-medium">
              St. Jude Outpatient Center · Annex East
            </p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, records, symptoms..."
              className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Right Section: Actions, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick AI Triage Button */}
          <button
            onClick={onOpenQuickTriage}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-xs hover:from-teal-700 hover:to-cyan-700 active:scale-[0.98] transition-all whitespace-nowrap"
            title="Launch Clinical Agent Symptom Intake"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-100" />
            <span className="hidden md:inline">AI Triage</span>
          </button>

          {/* New Appointment Button */}
          <button
            onClick={onOpenNewAppointment}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-slate-300" />
            <span>Book Visit</span>
          </button>

          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-semibold text-slate-800">Clinical Notifications</span>
                  </div>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${n.urgent ? 'text-rose-600' : 'text-slate-700'}`}>
                          {n.title}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">4 new updates</span>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/ai-assistant');
                    }}
                    className="font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Open AI Console →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Section */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left"
              aria-label="User profile menu"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {session?.user.name ? session.user.name.split(' ').map(n => n[0]).join('') : 'DR'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">
                  {session?.user.name || 'Dr. Marcus Vance'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                  {session?.role === 'patient' ? `Patient • ID: ${(session.user as any).id}` : 'Clinic Physician'}
                </p>
              </div>
              <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{session?.user.name}</p>
                  <p className="text-[11px] text-slate-500 capitalize">
                    {session?.role === 'patient' ? `Patient Record: ${(session?.user as any).id}` : `${(session?.user as any).specialty || 'General Practice'} • Suite ${(session?.user as any).room || '102'}`}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Active Session</span>
                  </div>
                </div>

                <div className="py-1 text-xs text-slate-600">
                  {session?.role === 'doctor' ? (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/doctor/dashboard');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Doctor Queue</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/patient/dashboard');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Patient Record</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    <span>Clinic Settings</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      authService.logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 text-xs font-semibold text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
