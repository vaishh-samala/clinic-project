import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  AlertTriangle, 
  ShieldAlert, 
  Pill, 
  Activity, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  FileText,
  Heart,
  Thermometer,
  Wind,
  X,
  Stethoscope
} from 'lucide-react';
import { Patient } from '../../services/mockData';

interface PatientDetailsCardProps {
  patient: Patient;
  onBookAppointment: (patient: Patient) => void;
  onRunTriage?: (patient: Patient) => void;
  onClose?: () => void;
  isNewlyRegistered?: boolean;
}

export const PatientDetailsCard: React.FC<PatientDetailsCardProps> = ({
  patient,
  onBookAppointment,
  onRunTriage,
  onClose,
  isNewlyRegistered = false
}) => {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(patient.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden transition-all animate-in fade-in zoom-in-98 duration-200">
      {/* Newly Registered Success Banner if applicable */}
      {isNewlyRegistered && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Patient record successfully created and enqueued to clinical directory!</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-600">ID: {patient.id}</span>
        </div>
      )}

      {/* Card Header & Demographics */}
      <div className="p-6 bg-gradient-to-r from-teal-500/10 via-sky-50 to-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-teal-500/20">
            {patient.name.split(' ').map(n => n[0]).join('')}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {patient.name}
              </h3>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 font-mono text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Copy Patient ID"
              >
                <span>{patient.id}</span>
                {copiedId ? <Check className="w-3 h-3 text-teal-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
              <span>{patient.gender}</span>
              <span>·</span>
              <span>{patient.age} years old</span>
              {patient.bloodType && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    Blood {patient.bloodType}
                  </span>
                </>
              )}
              <span>·</span>
              <span>Last Visit: {patient.lastVisit}</span>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <Link
            to={`/ai-assistant?patient=${patient.id}&mode=consultation`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 shadow-sm transition-all active:scale-[0.98]"
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-100" />
            <span>AI Consultation Workflow →</span>
          </Link>

          <button
            onClick={() => onBookAppointment(patient)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Visit</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Close details view"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Card Content Grid */}
      <div className="p-6 space-y-6">
        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-700">
            <Phone className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-slate-400">Phone:</span>
            <a href={`tel:${patient.phone}`} className="font-mono font-bold text-slate-900 hover:underline">
              {patient.phone}
            </a>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700">
            <Mail className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-slate-400">Email:</span>
            <a href={`mailto:${patient.email}`} className="font-medium text-slate-900 hover:underline truncate">
              {patient.email}
            </a>
          </div>
        </div>

        {/* Current Presenting Symptoms Highlight */}
        {patient.currentSymptoms && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                Current Presenting Symptoms (Intake Complaint)
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                Active Symptom Intake
              </span>
            </div>
            <p className="text-slate-800 leading-relaxed text-xs sm:text-sm font-medium">
              "{patient.currentSymptoms}"
            </p>

            {onRunTriage && (
              <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between">
                <span className="text-[11px] text-amber-900">Recommended next step: Analyze urgency and matching doctor.</span>
                <button
                  type="button"
                  onClick={() => onRunTriage(patient)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Run AI Triage Check</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Medical History & Chronic Conditions */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            Medical History & Chronic Conditions
          </h4>

          {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {patient.chronicConditions.map((cond, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-teal-50 text-teal-900 border border-teal-200/80 shadow-2xs"
                >
                  {cond}
                </span>
              ))}
            </div>
          ) : patient.medicalHistory ? (
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {patient.medicalHistory}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No previous chronic conditions logged.</p>
          )}
        </div>

        {/* Two Columns: Active Medications & Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Medications */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              Current Medications
            </h4>
            {patient.currentMedications && patient.currentMedications.length > 0 ? (
              <div className="space-y-1.5">
                {patient.currentMedications.map((med, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="font-semibold text-slate-800">{med}</span>
                    <span className="text-[10px] text-slate-400 font-mono">RX</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No active prescriptions.</p>
            )}
          </div>

          {/* Allergies & Contraindications */}
          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Allergies & Warnings
            </h4>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map((allergy, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-rose-700 border border-rose-200 shadow-2xs flex items-center gap-1"
                  >
                    <span>⚠️</span>
                    <span>{allergy}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No known drug allergies (NKDA).</p>
            )}
          </div>
        </div>

        {/* Recent Vitals Strip */}
        {patient.recentVitals && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                Vitals Profile ({patient.recentVitals.recordedAt})
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Blood Pressure</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {patient.recentVitals.bloodPressure}
                </span>
                <span className="text-[10px] text-slate-400 block">mmHg</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Heart Rate</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {patient.recentVitals.heartRate}
                </span>
                <span className="text-[10px] text-slate-400 block">bpm</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">SpO2</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {patient.recentVitals.oxygenSaturation}%
                </span>
                <span className="text-[10px] text-slate-400 block">Room Air</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Body Temp</span>
                <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                  {patient.recentVitals.temperature}°F
                </span>
                <span className="text-[10px] text-slate-400 block">Oral</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
