import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  Calendar, 
  Settings, 
  HeartPulse,
  X,
  ShieldAlert,
  Clock,
  Activity,
  Stethoscope,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  urgentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = false, 
  onClose, 
  urgentCount = 2 
}) => {
  const location = useLocation();

  const isPathActive = (itemTo: string) => {
    if (itemTo === '/') return location.pathname === '/';
    if (itemTo === '/ai-assistant') {
      return (
        location.pathname.startsWith('/ai-assistant') ||
        location.pathname.startsWith('/clinic-agent') ||
        location.pathname.startsWith('/consultation')
      );
    }
    return location.pathname.startsWith(itemTo);
  };
  // Navigation links requested:
  // - Dashboard
  // - Patient Records
  // - AI Assistant
  // - Appointments
  // - Settings
  // Navigation links
  const navItems = [
    {
      to: '/doctor/dashboard',
      label: 'Doctor Portal',
      icon: Stethoscope,
      badge: 'Queue',
      highlight: true
    },
    {
      to: '/patient/dashboard',
      label: 'Patient Portal',
      icon: User,
      badge: 'AI Chat',
      highlight: true
    },
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/patients',
      label: 'Patient Records',
      icon: Users,
      badge: null
    },
    {
      to: '/ai-assistant',
      label: 'AI Assistant',
      icon: Sparkles,
      badge: 'Live',
      isAgent: true
    },
    {
      to: '/appointments',
      label: 'Appointments',
      icon: Calendar,
      badge: 'Today'
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Brand logo & mobile close button */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                Clinic Agent
              </h1>
              <p className="text-[11px] font-medium text-slate-400 mt-1">Clinical Operations</p>
            </div>
          </div>

          {/* Close button for mobile / tablet drawer */}
          <button
            onClick={onClose}
            className="lg:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={handleNavClick}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? item.isAgent
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm shadow-teal-500/20 font-bold'
                      : 'bg-teal-50/80 text-teal-800 font-bold border border-teal-100/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active 
                        ? item.isAgent ? 'text-white' : 'text-teal-600' 
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                      active
                        ? item.isAgent 
                          ? 'bg-white/25 text-white' 
                          : 'bg-teal-100 text-teal-800'
                        : item.isAgent
                          ? 'bg-teal-50 text-teal-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* AI Assistant Status & Triage Widget */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-teal-50/90 via-sky-50/50 to-slate-50 border border-teal-100/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span className="text-[11px] font-bold text-teal-900">AI Assistant Ready</span>
            </div>
            <span className="text-[10px] font-mono text-teal-700 font-semibold tabular-nums">98.7%</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
            Autonomous triage, symptom risk score, and doctor scheduling.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-teal-100/60 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Avg wait 12m</span>
            </div>
            {urgentCount > 0 && (
              <div className="flex items-center gap-1 text-rose-600 font-semibold">
                <ShieldAlert className="w-3 h-3" />
                <span>{urgentCount} Priority</span>
              </div>
            )}
          </div>
        </div>

        {/* Clinic info & footer status */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate text-[11px] font-medium text-slate-600">St. Jude Clinic</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v1.2</span>
        </div>
      </aside>
    </>
  );
};
