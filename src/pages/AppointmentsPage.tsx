import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Play, 
  UserCheck, 
  AlertCircle,
  MoreVertical,
  XCircle,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { AppointmentCard } from '../components/AppointmentCard';
import { clinicService } from '../services/clinicService';
import { 
  Appointment, 
  Patient, 
  Doctor, 
  AppointmentStatus,
  TriageUrgency 
} from '../services/mockData';

interface OutletContextType {
  patients: Patient[];
  doctors: Doctor[];
  onOpenPatientDetail: (patient: Patient) => void;
  onOpenBookingForPatient: (patient: Patient) => void;
}

export const AppointmentsPage: React.FC = () => {
  const { patients, doctors, onOpenPatientDetail, onOpenBookingForPatient } = useOutletContext<OutletContextType>();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [doctorFilter, setDoctorFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    const refresh = () => {
      setAppointments(clinicService.getAppointments());
    };
    refresh();
    const unsub = clinicService.subscribe(refresh);
    return () => unsub();
  }, []);

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    clinicService.updateAppointmentStatus(id, status);
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    const pat = patients.find(p => p.id === appointment.patientId);
    if (pat) {
      onOpenPatientDetail(pat);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = 
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reasonForVisit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'All' || a.urgency.includes(urgencyFilter);
    const matchesDoctor = doctorFilter === 'All' || a.doctorId === doctorFilter;

    return matchesSearch && matchesStatus && matchesUrgency && matchesDoctor;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointment Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage patient bookings, clinic check-ins, and consultation schedules.
          </p>
        </div>

        <button
          onClick={() => onOpenBookingForPatient(patients[0])}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:scale-[0.98] transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient, doctor, or condition..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Table view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills / Selects */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Checked-In">Checked In</option>
              <option value="In-Consultation">In Consultation</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Triage:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Urgency</option>
              <option value="Level 1">Emergency (Level 1)</option>
              <option value="Level 2">Urgent (Level 2)</option>
              <option value="Level 3">Standard (Level 3)</option>
              <option value="Level 4">Routine (Level 4)</option>
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Clinician:</span>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {(statusFilter !== 'All' || urgencyFilter !== 'All' || doctorFilter !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('All');
                setUrgencyFilter('All');
                setDoctorFilter('All');
                setSearchTerm('');
              }}
              className="text-teal-600 hover:text-teal-700 font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
              <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No appointments found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or book a new appointment.</p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Time / Date</th>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Clinician & Room</th>
                  <th className="px-6 py-3.5">Reason & Symptoms</th>
                  <th className="px-6 py-3.5">Triage Level</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 tabular-nums">
                      <div>{appt.time}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{appt.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectAppointment(appt)}
                        className="font-bold text-slate-900 hover:text-teal-700 text-left"
                      >
                        {appt.patientName}
                      </button>
                      <div className="text-[11px] text-slate-400">{appt.patientAge} years old</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{appt.doctorName}</div>
                      <div className="text-[11px] text-slate-400">{appt.room}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-slate-700">{appt.reasonForVisit}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        appt.urgency.includes('Level 1') ? 'bg-rose-100 text-rose-800' :
                        appt.urgency.includes('Level 2') ? 'bg-amber-100 text-amber-800' :
                        appt.urgency.includes('Level 3') ? 'bg-teal-100 text-teal-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.urgency.split('(')[0]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize font-medium text-slate-700">
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {appt.status === 'Scheduled' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'Checked-In')}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          Check In
                        </button>
                      )}
                      {appt.status === 'Checked-In' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'In-Consultation')}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700"
                        >
                          Start Consult
                        </button>
                      )}
                      {appt.status === 'In-Consultation' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
