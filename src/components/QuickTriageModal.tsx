import React, { useState } from 'react';
import { agentService, TriageResult } from '../services/agentService';
import { clinicService } from '../services/clinicService';
import { Patient, Doctor } from '../services/mockData';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  Stethoscope, 
  CheckCircle2, 
  ArrowRight,
  ClipboardList,
  HeartPulse,
  Activity
} from 'lucide-react';

interface QuickTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  onAppointmentCreated?: () => void;
}

export const QuickTriageModal: React.FC<QuickTriageModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  onAppointmentCreated
}) => {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [vitalsInput, setVitalsInput] = useState({
    bp: '',
    hr: '',
    spo2: '',
    temp: ''
  });
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen) return null;

  const handleRunTriage = () => {
    if (!symptomsInput.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const pat = patients.find(p => p.id === selectedPatientId);
      const res = agentService.evaluateSymptoms(
        symptomsInput,
        pat ? pat.name : 'Walk-in Patient',
        pat?.age || 40,
        pat?.allergies || []
      );
      setTriageResult(res);
      setIsProcessing(false);
    }, 400);
  };

  const handleDispatchAppointment = () => {
    if (!triageResult) return;

    const pat = patients.find(p => p.id === selectedPatientId);
    const assignedDoc = doctors.find(d => d.id === triageResult.recommendedDoctorId) || doctors[0];

    clinicService.addAppointment({
      patientId: pat?.id || `pat-${Date.now()}`,
      patientName: pat?.name || 'Walk-in Patient',
      patientAge: pat?.age || 40,
      doctorId: assignedDoc.id,
      doctorName: assignedDoc.name,
      specialty: assignedDoc.specialty,
      date: '2026-10-31',
      time: 'Immediate / Next Available',
      durationMinutes: triageResult.suggestedDurationMinutes,
      status: 'Checked-In',
      urgency: triageResult.urgency,
      reasonForVisit: symptomsInput,
      symptoms: [symptomsInput],
      room: assignedDoc.room,
      agentRecommendedAction: triageResult.clinicalSummary
    });

    clinicService.addTriageRecord({
      patientName: pat?.name || 'Walk-in Patient',
      timestamp: 'Just now',
      symptoms: [symptomsInput],
      urgency: triageResult.urgency,
      recommendedDepartment: triageResult.primaryDepartment,
      recommendedDoctor: triageResult.recommendedDoctorName,
      agentSummary: triageResult.clinicalSummary,
      vitalFlags: vitalsInput.bp ? [`BP ${vitalsInput.bp}`, `HR ${vitalsInput.hr || '80'}`] : ['Standard triage screening'],
      status: 'Assigned'
    });

    setIsDispatched(true);
    if (onAppointmentCreated) onAppointmentCreated();

    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Clinic Agent AI · Rapid Triage Engine</h2>
              <p className="text-xs text-teal-100">Intelligent intake triage, doctor matching & ESI stratification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Registered Patient (or Leave for Walk-In)
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="">-- Anonymous / New Walk-In Intake --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y, {p.gender}) · Allergies: {p.allergies.join(', ') || 'None'}
                </option>
              ))}
            </select>
          </div>

          {/* Symptom Input Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reported Symptoms & Onset
            </label>
            <textarea
              rows={3}
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="e.g. 58yo patient feeling retrosternal chest tightness radiating to left shoulder since 8am, accompanied by diaphoresis and dizziness..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Try keywords: chest pain, ear tugging, knee sprain, aura migraine...</span>
              <button
                type="button"
                onClick={handleRunTriage}
                disabled={!symptomsInput.trim() || isProcessing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Analyzing...' : 'Run Clinical Triage'}</span>
              </button>
            </div>
          </div>

          {/* Results Output */}
          {triageResult && (
            <div className="space-y-4 pt-3 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Urgency Level</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-bold text-slate-900">{triageResult.urgency}</span>
                    <span className="text-xs text-teal-700 font-semibold font-mono tabular-nums">
                      ({triageResult.confidenceScore}% confidence)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Specialty</span>
                  <p className="text-sm font-bold text-slate-800">{triageResult.primaryDepartment}</p>
                </div>
              </div>

              {/* Red flags alert box */}
              {triageResult.redFlagAlerts.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Clinical Safety & Red Flag Alerts
                  </div>
                  {triageResult.redFlagAlerts.map((flag, idx) => (
                    <p key={idx} className="text-[11px] leading-relaxed">· {flag}</p>
                  ))}
                </div>
              )}

              {/* Physician Recommendation & Orders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
                    Matching Clinician
                  </span>
                  <p className="font-bold text-slate-900">{triageResult.recommendedDoctorName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Est. Duration: {triageResult.suggestedDurationMinutes} min</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Pre-Consult Diagnostic Orders
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {triageResult.recommendedPreTests.map((test, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700">
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested SOAP note draft */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  <ClipboardList className="w-3.5 h-3.5 text-teal-600" />
                  Auto-Drafted Pre-Consult SOAP Summary
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-mono whitespace-pre-line bg-white p-2.5 rounded-xl border border-slate-200">
                  <strong>Assessment:</strong> {triageResult.suggestedSoapNote.assessment}{'\n'}
                  <strong>Plan:</strong> {triageResult.suggestedSoapNote.plan}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>

          {triageResult ? (
            <button
              onClick={handleDispatchAppointment}
              disabled={isDispatched}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all disabled:bg-emerald-600"
            >
              {isDispatched ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enqueued to Waiting Room</span>
                </>
              ) : (
                <>
                  <span>Dispatch & Slot to Waiting Room</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <span className="text-xs text-slate-400">Enter symptoms to generate triage path</span>
          )}
        </div>
      </div>
    </div>
  );
};
