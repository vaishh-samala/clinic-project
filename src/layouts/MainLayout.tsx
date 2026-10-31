import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { QuickTriageModal } from '../components/QuickTriageModal';
import { NewAppointmentModal } from '../components/NewAppointmentModal';
import { PatientDetailModal } from '../components/PatientDetailModal';
import { RoleSwitcherBanner } from '../components/common/RoleSwitcherBanner';
import { clinicService } from '../services/clinicService';
import { authService, AuthSession } from '../services/authService';
import { consultationWorkflowService } from '../services/consultationWorkflowService';
import { Patient, Doctor, Appointment } from '../services/mockData';

export const MainLayout: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [session, setSession] = useState<AuthSession | null>(authService.getSession());
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);
  const [selectedPatientForBooking, setSelectedPatientForBooking] = useState<Patient | null>(null);
  const [isQuickTriageOpen, setIsQuickTriageOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [urgentCount, setUrgentCount] = useState(2);

  useEffect(() => {
    const update = () => {
      setPatients(clinicService.getPatients());
      setDoctors(clinicService.getDoctors());
      setSession(authService.getSession());
      const metrics = clinicService.getMetrics();
      setUrgentCount(metrics.urgentCasesCount);
    };

    update();
    const unsubClinic = clinicService.subscribe(update);
    const unsubAuth = authService.subscribe(update);
    return () => {
      unsubClinic();
      unsubAuth();
    };
  }, []);

  const handleCreateAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    clinicService.addAppointment(appointmentData);

    // Also route to Doctor's Consultation Request & Triage Queue for explicit acceptance/rejection
    const patientObj = patients.find(p => p.id === appointmentData.patientId);
    consultationWorkflowService.submitNewConsultation({
      patientId: appointmentData.patientId,
      patientName: appointmentData.patientName,
      patientAge: appointmentData.patientAge,
      patientGender: patientObj?.gender || 'Unknown',
      patientPhone: patientObj?.phone || '+1 (555) 000-0000',
      patientEmail: patientObj?.email || 'patient@clinic.org',
      symptomsReported: appointmentData.reasonForVisit,
      symptomsList: appointmentData.symptoms || [appointmentData.reasonForVisit],
      urgency: appointmentData.urgency.includes('Level 1') ? 'Red Flag' : appointmentData.urgency.includes('Level 2') ? 'Urgent' : 'Normal',
      urgencyReason: appointmentData.agentRecommendedAction || 'Patient scheduled outpatient visit request.',
      relevantMedicalHistory: patientObj?.medicalHistory || 'Outpatient clinical request',
      currentMedications: patientObj?.currentMedications || [],
      allergies: patientObj?.allergies || [],
      chatTranscript: [
        {
          id: `msg-${Date.now()}`,
          sender: 'patient',
          text: `Direct Visit Request: ${appointmentData.reasonForVisit} for ${appointmentData.date} at ${appointmentData.time}`,
          timestamp: 'Just now'
        }
      ],
      assignedDoctorId: appointmentData.doctorId,
      assignedDoctorName: appointmentData.doctorName
    });

    setIsNewAppointmentOpen(false);
    setSelectedPatientForBooking(null);
  };

  const handleOpenBookingForPatient = (patient: Patient) => {
    setSelectedPatientForBooking(patient);
    setIsNewAppointmentOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar navigation */}
      <Sidebar 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        urgentCount={urgentCount} 
      />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Persona / Role Switcher Banner */}
        <RoleSwitcherBanner session={session} />

        {/* Top Header */}
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          onOpenQuickTriage={() => setIsQuickTriageOpen(true)}
          onOpenNewAppointment={() => {
            setSelectedPatientForBooking(null);
            setIsNewAppointmentOpen(true);
          }}
          activePhysiciansCount={doctors.filter(d => d.status === 'In Clinic' || d.status === 'In Consultation').length}
        />

        {/* Dynamic page outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet context={{
            patients,
            doctors,
            onOpenPatientDetail: (pat: Patient) => setSelectedPatientForDetail(pat),
            onOpenBookingForPatient: handleOpenBookingForPatient,
            onOpenQuickTriage: () => setIsQuickTriageOpen(true)
          }} />
        </main>
      </div>

      {/* Global Modals */}
      <QuickTriageModal
        isOpen={isQuickTriageOpen}
        onClose={() => setIsQuickTriageOpen(false)}
        patients={patients}
        doctors={doctors}
      />

      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => {
          setIsNewAppointmentOpen(false);
          setSelectedPatientForBooking(null);
        }}
        patients={patients}
        doctors={doctors}
        initialPatient={selectedPatientForBooking}
        onSave={handleCreateAppointment}
      />

      <PatientDetailModal
        patient={selectedPatientForDetail}
        onClose={() => setSelectedPatientForDetail(null)}
        onBookAppointment={(pat) => {
          setSelectedPatientForBooking(pat);
          setIsNewAppointmentOpen(true);
        }}
      />
    </div>
  );
};
