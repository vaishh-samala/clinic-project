import React from 'react';
import { 
  Appointment, 
  AppointmentStatus 
} from '../services/mockData';
import { 
  Clock, 
  MapPin, 
  UserCheck, 
  CheckCircle2, 
  Play, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onSelect: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdateStatus,
  onSelect
}) => {
  const getUrgencyBadge = () => {
    if (appointment.urgency.includes('Level 1')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Level 1 · Emergency
        </span>
      );
    }
    if (appointment.urgency.includes('Level 2')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Level 2 · Urgent
        </span>
      );
    }
    if (appointment.urgency.includes('Level 3')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
          Level 3 · Standard
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
        Routine
      </span>
    );
  };

  const getStatusStyle = () => {
    switch (appointment.status) {
      case 'Checked-In':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In-Consultation':
        return 'bg-teal-50 text-teal-700 border-teal-200 font-semibold';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-400 border-slate-200 line-through';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top meta strip */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {appointment.time}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-400 tabular-nums">{appointment.durationMinutes} min</span>
          </div>

          <div className="flex items-center gap-2">
            {getUrgencyBadge()}
            <span className={`px-2 py-0.5 rounded-lg text-[11px] border capitalize ${getStatusStyle()}`}>
              {appointment.status}
            </span>
          </div>
        </div>

        {/* Patient headline */}
        <div className="mb-2">
          <button
            onClick={() => onSelect(appointment)}
            className="text-left group-hover:text-teal-700 transition-colors"
          >
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {appointment.patientName}
              <span className="text-xs font-normal text-slate-400 tabular-nums">({appointment.patientAge}y)</span>
            </h3>
          </button>
          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
            {appointment.reasonForVisit}
          </p>
        </div>

        {/* Doctor and Location */}
        <div className="py-2 my-2 border-y border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-medium text-slate-700 truncate">{appointment.doctorName}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 truncate">{appointment.specialty}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 shrink-0 font-medium text-[11px]">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{appointment.room}</span>
          </div>
        </div>

        {/* AI Agent triage note snippet if available */}
        {appointment.agentRecommendedAction && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-teal-50/60 border border-teal-100/70 text-[11px] text-teal-900 flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">
              <span className="font-semibold text-teal-800">Agent Note: </span>
              {appointment.agentRecommendedAction}
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(appointment)}
          className="text-xs font-semibold text-slate-600 hover:text-teal-700 hover:underline transition-colors"
        >
          View Chart
        </button>

        <div className="flex items-center gap-1.5">
          {appointment.status === 'Scheduled' && (
            <button
              onClick={() => onUpdateStatus(appointment.id, 'Checked-In')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Check In
            </button>
          )}

          {appointment.status === 'Checked-In' && (
            <button
              onClick={() => onUpdateStatus(appointment.id, 'In-Consultation')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Consult
            </button>
          )}

          {appointment.status === 'In-Consultation' && (
            <button
              onClick={() => onUpdateStatus(appointment.id, 'Completed')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
