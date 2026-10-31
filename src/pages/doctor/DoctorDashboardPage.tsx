import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Search, 
  Bell, 
  CheckCircle2, 
  UserX, 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  Eye, 
  Filter, 
  HeartPulse, 
  Pill, 
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { authService } from '../../services/authService';
import { clinicService } from '../../services/clinicService';
import { 
  consultationWorkflowService, 
  ConsultationRequest, 
  ClinicNotification 
} from '../../services/consultationWorkflowService';
import { Patient, Doctor, INITIAL_DOCTORS } from '../../services/mockData';
import { ConsultationReviewModal } from '../../components/doctor/ConsultationReviewModal';

export const DoctorDashboardPage: React.FC = () => {
  const currentDoctor = authService.getDoctorUser() || INITIAL_DOCTORS[1]; // Dr. Marcus Vance

  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [notifications, setNotifications] = useState<ClinicNotification[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Search & Filter state for assigned patients
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'All' | 'Red Flag' | 'Urgent' | 'Normal'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Awaiting Doctor Approval' | 'Accepted' | 'Reassigned'>('All');

  // Modals state
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<ConsultationRequest | null>(null);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const loadData = () => {
    setRequests(consultationWorkflowService.getAllRequests());
    setNotifications(consultationWorkflowService.getNotifications(currentDoctor.id));
    setPatients(clinicService.getPatients());
  };

  useEffect(() => {
    loadData();
    const unsubscribeWorkflow = consultationWorkflowService.subscribe(loadData);
    const unsubscribeClinic = clinicService.subscribe(loadData);
    return () => {
      unsubscribeWorkflow();
      unsubscribeClinic();
    };
  }, [currentDoctor.id]);

  // Filter consultation requests
  const filteredRequests = requests.filter(req => {
    // Show requests assigned to this doctor or relevant
    const matchesDoctor = req.assignedDoctorId === currentDoctor.id || req.reassignedDoctorId === currentDoctor.id || true;
    const matchesUrgency = urgencyFilter === 'All' || req.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.patientPhone.includes(searchQuery);

    return matchesDoctor && matchesUrgency && matchesStatus && matchesSearch;
  });

  // Filter assigned patients
  const filteredPatients = patients.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '')) ||
      p.email.toLowerCase().includes(query)
    );
  });

  const unreadNotifications = notifications.filter(n => !n.read);
  const pendingRequestsCount = requests.filter(r => r.status === 'Awaiting Doctor Approval').length;
  const redFlagCount = requests.filter(r => r.urgency === 'Red Flag' && r.status === 'Awaiting Doctor Approval').length;

  return (
    <div className="space-y-6">
      {/* Top Doctor Welcome & Quick Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <span>Doctor Dashboard</span>
            <span>•</span>
            <span>{currentDoctor.department}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            {currentDoctor.name}, {currentDoctor.title}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {currentDoctor.specialty} • Suite {currentDoctor.room} • {currentDoctor.schedule}
          </p>
        </div>

        {/* Header Right: Notifications Button & Alerts */}
        <div className="flex items-center space-x-3">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(prev => !prev)}
              className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors flex items-center space-x-2 text-xs font-medium"
            >
              <Bell className="w-4 h-4 text-teal-400" />
              <span>Triage Alerts</span>
              {unreadNotifications.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-800">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Bell className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-xs text-slate-900">Clinical Alerts & Notifications</span>
                  </div>
                  <button
                    onClick={() => {
                      consultationWorkflowService.markAllNotificationsAsRead(currentDoctor.id);
                    }}
                    className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 text-center">No notifications at this time.</p>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs space-y-1 transition-colors ${
                          !notif.read ? 'bg-teal-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold ${
                              notif.urgency === 'Red Flag'
                                ? 'text-rose-700'
                                : notif.urgency === 'Urgent'
                                ? 'text-amber-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <button
                    onClick={() => setShowNotificationsDropdown(false)}
                    className="text-xs text-slate-600 font-medium hover:text-slate-900"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Pending Approvals
            </span>
            <span className="text-2xl font-bold text-amber-700 mt-1 block">
              {pendingRequestsCount}
            </span>
            <span className="text-[11px] text-slate-400">Awaiting doctor review</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Red Flag Alerts
            </span>
            <span className="text-2xl font-bold text-rose-700 mt-1 block">
              {redFlagCount}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">Critical cardiovascular/neuro</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Assigned Patients
            </span>
            <span className="text-2xl font-bold text-teal-800 mt-1 block">
              {patients.length}
            </span>
            <span className="text-[11px] text-slate-400">Active roster records</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Patients Today
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {currentDoctor.patientsToday} / {currentDoctor.maxPatientsPerDay}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Capacity available</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SECTION 1: NEW CONSULTATION REQUESTS QUEUE (HUMAN-IN-THE-LOOP APPROVAL) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">
                New Consultation Requests & Triage Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                {filteredRequests.length} Cases
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review AI preliminary symptom intake, inspect conversation transcripts, and Accept or Reject/Reassign.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs font-semibold text-slate-600">
              {(['All', 'Red Flag', 'Urgent', 'Normal'] as const).map(urg => (
                <button
                  key={urg}
                  onClick={() => setUrgencyFilter(urg)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    urgencyFilter === urg
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Awaiting Doctor Approval">Awaiting Approval</option>
              <option value="Accepted">Accepted</option>
              <option value="Reassigned">Reassigned</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
              No consultation requests matching the selected filters.
            </div>
          ) : (
            filteredRequests.map(req => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 bg-white transition-all space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    {/* Urgency Badge */}
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.urgency === 'Red Flag'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          : req.urgency === 'Urgent'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {req.urgency === 'Red Flag' && <ShieldAlert className="w-3.5 h-3.5 mr-1" />}
                      {req.urgency === 'Urgent' && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                      {req.urgency === 'Normal' && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                      {req.urgency}
                    </span>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm inline-flex items-center space-x-2">
                        <span>{req.patientName}</span>
                        <span className="text-xs text-slate-400 font-normal">
                          ({req.patientAge}y, {req.patientGender}) • ID: {req.patientId}
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">{req.createdAt}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'Accepted'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : req.status === 'Reassigned'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Reported Symptoms & AI Rationale */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="md:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                      Patient Reported Symptoms:
                    </span>
                    <p className="text-slate-800 font-medium mt-0.5">
                      "{req.symptomsReported}"
                    </p>
                  </div>

                  <div className="bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                    <span className="text-teal-800 font-semibold block uppercase text-[10px]">
                      AI Triage Rationale:
                    </span>
                    <p className="text-slate-700 mt-0.5">
                      {req.urgencyReason.slice(0, 110)}...
                    </p>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span>AI Intake Chat: {req.chatTranscript.length} messages</span>
                    <span>•</span>
                    <span>Assigned: {req.reassignedDoctorName || req.assignedDoctorName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Review & Chat Transcript Button */}
                    <button
                      onClick={() => setSelectedRequestForReview(req)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Details & Transcript</span>
                    </button>

                    {/* Quick Accept/Reject if still awaiting approval */}
                    {req.status === 'Awaiting Doctor Approval' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequestForReview(req);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRequestForReview(req);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Reject / Reassign</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 2: ASSIGNED PATIENT RECORDS WITH SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Assigned Patients & Medical History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Search by name, phone number, or patient ID to view complete electronic health records (EHR).
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, or ID (e.g. pat-1)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500 text-slate-800"
            />
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Chronic Conditions</th>
                <th className="py-3 px-4">Current Medications</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No patients match your search query.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-teal-700 text-xs">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <strong className="text-slate-900 block font-semibold">{patient.name}</strong>
                          <span className="text-[11px] text-slate-400">
                            {patient.age}y • {patient.gender} • ID: {patient.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                        <Mail className="w-3 h-3" />
                        <span>{patient.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                          patient.chronicConditions.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded text-[10px] font-medium border border-amber-200">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">None documented</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {patient.currentMedications && patient.currentMedications.length > 0 ? (
                          patient.currentMedications.slice(0, 2).map((m, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                        {patient.currentMedications && patient.currentMedications.length > 2 && (
                          <span className="text-[10px] text-slate-400">+{patient.currentMedications.length - 2} more</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {patient.lastVisit}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPatientForHistory(patient)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center space-x-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open Complete EHR</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CONSULTATION REVIEW & APPROVAL MODAL */}
      {selectedRequestForReview && (
        <ConsultationReviewModal
          request={selectedRequestForReview}
          currentDoctor={currentDoctor}
          onClose={() => setSelectedRequestForReview(null)}
          onActionComplete={() => {
            loadData();
          }}
        />
      )}

      {/* MODAL 2: COMPLETE PATIENT EHR MODAL */}
      {selectedPatientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  {selectedPatientForHistory.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedPatientForHistory.name} — Electronic Health Record
                  </h3>
                  <p className="text-xs text-slate-500">
                    ID: {selectedPatientForHistory.id} • DOB: {selectedPatientForHistory.dob} ({selectedPatientForHistory.age}y, {selectedPatientForHistory.gender})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientForHistory(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Demographics & Vitals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                    Contact & Insurance
                  </span>
                  <p><strong>Phone:</strong> {selectedPatientForHistory.phone}</p>
                  <p><strong>Email:</strong> {selectedPatientForHistory.email}</p>
                  <p><strong>Address:</strong> {selectedPatientForHistory.address}</p>
                  <p><strong>Insurance:</strong> {selectedPatientForHistory.insuranceProvider}</p>
                  <p>
                    <strong>Emergency:</strong> {selectedPatientForHistory.emergencyContact.name} ({selectedPatientForHistory.emergencyContact.relationship}) - {selectedPatientForHistory.emergencyContact.phone}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                    Most Recent Vital Signs ({selectedPatientForHistory.recentVitals.recordedAt})
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-800">
                    <div>BP: <strong>{selectedPatientForHistory.recentVitals.bloodPressure} mmHg</strong></div>
                    <div>HR: <strong>{selectedPatientForHistory.recentVitals.heartRate} bpm</strong></div>
                    <div>Temp: <strong>{selectedPatientForHistory.recentVitals.temperature}°F</strong></div>
                    <div>SpO₂: <strong>{selectedPatientForHistory.recentVitals.oxygenSaturation}%</strong></div>
                  </div>
                </div>
              </div>

              {/* Chronic & Allergies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                    Chronic Diagnoses
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatientForHistory.chronicConditions.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                    Documented Allergies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatientForHistory.allergies.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded font-medium">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Active Prescriptions & Regimens
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedPatientForHistory.currentMedications.map((m, i) => (
                    <div key={i} className="bg-white p-2 rounded border border-slate-100 flex items-center space-x-2">
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Longitudinal Clinical Notes
                </span>
                <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                  {selectedPatientForHistory.medicalHistory || 'No additional history records.'}
                </p>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedPatientForHistory(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
