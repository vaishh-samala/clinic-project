import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  UserCheck, 
  ArrowUpRight,
  Plus,
  Pill,
  UserPlus,
  Play,
  FileText,
  HeartPulse,
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { AppointmentCard } from '../components/AppointmentCard';
import { clinicService } from '../services/clinicService';
import { 
  Appointment, 
  Patient, 
  Doctor, 
  AppointmentStatus, 
  ClinicMetrics,
  PatientActivity 
} from '../services/mockData';

interface OutletContextType {
  patients: Patient[];
  doctors: Doctor[];
  onOpenPatientDetail: (patient: Patient) => void;
  onOpenBookingForPatient: (patient: Patient) => void;
  onOpenQuickTriage: () => void;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    patients, 
    doctors, 
    onOpenPatientDetail, 
    onOpenBookingForPatient,
    onOpenQuickTriage 
  } = useOutletContext<OutletContextType>();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [metrics, setMetrics] = useState<ClinicMetrics>(clinicService.getMetrics());
  const [activities, setActivities] = useState<PatientActivity[]>(clinicService.getActivities());
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    const refresh = () => {
      setAppointments(clinicService.getAppointments());
      setMetrics(clinicService.getMetrics());
      setActivities(clinicService.getActivities());
    };

    refresh();
    const unsub = clinicService.subscribe(refresh);
    return () => unsub();
  }, []);

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    clinicService.updateAppointmentStatus(id, status);
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    navigate(`/patients?selected=${appointment.patientId}`);
  };

  const handleFastTrackNext = () => {
    const firstWaiting = appointments.find(a => a.status === 'Checked-In');
    if (firstWaiting) {
      clinicService.updateAppointmentStatus(firstWaiting.id, 'In-Consultation');
    } else {
      alert('No patients currently in the waiting lounge.');
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === 'All') return true;
    return a.status === statusFilter;
  });

  const waitingPatients = appointments.filter(a => a.status === 'Checked-In');
  const totalRegisteredPatients = 1420 + patients.length;

  const getActivityIcon = (type: PatientActivity['type']) => {
    switch (type) {
      case 'triage_flag':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'consultation_started':
        return <Activity className="w-4 h-4 text-teal-600" />;
      case 'check_in':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'prescription_issued':
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case 'vitals_logged':
        return <HeartPulse className="w-4 h-4 text-cyan-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Welcome Message Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-sky-50 to-white rounded-3xl p-6 sm:p-7 border border-teal-100 shadow-[0_2px_8px_-2px_rgba(20,184,166,0.06)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span>St. Jude Outpatient Annex · Operations Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, Dr. Marcus Vance 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Clinical operations are running smoothly today. There are currently <strong className="text-slate-800">{metrics.checkedInCount} patients</strong> in the waiting room and <strong className="text-slate-800">{metrics.inConsultationCount} active consultations</strong> underway across 5 specialty suites.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenQuickTriage}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm hover:from-teal-700 hover:to-cyan-700 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-teal-100" />
              <span>Launch AI Triage</span>
            </button>
            <button
              onClick={() => onOpenBookingForPatient(patients[0])}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 text-slate-400" />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Key Metrics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients Card */}
        <StatCard
          title="Total Patients"
          value={totalRegisteredPatients.toLocaleString()}
          subtitle="Registered clinical records"
          change="+18 this week"
          isPositive={true}
          icon={Users}
          variant="blue"
          onClick={() => navigate('/patients')}
        />

        {/* Today's Appointments Card */}
        <StatCard
          title="Today's Appointments"
          value={metrics.totalAppointmentsToday}
          subtitle="92% room capacity filled"
          change="+8% vs avg"
          isPositive={true}
          icon={Calendar}
          variant="teal"
          onClick={() => navigate('/appointments')}
        />

        {/* Active Consultations Card */}
        <StatCard
          title="Active Consultations"
          value={metrics.inConsultationCount}
          subtitle="Exam rooms occupied"
          icon={Activity}
          variant="indigo"
          onClick={() => navigate('/ai-assistant?mode=consultation')}
        />

        {/* Average Wait Time */}
        <StatCard
          title="Average Wait Time"
          value={`${metrics.avgWaitTimeMinutes}m`}
          subtitle="Below 15m target threshold"
          change="3m faster"
          isPositive={true}
          icon={Clock}
          variant="emerald"
          onClick={() => navigate('/appointments')}
        />
      </div>

      {/* 3. Quick Actions Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Quick Actions</h2>
          </div>
          <span className="text-[11px] text-slate-400">One-click operational triggers</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Action 1: Rapid Symptom Triage */}
          <button
            onClick={onOpenQuickTriage}
            className="group p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-teal-50/60 hover:border-teal-200 text-left transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-100/70 text-teal-700 flex items-center justify-center mb-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <strong className="block text-xs font-bold text-slate-800 group-hover:text-teal-900 transition-colors">
              AI Symptom Triage
            </strong>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Intake & ESI score</span>
          </button>

          {/* Action 2: Book Appointment */}
          <button
            onClick={() => onOpenBookingForPatient(patients[0])}
            className="group p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/60 hover:border-sky-200 text-left transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-100/70 text-sky-700 flex items-center justify-center mb-2 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <strong className="block text-xs font-bold text-slate-800 group-hover:text-sky-900 transition-colors">
              Book Appointment
            </strong>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Slot room & doctor</span>
          </button>

          {/* Action 3: Register Patient */}
          <button
            onClick={() => navigate('/patients')}
            className="group p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/60 hover:border-emerald-200 text-left transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserPlus className="w-4 h-4" />
            </div>
            <strong className="block text-xs font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">
              Register Patient
            </strong>
            <span className="text-[11px] text-slate-500 mt-0.5 block">New medical record</span>
          </button>

          {/* Action 4: Clinical Consultation Workflow */}
          <button
            onClick={() => navigate('/ai-assistant?mode=consultation')}
            className="group p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-amber-50/60 hover:border-amber-200 text-left transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Stethoscope className="w-4 h-4" />
            </div>
            <strong className="block text-xs font-bold text-slate-800 group-hover:text-amber-900 transition-colors">
              Patient Consultation
            </strong>
            <span className="text-[11px] text-slate-500 mt-0.5 block">AI differential support</span>
          </button>

          {/* Action 5: Fast Track Next Waiting */}
          <button
            onClick={handleFastTrackNext}
            className="group p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/60 hover:border-indigo-200 text-left transition-all col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <strong className="block text-xs font-bold text-slate-800 group-hover:text-indigo-900 transition-colors">
              Call Next Patient
            </strong>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {waitingPatients.length > 0 ? `${waitingPatients.length} in waiting lounge` : 'Lounge clear'}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Two-Column Layout: Appointments Schedule + Recent Activity & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Appointments Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Today's Appointments</h2>
                <p className="text-xs text-slate-500">Live consultation timeline & room assignments</p>
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
                {['All', 'Checked-In', 'In-Consultation', 'Scheduled', 'Completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                      statusFilter === tab
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onUpdateStatus={handleUpdateStatus}
                    onSelect={handleSelectAppointment}
                  />
                ))
              ) : (
                <div className="col-span-2 py-12 text-center text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium">No appointments match status "{statusFilter}".</p>
                  <button
                    onClick={() => setStatusFilter('All')}
                    className="text-xs font-semibold text-teal-600 hover:underline mt-1"
                  >
                    Reset filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Recent Patient Activity & Waiting Queue */}
        <div className="lg:col-span-5 space-y-6">
          {/* 4. Recent Patient Activity Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Patient Activity</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">Real-time log</span>
            </div>

            <div className="divide-y divide-slate-100">
              {activities.slice(0, 5).map((act) => (
                <div 
                  key={act.id} 
                  onClick={() => navigate(`/patients?selected=${act.patientId}`)}
                  className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 cursor-pointer group hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-teal-200 group-hover:bg-teal-50 transition-colors">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                        {act.patientName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono tabular-nums shrink-0">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {act.description}
                    </p>
                    {act.urgency && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        {act.urgency}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waiting Room Queue */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                <h3 className="text-sm font-bold text-slate-900">Waiting Room Queue</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 tabular-nums">
                {waitingPatients.length} in Lounge
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {waitingPatients.length > 0 ? (
                waitingPatients.map((apt) => (
                  <div key={apt.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button
                          onClick={() => handleSelectAppointment(apt)}
                          className="text-xs font-bold text-slate-900 hover:text-teal-700 transition-colors text-left"
                        >
                          {apt.patientName} ({apt.patientAge}y)
                        </button>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{apt.reasonForVisit}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                          <Stethoscope className="w-3 h-3 text-slate-400" />
                          <span>{apt.doctorName}</span>
                          <span>·</span>
                          <span>{apt.room}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'In-Consultation')}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors shrink-0"
                      >
                        Call Next
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Waiting room is currently clear.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
