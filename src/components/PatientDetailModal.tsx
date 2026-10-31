import React from 'react';
import { Link } from 'react-router-dom';
import { Patient } from '../services/mockData';
import { 
  X, 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  AlertTriangle, 
  Pill, 
  ShieldCheck, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Stethoscope,
  FileText
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
  onBookAppointment: (patient: Patient) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onBookAppointment
}) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-teal-500/10 via-sky-50 to-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-teal-500/20">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {patient.gender} · {patient.age}y
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Blood {patient.bloodType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>DOB: {patient.dob}</span>
                <span>·</span>
                <span>ID: {patient.id.toUpperCase()}</span>
                <span>·</span>
                <span>Ins: {patient.insuranceProvider}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Recent Vitals Strip */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                Latest Vitals ({patient.recentVitals.recordedAt})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>BP</span>
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <p className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {patient.recentVitals.bloodPressure}
                </p>
                <span className="text-[10px] text-slate-400">mmHg</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Heart Rate</span>
                  <Activity className="w-3.5 h-3.5 text-teal-500" />
                </div>
                <p className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {patient.recentVitals.heartRate}
                </p>
                <span className="text-[10px] text-slate-400">bpm</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>SpO2</span>
                  <Wind className="w-3.5 h-3.5 text-cyan-500" />
                </div>
                <p className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {patient.recentVitals.oxygenSaturation}%
                </p>
                <span className="text-[10px] text-slate-400">Room Air</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Temp</span>
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {patient.recentVitals.temperature}°F
                </p>
                <span className="text-[10px] text-slate-400">Oral</span>
              </div>
            </div>
          </div>

          {/* Allergies & Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Allergies & Contraindications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.length > 0 ? (
                  patient.allergies.map((allergy, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-rose-200 text-rose-700 shadow-2xs"
                    >
                      {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No verified allergies</span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Chronic Conditions
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {patient.chronicConditions.map((condition, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Active Prescriptions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              Active Medications
            </h4>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl divide-y divide-slate-100 overflow-hidden">
              {patient.currentMedications.map((med, i) => (
                <div key={i} className="px-4 py-2.5 text-xs text-slate-700 flex items-center justify-between">
                  <span className="font-medium text-slate-800">{med}</span>
                  <span className="text-[11px] text-slate-400">Active RX</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Emergency Contact */}
          <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/70 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{patient.phone}</span>
              <span className="text-slate-300">·</span>
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{patient.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{patient.address}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-slate-500">
              <span>Emergency: <strong className="text-slate-700 font-semibold">{patient.emergencyContact.name}</strong> ({patient.emergencyContact.relationship})</span>
              <span className="font-mono">{patient.emergencyContact.phone}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last visit: {patient.lastVisit}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/patients?selected=${patient.id}`}
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Full EHR Record</span>
            </Link>

            <Link
              to={`/ai-assistant?patient=${patient.id}&mode=consultation`}
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 transition-colors"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>AI Consultation</span>
            </Link>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookAppointment(patient);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4" />
              Schedule Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
