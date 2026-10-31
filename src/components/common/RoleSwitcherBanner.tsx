import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Stethoscope, 
  ArrowLeftRight, 
  LogOut, 
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { authService, AuthSession } from '../../services/authService';

interface RoleSwitcherBannerProps {
  session: AuthSession | null;
}

export const RoleSwitcherBanner: React.FC<RoleSwitcherBannerProps> = ({ session }) => {
  const navigate = useNavigate();

  const handleSwitchToDoctor = () => {
    authService.switchToRole('doctor');
    navigate('/doctor/dashboard');
  };

  const handleSwitchToPatient = () => {
    authService.switchToRole('patient');
    navigate('/patient/dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!session) {
    return null;
  }

  const isDoctor = session.role === 'doctor';

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-xs">
      <div className="flex items-center space-x-2.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
          <ShieldCheck className="w-3 h-3 mr-1" />
          Interactive Demo Portal
        </span>
        <span className="text-slate-300">
          Active Role: <strong className="text-white capitalize">{session.role}</strong> (
          <span className="text-teal-200 font-medium">{session.user.name}</span>
          {isDoctor ? ' - MD' : ` • ID: ${(session.user as any).id}`}
          )
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-slate-400 hidden sm:inline text-[11px]">Quick Switcher:</span>

        {isDoctor ? (
          <button
            onClick={handleSwitchToPatient}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-teal-700/80 hover:bg-teal-600 text-teal-50 text-[11px] font-medium transition-colors"
            title="Switch to Eleanor Sterling (Patient)"
          >
            <User className="w-3 h-3" />
            <span>Switch to Patient View</span>
          </button>
        ) : (
          <button
            onClick={handleSwitchToDoctor}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-cyan-700/80 hover:bg-cyan-600 text-cyan-50 text-[11px] font-medium transition-colors"
            title="Switch to Dr. Marcus Vance (Doctor)"
          >
            <Stethoscope className="w-3 h-3" />
            <span>Switch to Doctor View</span>
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] transition-colors"
          title="Sign out to Login screen"
        >
          <LogOut className="w-3 h-3" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
