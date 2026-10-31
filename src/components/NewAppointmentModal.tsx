import React, { useState, useEffect } from 'react';
import { 
  Patient, 
  Doctor, 
  TriageUrgency,
  Appointment 
} from '../services/mockData';
import { agentService, TriageResult } from '../services/agentService';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  initialPatient?: Patient | null;
  onSave: (appointment: Omit<Appointment, 'id'>) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  initialPatient,
  onSave
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [customPatientName, setCustomPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(45);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [date, setDate] = useState('2026-10-31');
  const [time, setTime] = useState('11:30 AM');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [urgency, setUrgency] = useState<TriageUrgency>('Standard (Level 3)');
  const [room, setRoom] = useState('Room 102');
  
  // AI Agent Triage State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [agentResult, setAgentResult] = useState<TriageResult | null>(null);

  useEffect(() => {
    if (initialPatient) {
      setSelectedPatientId(initialPatient.id);
      setCustomPatientName(initialPatient.name);
      setPatientAge(initialPatient.age);
    } else if (patients.length > 0) {
      setSelectedPatientId(patients[0].id);
      setCustomPatientName(patients[0].name);
      setPatientAge(patients[0].age);
    }
  }, [initialPatient, patients, isOpen]);

  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
      setRoom(doctors[0].room);
    }
  }, [doctors, selectedDoctorId]);

  if (!isOpen) return null;

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const pat = patients.find(p => p.id === patientId);
    if (pat) {
      setCustomPatientName(pat.name);
      setPatientAge(pat.age);
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    const doc = doctors.find(d => d.id === doctorId);
    if (doc) {
      setRoom(doc.room);
    }
  };

  const handleRunAgentTriage = () => {
    if (!reasonForVisit && !symptoms) return;

    setIsEvaluating(true);
    setTimeout(() => {
      const activePat = patients.find(p => p.id === selectedPatientId);
      const result = agentService.evaluateSymptoms(
        `${reasonForVisit} ${symptoms}`,
        customPatientName || 'Patient',
        patientAge,
        activePat?.allergies || []
      );
      setAgentResult(result);
      setUrgency(result.urgency);
      setDurationMinutes(result.suggestedDurationMinutes);

      // Auto-assign doctor if available
      const matchingDoc = doctors.find(d => d.id === result.recommendedDoctorId) || doctors[0];
      if (matchingDoc) {
        setSelectedDoctorId(matchingDoc.id);
        setRoom(matchingDoc.room);
      }

      setIsEvaluating(false);
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDoc = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
    const patientObj = patients.find(p => p.id === selectedPatientId);

    const symptomList = symptoms
      ? symptoms.split(',').map(s => s.trim()).filter(Boolean)
      : [reasonForVisit];

    onSave({
      patientId: selectedPatientId || `pat-${Date.now()}`,
      patientName: patientObj ? patientObj.name : (customPatientName || 'Walk-in Patient'),
      patientAge: patientAge || 35,
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      specialty: selectedDoc.specialty,
      date,
      time,
      durationMinutes,
      status: 'Scheduled',
      urgency,
      reasonForVisit,
      symptoms: symptomList,
      room,
      agentRecommendedAction: agentResult ? agentResult.clinicalSummary : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Book Clinical Appointment</h2>
              <p className="text-xs text-slate-500">Triage & schedule consultation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y, {p.gender}) · ID: {p.id}
                </option>
              ))}
            </select>
          </div>

          {/* Chief Complaint / Reason for visit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chief Complaint & Symptoms
              </label>
              <button
                type="button"
                onClick={handleRunAgentTriage}
                disabled={!reasonForVisit && !symptoms}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>{isEvaluating ? 'Evaluating...' : 'AI Triage & Match'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="e.g. Chest tightness on stairs, severe earache, annual checkup..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* AI Recommendation Banner if triggered */}
          {agentResult && (
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-teal-950">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Clinic Agent Triage Summary
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white text-teal-800 font-bold border border-teal-200">
                  {agentResult.urgency}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">{agentResult.clinicalSummary}</p>
              {agentResult.redFlagAlerts.length > 0 && (
                <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  ⚠️ {agentResult.redFlagAlerts[0]}
                </div>
              )}
            </div>
          )}

          {/* Doctor Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assign Clinician
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => handleDoctorSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Room
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value={15}>15 mins</option>
                <option value={20}>20 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
            </div>
          </div>

          {/* Urgency selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Urgency Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Emergency (Level 1)', 'Urgent (Level 2)', 'Standard (Level 3)', 'Routine (Level 4)'] as TriageUrgency[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setUrgency(lvl)}
                  className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all ${
                    urgency === lvl 
                      ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="block truncate">{lvl.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{lvl.split('(')[1]?.replace(')', '')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
