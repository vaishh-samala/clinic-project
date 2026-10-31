import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Stethoscope, 
  Phone, 
  MapPin, 
  Clock, 
  UserCheck, 
  Activity, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Doctor } from '../services/mockData';
import { clinicService } from '../services/clinicService';

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  useEffect(() => {
    const refresh = () => {
      setDoctors(clinicService.getDoctors());
    };
    refresh();
    const unsub = clinicService.subscribe(refresh);
    return () => unsub();
  }, []);

  const handleStatusChange = (id: string, newStatus: Doctor['status']) => {
    clinicService.updateDoctorStatus(id, newStatus);
  };

  const filteredDoctors = doctors.filter(doc => {
    if (selectedSpecialty === 'All') return true;
    return doc.specialty === selectedSpecialty;
  });

  const specialties = ['All', ...new Set(doctors.map(d => d.specialty))];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Physicians & Clinical Staff
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Active medical practitioners, clinical duty status, and consultation room allocations.
          </p>
        </div>

        {/* Specialty filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Department:</span>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
          >
            {specialties.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Profile Top */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 border border-slate-200 overflow-hidden relative shadow-2xs">
                  <span className="select-none">{doctor.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}</span>
                  <img
                    src={doctor.avatarUrl}
                    alt={doctor.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-base font-bold text-slate-900 truncate">{doctor.name}</h3>
                  </div>
                  <p className="text-xs font-semibold text-teal-700 mt-0.5">{doctor.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{doctor.specialty} · {doctor.department}</p>
                </div>
              </div>

              {/* Status & Room Badges */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Current Status</span>
                  <select
                    value={doctor.status}
                    onChange={(e) => handleStatusChange(doctor.id, e.target.value as Doctor['status'])}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="In Clinic">In Clinic (Available)</option>
                    <option value="In Consultation">In Consultation</option>
                    <option value="In Surgery">In Surgery</option>
                    <option value="On Break">On Break</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="text-slate-400 font-medium">Assigned Room</span>
                  <strong className="text-slate-800">{doctor.room}</strong>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="text-slate-400 font-medium">Working Hours</span>
                  <span className="font-mono text-[11px] text-slate-600 tabular-nums">{doctor.schedule}</span>
                </div>
              </div>

              {/* Patient Load Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Patient Load Today</span>
                  <span className="font-mono font-bold text-slate-800 tabular-nums">
                    {doctor.patientsToday} / {doctor.maxPatientsPerDay}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      doctor.patientsToday / doctor.maxPatientsPerDay > 0.85
                        ? 'bg-amber-500'
                        : 'bg-teal-500'
                    }`}
                    style={{ width: `${Math.min(100, (doctor.patientsToday / doctor.maxPatientsPerDay) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Contact info footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{doctor.phone}</span>
              </span>
              <span className="text-[11px] text-teal-700 font-semibold">Triage Route Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
