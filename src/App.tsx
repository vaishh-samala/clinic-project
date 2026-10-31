import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { PatientDashboardPage } from './pages/patient/PatientDashboardPage';
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';
import { DashboardPage } from './pages/DashboardPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { PatientsPage } from './pages/PatientsPage';
import { ClinicAgentPage } from './pages/ClinicAgentPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dedicated Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/patient" element={<LoginPage />} />
        <Route path="/login/doctor" element={<LoginPage />} />

        {/* Authenticated Clinic & Role Application Layout */}
        <Route path="/" element={<MainLayout />}>
          {/* Main Clinic Dashboard */}
          <Route index element={<DashboardPage />} />
          
          {/* Patient Role Routes */}
          <Route path="patient" element={<PatientDashboardPage />} />
          <Route path="patient/dashboard" element={<PatientDashboardPage />} />
          <Route path="patient/consultation" element={<PatientDashboardPage />} />

          {/* Doctor Role Routes */}
          <Route path="doctor" element={<DoctorDashboardPage />} />
          <Route path="doctor/dashboard" element={<DoctorDashboardPage />} />
          <Route path="doctor/requests" element={<DoctorDashboardPage />} />
          <Route path="doctor/patients" element={<DoctorDashboardPage />} />

          {/* Core Clinical Management Operations */}
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/:patientId" element={<PatientsPage />} />
          <Route path="ai-assistant" element={<ClinicAgentPage />} />
          <Route path="clinic-agent" element={<ClinicAgentPage />} />
          <Route path="consultation" element={<ClinicAgentPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
