import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  UserX, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  FileText, 
  User, 
  Calendar, 
  Pill, 
  HeartPulse, 
  Activity,
  ArrowRight,
  Send,
  AlertCircle
} from 'lucide-react';
import { 
  ConsultationRequest, 
  consultationWorkflowService 
} from '../../services/consultationWorkflowService';
import { Doctor, INITIAL_DOCTORS } from '../../services/mockData';

interface ConsultationReviewModalProps {
  request: ConsultationRequest | null;
  onClose: () => void;
  currentDoctor: Doctor;
  onActionComplete: () => void;
}

export const ConsultationReviewModal: React.FC<ConsultationReviewModalProps> = ({
  request,
  onClose,
  currentDoctor,
  onActionComplete
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'transcript' | 'ehr'>('review');
  const [isRejecting, setIsRejecting] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('Approved after reviewing AI preliminary intake notes.');
  const [appointmentTime, setAppointmentTime] = useState('Today at 03:30 PM');
  const [rejectionReason, setRejectionReason] = useState('Requires specialized neurological evaluation beyond primary care scope.');
  const [selectedReassignDoc, setSelectedReassignDoc] = useState<string>(
    INITIAL_DOCTORS.find(d => d.id !== currentDoctor.id)?.id || 'doc-1'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  if (!request) return null;

  const handleAccept = () => {
    setIsProcessing(true);
    setTimeout(() => {
      consultationWorkflowService.acceptConsultation(
        request.id,
        doctorNotes,
        appointmentTime
      );
      setIsProcessing(false);
      onActionComplete();
      onClose();
    }, 400);
  };

  const handleRejectAndReassign = () => {
    if (!rejectionReason.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      consultationWorkflowService.rejectAndReassign(
        request.id,
        rejectionReason,
        selectedReassignDoc
      );
      setIsProcessing(false);
      onActionComplete();
      onClose();
    }, 400);
  };

  const otherDoctors = INITIAL_DOCTORS.filter(d => d.id !== currentDoctor.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-lg">
                  Clinical Consultation Review
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    request.urgency === 'Red Flag'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                      : request.urgency === 'Urgent'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {request.urgency === 'Red Flag' && <ShieldAlert className="w-3.5 h-3.5 mr-1" />}
                  {request.urgency === 'Urgent' && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                  {request.urgency === 'Normal' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  {request.urgency} Urgency
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient: <strong className="text-slate-800">{request.patientName}</strong> ({request.patientAge}y, {request.patientGender}) • ID: {request.patientId} • Submitted: {request.createdAt}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('review')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'review'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Consultation Overview & Action</span>
          </button>

          <button
            onClick={() => setActiveTab('transcript')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'transcript'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Chat Transcript ({request.chatTranscript.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ehr')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'ehr'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Patient EHR & Baseline History</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: REVIEW & ACTION */}
          {activeTab === 'review' && (
            <div className="space-y-5">
              {/* Status Header Alert */}
              <div
                className={`p-4 rounded-xl border flex items-start space-x-3 text-sm ${
                  request.status === 'Accepted'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : request.status === 'Reassigned'
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : request.status === 'Rejected'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      Current Status: {request.status}
                    </span>
                    {request.appointmentTime && (
                      <span className="text-xs bg-white/80 px-2 py-0.5 rounded border">
                        {request.appointmentTime}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1">
                    {request.status === 'Awaiting Doctor Approval'
                      ? 'This consultation request is waiting for your review. Please evaluate symptoms, check the chatbot transcript, and Accept or Reassign.'
                      : request.doctorNotes || 'Consultation processed.'}
                  </p>
                  {request.reassignedDoctorName && (
                    <p className="text-xs mt-1 font-semibold">
                      Reassigned to: {request.reassignedDoctorName}
                    </p>
                  )}
                </div>
              </div>

              {/* Reported Symptoms */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Patient Reported Symptoms
                </span>
                <p className="text-slate-900 font-medium text-sm leading-relaxed">
                  "{request.symptomsReported}"
                </p>

                {request.symptomsList && request.symptomsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {request.symptomsList.map((sym, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                      >
                        • {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Triage Rationale */}
              <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 space-y-1.5">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1">
                  <span>Simulated AI Triage Rationale</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {request.urgencyReason}
                </p>
              </div>

              {/* Action Form */}
              {request.status === 'Awaiting Doctor Approval' && !isRejecting && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approve Consultation</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Physician Clinical Notes / Initial Instruction:
                    </label>
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Proposed Appointment Time:
                      </label>
                      <input
                        type="text"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline flex items-center space-x-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Decline / Reassign to another physician</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleAccept}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Consultation Request</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Rejection / Reassignment Form */}
              {request.status === 'Awaiting Doctor Approval' && isRejecting && (
                <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-rose-900 text-sm flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Reassign Consultation Request</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel Reassignment
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Reason for Reassignment / Decline:
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Better aligned with cardiology/neurology specialty..."
                      className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Reassign to Physician:
                    </label>
                    <select
                      value={selectedReassignDoc}
                      onChange={(e) => setSelectedReassignDoc(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg focus:outline-none focus:border-rose-400"
                    >
                      {otherDoctors.map(doc => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} — {doc.specialty} ({doc.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={isProcessing || !rejectionReason.trim()}
                      onClick={handleRejectAndReassign}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Confirm Reassignment</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FULL CHATBOT TRANSCRIPT */}
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              <div className="bg-slate-100 p-3 rounded-lg text-xs text-slate-600 flex items-center justify-between">
                <span>Verbatim AI Intake Transcript</span>
                <span>{request.chatTranscript.length} messages exchanged</span>
              </div>

              <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                {request.chatTranscript.map((msg, i) => (
                  <div
                    key={msg.id || i}
                    className={`flex items-start space-x-2.5 ${
                      msg.sender === 'patient' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        msg.sender === 'patient'
                          ? 'bg-blue-600 text-white'
                          : 'bg-teal-700 text-teal-100'
                      }`}
                    >
                      {msg.sender === 'patient' ? <User className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                    </div>

                    <div className="max-w-[80%] space-y-1">
                      <div
                        className={`p-3 rounded-xl text-xs leading-relaxed ${
                          msg.sender === 'patient'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 block px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PATIENT EHR BASELINE */}
          {activeTab === 'ehr' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Patient Contact</span>
                  <p className="font-semibold text-slate-800 mt-1">{request.patientPhone}</p>
                  <p className="text-slate-600">{request.patientEmail}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-medium">Clinical Records ID</span>
                  <p className="font-semibold text-slate-800 mt-1">{request.patientId}</p>
                  <p className="text-slate-600">Gender: {request.patientGender} • Age: {request.patientAge}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-slate-500 font-semibold block">Medical History & Chronic Baseline:</span>
                <p className="text-slate-800">{request.relevantMedicalHistory || 'No major prior conditions recorded.'}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500 font-semibold block">Current Medications:</span>
                {request.currentMedications && request.currentMedications.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {request.currentMedications.map((med, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700">
                        💊 {med}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">None currently active.</p>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500 font-semibold block">Documented Allergies:</span>
                {request.allergies && request.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {request.allergies.map((all, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-md font-semibold">
                        ⚠️ {all}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No known drug allergies (NKDA).</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Reviewing as {currentDoctor.name} ({currentDoctor.title})</span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
