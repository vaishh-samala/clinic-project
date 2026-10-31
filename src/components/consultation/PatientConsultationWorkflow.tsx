import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Stethoscope, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Pill, 
  FileText, 
  Activity, 
  ShieldAlert, 
  ChevronRight, 
  ArrowRight,
  ClipboardList,
  Heart,
  Thermometer,
  Wind,
  HelpCircle,
  Copy,
  Check,
  Send,
  Loader2
} from 'lucide-react';
import { Patient } from '../../services/mockData';
import { clinicService } from '../../services/clinicService';
import { 
  consultationService, 
  StructuredConsultationResponse 
} from '../../services/consultationService';

interface PatientConsultationWorkflowProps {
  initialPatientId?: string;
  onConsultationSaved?: () => void;
}

export const PatientConsultationWorkflow: React.FC<PatientConsultationWorkflowProps> = ({
  initialPatientId,
  onConsultationSaved
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [symptomsInput, setSymptomsInput] = useState<string>('');
  const [vitalsInput, setVitalsInput] = useState({
    bp: '',
    hr: '',
    spo2: '',
    temp: ''
  });

  // Workflow states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing analysis...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [consultationResult, setConsultationResult] = useState<StructuredConsultationResponse | null>(null);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const list = clinicService.getPatients();
    setPatients(list);
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    } else if (list.length > 0) {
      setSelectedPatientId(list[0].id);
    }
  }, [initialPatientId]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Populate symptoms with patient's active symptom if available
  useEffect(() => {
    if (selectedPatient && selectedPatient.currentSymptoms && !symptomsInput) {
      setSymptomsInput(selectedPatient.currentSymptoms);
    }
  }, [selectedPatient]);

  const symptomPresets = [
    {
      label: 'Chest Tightness (Cardiac)',
      text: 'Patient reports progressive retrosternal chest tightness radiating to the left shoulder and neck for 45 minutes, accompanied by diaphoresis and mild shortness of breath on climbing steps.',
      patientId: 'pat-4'
    },
    {
      label: 'Pediatric Fever & Ear Pain',
      text: 'Child has an acute 100.4°F fever, tugging at right ear persistently for 24 hours, irritable with reduced oral intake and mild throat redness.',
      patientId: 'pat-5'
    },
    {
      label: 'Diabetic Dizziness & Glycemia',
      text: 'Patient notes frequent morning lightheadedness upon standing, accompanied by dry mouth and polyuria over the past 3 days. Fasting glucose logged at 128 mg/dL.',
      patientId: 'pat-1'
    },
    {
      label: 'Hemicranial Migraine with Aura',
      text: 'Throbbing left-sided headache with visual scintillating scotoma for 2 hours, worsening nausea, and intense photophobia.',
      patientId: 'pat-3'
    }
  ];

  const handleApplyPreset = (preset: typeof symptomPresets[0]) => {
    setSymptomsInput(preset.text);
    if (preset.patientId) {
      setSelectedPatientId(preset.patientId);
    }
    setErrorMessage(null);
  };

  const handleSubmitConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPatient) {
      setErrorMessage('Please select a patient before submitting.');
      return;
    }

    if (!symptomsInput.trim() || symptomsInput.trim().length < 5) {
      setErrorMessage('Please enter detailed presenting symptoms (minimum 5 characters).');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Reviewing patient medical history & baseline vitals...');

    setTimeout(() => {
      setLoadingStep('Cross-referencing documented allergies & contraindications...');
    }, 450);

    setTimeout(() => {
      setLoadingStep('Synthesizing differential considerations & clinician follow-ups...');
    }, 900);

    setTimeout(() => {
      const result = consultationService.generateConsultationAnalysis(
        selectedPatient,
        symptomsInput.trim(),
        {
          bp: vitalsInput.bp || undefined,
          hr: vitalsInput.hr || undefined,
          spo2: vitalsInput.spo2 || undefined,
          temp: vitalsInput.temp || undefined
        }
      );

      setConsultationResult(result);
      setIsLoading(false);
    }, 1350);
  };

  const handleResetConsultation = () => {
    setConsultationResult(null);
    setSymptomsInput('');
    setVitalsInput({ bp: '', hr: '', spo2: '', temp: '' });
    setErrorMessage(null);
    setSavedSuccess(false);
  };

  const handleSaveToPatientRecord = () => {
    if (!consultationResult || !selectedPatient) return;

    // Log consultation activity
    clinicService.recordActivity({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      type: 'consultation_started',
      description: `Structured consultation completed: "${consultationResult.possibleExplanations[0]?.hypothesis || 'Evaluation'}". Next steps: ${consultationResult.recommendedNextSteps.diagnosticOrders[0] || 'Physical exam'}.`,
      time: 'Just now',
      urgency: consultationResult.possibleExplanations[0]?.likelihood === 'Primary Consideration' ? 'High Priority' : 'Standard'
    });

    setSavedSuccess(true);
    if (onConsultationSaved) onConsultationSaved();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyConsultationBrief = () => {
    if (!consultationResult) return;

    const briefText = `CLINICAL CONSULTATION DECISION SUPPORT BRIEF
Patient: ${consultationResult.patientName} (ID: ${consultationResult.patientId})
Time: ${consultationResult.timestamp}

1. PRESENTING SYMPTOMS SUMMARY:
${consultationResult.symptomSummary}

2. RELEVANT MEDICAL HISTORY:
- Conditions: ${consultationResult.relevantMedicalHistory.contributingConditions.join('; ')}
- Medications: ${consultationResult.relevantMedicalHistory.medicationConsiderations.join('; ')}
- Allergies: ${consultationResult.relevantMedicalHistory.allergyAlerts.join('; ')}

3. DIFFERENTIAL CONSIDERATIONS (NON-DIAGNOSTIC):
${consultationResult.possibleExplanations.map(e => `[${e.likelihood}] ${e.hypothesis}: ${e.rationale}`).join('\n')}

4. CLINICIAN FOLLOW-UP QUESTIONS:
${consultationResult.suggestedFollowUpQuestions.map(q => `- ${q}`).join('\n')}

5. RECOMMENDED NEXT STEPS:
- Diagnostic Orders: ${consultationResult.recommendedNextSteps.diagnosticOrders.join(', ')}
- Bedside Exams: ${consultationResult.recommendedNextSteps.bedsideExams.join(', ')}
- Monitoring: ${consultationResult.recommendedNextSteps.monitoringOrReferral}

DISCLAIMER: ${consultationResult.disclaimer}`;

    navigator.clipboard.writeText(briefText);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Workflow Navigation Pathway */}
      <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs text-slate-500 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/" className="hover:text-teal-700 font-medium">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to="/patients" className="hover:text-teal-700 font-medium">Patient Records</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link 
            to={selectedPatient ? `/patients?selected=${selectedPatient.id}` : '/patients'} 
            className="hover:text-teal-700 font-medium"
          >
            Patient Details ({selectedPatient?.name || 'Selected'})
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className={`px-2 py-0.5 rounded-lg font-bold ${
            !consultationResult 
              ? 'bg-teal-50 text-teal-800 border border-teal-200' 
              : 'text-slate-700'
          }`}>
            AI Assistant
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className={`px-2 py-0.5 rounded-lg font-bold ${
            consultationResult 
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-2xs' 
              : 'text-slate-400'
          }`}>
            Consultation Results
          </span>
        </div>

        {selectedPatient && (
          <Link
            to={`/patients?selected=${selectedPatient.id}`}
            className="hidden sm:flex items-center gap-1 text-xs text-teal-700 font-semibold hover:underline"
          >
            <span>View {selectedPatient.name.split(' ')[0]}'s Chart</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Consultation Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Patient Clinical Consultation Workflow
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-100">
                Decision Support
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Structured 5-step intake, differential analysis, and evidence-guided diagnostic pathways.
            </p>
          </div>
        </div>

        {consultationResult && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              to={`/patients?selected=${consultationResult.patientId}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Patient Details</span>
            </Link>

            <button
              type="button"
              onClick={handleResetConsultation}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Consultation</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Workflow Body */}
      {!consultationResult ? (
        <form onSubmit={handleSubmitConsultation} className="space-y-6">
          {/* STEP 1: Select Patient */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Select Patient
                </h3>
              </div>
              <span className="text-xs text-slate-400">Choose from registered clinical registry</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Patient Medical Record
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age}y {p.gender}) · ID: {p.id} · Allergies: {p.allergies.join(', ') || 'NKDA'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 2: Patient Basic Information & Medical History Display */}
          {selectedPatient && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Patient Profile & Medical History
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  {selectedPatient.id}
                </span>
              </div>

              {/* Demographics Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-sky-50 to-white border border-teal-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                      {selectedPatient.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPatient.gender} · {selectedPatient.age} years old · Blood {selectedPatient.bloodType || 'O+'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5 sm:text-right">
                  <p>Contact: <strong className="font-mono text-slate-900">{selectedPatient.phone}</strong></p>
                  <p className="text-slate-500 truncate max-w-xs">{selectedPatient.email}</p>
                  <p className="text-[11px] text-slate-400">Emergency: {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.phone})</p>
                </div>
              </div>

              {/* Vitals Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Blood Pressure</span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {selectedPatient.recentVitals.bloodPressure}
                  </span>
                  <span className="text-[10px] text-slate-400 block">mmHg</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Heart Rate</span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {selectedPatient.recentVitals.heartRate}
                  </span>
                  <span className="text-[10px] text-slate-400 block">bpm</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Oxygen Saturation</span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {selectedPatient.recentVitals.oxygenSaturation}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">Room Air</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Body Temp</span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {selectedPatient.recentVitals.temperature}°F
                  </span>
                  <span className="text-[10px] text-slate-400 block">Oral</span>
                </div>
              </div>

              {/* Medical History & Chronic Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Chronic Conditions */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    Medical History & Conditions
                  </span>
                  {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.chronicConditions.map((cond, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800">
                          {cond}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No chronic illnesses on record.</p>
                  )}
                  {selectedPatient.medicalHistory && (
                    <p className="text-[11px] text-slate-600 pt-1 leading-relaxed border-t border-slate-200/60">
                      {selectedPatient.medicalHistory}
                    </p>
                  )}
                </div>

                {/* Active Prescriptions */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    Active Medications
                  </span>
                  {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 ? (
                    <div className="space-y-1">
                      {selectedPatient.currentMedications.map((med, i) => (
                        <div key={i} className="bg-white px-2.5 py-1 rounded-lg border border-slate-200/70 text-slate-800 font-medium text-xs">
                          {med}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No current prescriptions.</p>
                  )}
                </div>

                {/* Allergies & Alerts */}
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Verified Allergies
                  </span>
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.allergies.map((all, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white text-rose-700 border border-rose-200">
                          ⚠️ {all}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-rose-600 italic">No known drug allergies (NKDA).</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Enter Current Symptoms */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Enter Current Symptoms & Chief Complaint
                </h3>
              </div>
              <span className="text-xs text-slate-400">Clinical intake description</span>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Clinical Simulation Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {symptomPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left hover:bg-teal-50 hover:border-teal-200 transition-all text-xs"
                  >
                    <strong className="block text-slate-800 font-bold truncate">{preset.label}</strong>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{preset.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms Input Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Symptom Description
              </label>
              <textarea
                rows={4}
                required
                value={symptomsInput}
                onChange={(e) => {
                  setSymptomsInput(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Describe current complaints, location, pain scale (1-10), aggravating/relieving factors, and onset duration..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>Provide clinical observations or patient-reported statements.</span>
                <span className="font-mono">{symptomsInput.length} chars</span>
              </div>
            </div>

            {/* Optional Vitals Station Override */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Update Today's Intake Vitals (Optional)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={vitalsInput.bp}
                    onChange={(e) => setVitalsInput({ ...vitalsInput, bp: e.target.value })}
                    placeholder={selectedPatient?.recentVitals.bloodPressure || '120/80'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Heart Rate</label>
                  <input
                    type="text"
                    value={vitalsInput.hr}
                    onChange={(e) => setVitalsInput({ ...vitalsInput, hr: e.target.value })}
                    placeholder={`${selectedPatient?.recentVitals.heartRate || 72} bpm`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">SpO2 (%)</label>
                  <input
                    type="text"
                    value={vitalsInput.spo2}
                    onChange={(e) => setVitalsInput({ ...vitalsInput, spo2: e.target.value })}
                    placeholder={`${selectedPatient?.recentVitals.oxygenSaturation || 98}%`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Temp (°F)</label>
                  <input
                    type="text"
                    value={vitalsInput.temp}
                    onChange={(e) => setVitalsInput({ ...vitalsInput, temp: e.target.value })}
                    placeholder={`${selectedPatient?.recentVitals.temperature || 98.6}°F`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 4: Submit to Mock AI Assistant */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Mock AI Assistant decision support · Confidential clinical simulation
            </span>

            <button
              type="submit"
              disabled={isLoading || !symptomsInput.trim()}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 disabled:opacity-40 shadow-sm transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-100" />
                  <span>Submit Consultation to AI Assistant</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* STEP 5: Structured AI Assistant Response */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Top Actions on Result */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-teal-950">
                  AI Consultation Analysis Ready ({consultationResult.consultationId})
                </h4>
                <p className="text-[11px] text-teal-800">
                  Synthesized for {consultationResult.patientName} at {consultationResult.timestamp}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/patients?selected=${consultationResult.patientId}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 transition-colors shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>View Patient EHR</span>
              </Link>

              <button
                type="button"
                onClick={handleCopyConsultationBrief}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-teal-200 text-teal-900 hover:bg-teal-50 transition-colors shadow-2xs"
              >
                {copiedBrief ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Copied Brief</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Full Brief</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveToPatientRecord}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-2xs transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved to EHR!</span>
                  </>
                ) : (
                  <>
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Save to EHR Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 1: Summary of Patient Symptoms */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>1. Summary of Patient Symptoms</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {consultationResult.symptomSummary}
            </p>
          </div>

          {/* Section 2: Relevant Medical History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>2. Relevant Medical History Intersection</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Contributing Conditions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  Contributing Conditions
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  {consultationResult.relevantMedicalHistory.contributingConditions.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-600 font-bold">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Medication Considerations */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  Active Prescriptions Check
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  {consultationResult.relevantMedicalHistory.medicationConsiderations.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-600 font-bold">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Allergy Warnings */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                <span className="font-bold text-rose-900 block uppercase tracking-wider text-[11px]">
                  Allergy Safety Flags
                </span>
                <ul className="space-y-1.5 text-rose-800">
                  {consultationResult.relevantMedicalHistory.allergyAlerts.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">⚠️</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Possible Explanations for Symptoms (Differentials) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>3. Possible Explanations for the Symptoms</span>
              </h3>
              <span className="text-[11px] text-slate-400 italic">Clinical differential considerations</span>
            </div>

            <div className="space-y-3">
              {consultationResult.possibleExplanations.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{idx + 1}.</span>
                      <span>{item.hypothesis}</span>
                    </h4>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.likelihood === 'Primary Consideration'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : item.likelihood === 'Secondary Consideration'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {item.likelihood}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    {item.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Suggested Follow-up Questions for the Clinician */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                <span>4. Suggested Follow-Up Questions to Ask Patient</span>
              </h3>
              <span className="text-[11px] text-slate-400">Targeted examination inquiries</span>
            </div>

            <div className="space-y-2">
              {consultationResult.suggestedFollowUpQuestions.map((q, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Recommended Next Steps */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-teal-600" />
              <span>5. Recommended Next Steps for Healthcare Professional</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Diagnostic Orders */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2">
                <span className="font-bold text-teal-950 uppercase tracking-wider text-[11px] block">
                  Candidate Diagnostic Orders
                </span>
                <div className="space-y-1.5">
                  {consultationResult.recommendedNextSteps.diagnosticOrders.map((order, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-teal-200/70 text-slate-800 font-medium">
                      <span className="text-teal-600 font-bold">✓</span>
                      <span>{order}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bedside Physical Exams */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Priority Bedside Physical Examinations
                </span>
                <div className="space-y-1.5">
                  {consultationResult.recommendedNextSteps.bedsideExams.map((exam, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200/70 text-slate-800 font-medium">
                      <span className="text-teal-600 font-bold">·</span>
                      <span>{exam}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monitoring or Referral */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <strong>Disposition & Monitoring: </strong>
                <span>{consultationResult.recommendedNextSteps.monitoringOrReferral}</span>
              </div>
            </div>
          </div>

          {/* Required Non-Diagnostic Clinical Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Clinical Decision Support Disclaimer: </strong>
              {consultationResult.disclaimer}
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleResetConsultation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start New Consultation</span>
              </button>

              <Link
                to={`/patients?selected=${consultationResult.patientId}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-colors shadow-2xs"
              >
                <User className="w-4 h-4 text-teal-600" />
                <span>View {consultationResult.patientName.split(' ')[0]}'s Record & EHR</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleCopyConsultationBrief}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Full Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
