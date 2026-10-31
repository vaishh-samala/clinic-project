import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle, 
  Pill, 
  HeartPulse, 
  Activity, 
  Bot, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Sparkles,
  Stethoscope,
  Info
} from 'lucide-react';
import { authService } from '../../services/authService';
import { 
  consultationWorkflowService, 
  ConsultationRequest, 
  PastPatientConsultation 
} from '../../services/consultationWorkflowService';
import { PatientSymptomChatbot } from '../../components/patient/PatientSymptomChatbot';

export const PatientDashboardPage: React.FC = () => {
  const session = authService.getSession();
  const patient = authService.getPatientUser();

  const [activeTab, setActiveTab] = useState<'overview' | 'chatbot' | 'history'>('overview');
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [pastConsultations, setPastConsultations] = useState<PastPatientConsultation[]>([]);
  const [selectedTranscriptRequest, setSelectedTranscriptRequest] = useState<ConsultationRequest | null>(null);

  useEffect(() => {
    if (!patient) return;

    const loadData = () => {
      setRequests(consultationWorkflowService.getRequestsForPatient(patient.id));
      setPastConsultations(consultationWorkflowService.getPastConsultationsForPatient(patient.id));
    };

    loadData();
    const unsubscribe = consultationWorkflowService.subscribe(loadData);
    return () => unsubscribe();
  }, [patient?.id]);

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">No patient active in session. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            <span>Patient Portal</span>
            <span>•</span>
            <span>ID: {patient.id}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Welcome back, {patient.name}
          </h1>
          <p className="text-sm text-teal-100/90 mt-1 max-w-xl">
            Access your personal health profile, past consultations, and connect with our AI triage assistant for new symptoms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('chatbot')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-teal-800 font-semibold text-xs shadow-sm hover:bg-teal-50 transition-colors"
          >
            <Bot className="w-4 h-4 text-teal-600" />
            <span>Start AI Symptom Consultation</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 text-xs font-semibold text-slate-600 space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3.5 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Patient Profile & Active Requests</span>
        </button>

        <button
          onClick={() => setActiveTab('chatbot')}
          className={`py-3.5 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'chatbot'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Symptom Chatbot</span>
          <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px]">Interactive</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3.5 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'history'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Past Consultations ({pastConsultations.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ACTIVE REQUESTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Patient Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Profile Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-base">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{patient.name}</h3>
                  <p className="text-xs text-slate-500">
                    {patient.age} years • {patient.gender} • Blood Type: {patient.bloodType}
                  </p>
                  <span className="inline-block px-2 py-0.5 mt-1 bg-slate-100 text-slate-600 rounded text-[11px] font-mono">
                    ID: {patient.id}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2.5 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{patient.email}</span>
                </div>
                <div className="flex items-center space-x-2.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{patient.address}</span>
                </div>
              </div>

              {/* Vitals Snapshot */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Last Recorded Vitals ({patient.recentVitals.recordedAt})
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Blood Pressure:</span>
                    <strong className="text-slate-800">{patient.recentVitals.bloodPressure} mmHg</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Heart Rate:</span>
                    <strong className="text-slate-800">{patient.recentVitals.heartRate} bpm</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Temperature:</span>
                    <strong className="text-slate-800">{patient.recentVitals.temperature}°F</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">SpO₂:</span>
                    <strong className="text-slate-800">{patient.recentVitals.oxygenSaturation}%</strong>
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Allergies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((all, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        all.includes('No known')
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {all}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Chronic Diagnoses
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {patient.chronicConditions.map((cond, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md text-xs bg-amber-50 text-amber-800 border border-amber-200 font-medium"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Current Medications
                </span>
                <div className="space-y-1">
                  {patient.currentMedications.map((med, i) => (
                    <div
                      key={i}
                      className="text-xs p-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center space-x-1.5 text-slate-700"
                    >
                      <Pill className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span>{med}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Medical History & Notes
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {patient.medicalHistory || 'No additional history records.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Active Consultations & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active / Pending Consultation Requests */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Active & Recent Consultation Requests
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live status of symptom intakes submitted to clinic physicians
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('chatbot')}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>+ New Intake</span>
                </button>
              </div>

              {requests.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Bot className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No active consultation requests</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Feel free to describe any new health concern to our AI triage assistant to receive preliminary evaluation and route to a doctor.
                  </p>
                  <button
                    onClick={() => setActiveTab('chatbot')}
                    className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Launch Symptom Chatbot
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-teal-200 transition-all bg-white shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {req.id}
                          </span>
                          <span className="text-xs text-slate-400">• {req.createdAt}</span>
                          <span className="text-xs text-slate-700">
                            Dr: <strong className="text-slate-900">{req.reassignedDoctorName || req.assignedDoctorName}</strong>
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center space-x-2">
                          {/* Urgency Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center space-x-1 ${
                              req.urgency === 'Red Flag'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : req.urgency === 'Urgent'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <span>{req.urgency}</span>
                          </span>

                          {/* Approval Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                              req.status === 'Accepted'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : req.status === 'Reassigned'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            }`}
                          >
                            {req.status === 'Accepted' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                            {req.status === 'Awaiting Doctor Approval' && <Clock className="w-3.5 h-3.5 mr-1" />}
                            <span>{req.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Symptoms */}
                      <p className="text-xs text-slate-800 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        "{req.symptomsReported}"
                      </p>

                      {/* If Accepted, show appointment details */}
                      {req.status === 'Accepted' && (
                        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-emerald-900">
                              Approved by {req.assignedDoctorName}
                            </p>
                            <p className="text-emerald-800 mt-0.5">
                              Appointment time: <strong>{req.appointmentTime || 'Today'}</strong>
                            </p>
                            {req.doctorNotes && (
                              <p className="text-emerald-700 italic mt-0.5">
                                "{req.doctorNotes}"
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* If Reassigned, show explanation */}
                      {req.status === 'Reassigned' && (
                        <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-start space-x-2">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-blue-900">
                              Reassigned to {req.reassignedDoctorName}
                            </p>
                            <p className="text-blue-800 mt-0.5">
                              Clinical Reason: {req.rejectionReason}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* View Chat Transcript button */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setSelectedTranscriptRequest(req)}
                          className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center space-x-1"
                        >
                          <span>View Chat Transcript ({req.chatTranscript?.length || 0})</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50/60 rounded-2xl p-5 border border-teal-200/80 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>How the AI Clinic Agent Works</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
                <div className="bg-white/80 p-3 rounded-xl border border-teal-100">
                  <strong className="text-teal-900 block font-semibold">1. Symptom Chat</strong>
                  <p className="text-slate-600 mt-1">Describe symptoms, onset, and severity conversationally with our virtual triage bot.</p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-teal-100">
                  <strong className="text-teal-900 block font-semibold">2. Urgency Triage</strong>
                  <p className="text-slate-600 mt-1">Calculates preliminary rating (Red Flag, Urgent, Normal) with explicit safety disclaimers.</p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-teal-100">
                  <strong className="text-teal-900 block font-semibold">3. Doctor Approval</strong>
                  <p className="text-slate-600 mt-1">A real physician inspects your transcript and EHR before accepting or reassigning.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI SYMPTOM CHATBOT */}
      {activeTab === 'chatbot' && (
        <div className="max-w-4xl mx-auto">
          <PatientSymptomChatbot
            patient={patient}
            onConsultationSubmitted={() => {
              // Reload requests
              setRequests(consultationWorkflowService.getRequestsForPatient(patient.id));
            }}
          />
        </div>
      )}

      {/* TAB 3: PAST CONSULTATIONS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Past Consultations & Medical Visits</h3>
            <p className="text-xs text-slate-500">
              Verified clinical diagnoses, notes, and medication regimens from prior clinic visits
            </p>
          </div>

          <div className="space-y-4">
            {pastConsultations.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No past consultations recorded.</p>
            ) : (
              pastConsultations.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-sm">{item.date}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-teal-800 font-medium">
                        {item.doctorName} ({item.specialty})
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-400 font-medium block">Reported Symptoms:</span>
                      <p className="text-slate-800">{item.symptoms}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Confirmed Diagnosis:</span>
                      <p className="font-semibold text-slate-900">{item.diagnosis}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block">Doctor's Clinical Notes:</span>
                      <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-100">
                        "{item.clinicalNotes}"
                      </p>
                    </div>

                    {item.prescriptionSummary && (
                      <div className="text-teal-900 bg-teal-50/80 p-2 rounded-lg border border-teal-100 flex items-center space-x-1.5">
                        <Pill className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                        <span>Prescriptions: {item.prescriptionSummary}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Transcript Viewer Modal for Patient */}
      {selectedTranscriptRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Consultation Chatbot Transcript
                </h4>
                <p className="text-xs text-slate-500">
                  Request {selectedTranscriptRequest.id} • Assigned: {selectedTranscriptRequest.assignedDoctorName}
                </p>
              </div>
              <button
                onClick={() => setSelectedTranscriptRequest(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {selectedTranscriptRequest.chatTranscript.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex items-start space-x-2 ${
                    msg.sender === 'patient' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      msg.sender === 'patient' ? 'bg-blue-600 text-white' : 'bg-teal-700 text-teal-100'
                    }`}
                  >
                    {msg.sender === 'patient' ? 'P' : 'AI'}
                  </div>
                  <div
                    className={`p-3 rounded-xl text-xs max-w-[80%] ${
                      msg.sender === 'patient'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedTranscriptRequest(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
