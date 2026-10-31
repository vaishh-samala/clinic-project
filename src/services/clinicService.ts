import { 
  Appointment, 
  Doctor, 
  Patient, 
  TriageEntry, 
  ClinicMetrics,
  PatientActivity,
  INITIAL_APPOINTMENTS, 
  INITIAL_DOCTORS, 
  INITIAL_PATIENTS, 
  INITIAL_TRIAGE_RECORDS,
  INITIAL_ACTIVITIES,
  INITIAL_METRICS,
  AppointmentStatus,
  TriageUrgency
} from './mockData';

const APPOINTMENTS_KEY = 'clinic_agent_appointments_v1';
const PATIENTS_KEY = 'clinic_agent_patients_v1';
const DOCTORS_KEY = 'clinic_agent_doctors_v1';
const TRIAGE_KEY = 'clinic_agent_triage_v1';
const ACTIVITIES_KEY = 'clinic_agent_activities_v1';

class ClinicService {
  private appointments: Appointment[] = [];
  private patients: Patient[] = [];
  private doctors: Doctor[] = [];
  private triageRecords: TriageEntry[] = [];
  private activities: PatientActivity[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.initData();
  }

  private initData() {
    try {
      const storedAppts = localStorage.getItem(APPOINTMENTS_KEY);
      this.appointments = storedAppts ? JSON.parse(storedAppts) : INITIAL_APPOINTMENTS;

      const storedPatients = localStorage.getItem(PATIENTS_KEY);
      this.patients = storedPatients ? JSON.parse(storedPatients) : INITIAL_PATIENTS;

      const storedDoctors = localStorage.getItem(DOCTORS_KEY);
      this.doctors = storedDoctors ? JSON.parse(storedDoctors) : INITIAL_DOCTORS;

      const storedTriage = localStorage.getItem(TRIAGE_KEY);
      this.triageRecords = storedTriage ? JSON.parse(storedTriage) : INITIAL_TRIAGE_RECORDS;

      const storedActivities = localStorage.getItem(ACTIVITIES_KEY);
      this.activities = storedActivities ? JSON.parse(storedActivities) : INITIAL_ACTIVITIES;
    } catch {
      this.appointments = [...INITIAL_APPOINTMENTS];
      this.patients = [...INITIAL_PATIENTS];
      this.doctors = [...INITIAL_DOCTORS];
      this.triageRecords = [...INITIAL_TRIAGE_RECORDS];
      this.activities = [...INITIAL_ACTIVITIES];
    }
  }

  private persist() {
    try {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(this.appointments));
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(this.patients));
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(this.doctors));
      localStorage.setItem(TRIAGE_KEY, JSON.stringify(this.triageRecords));
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(this.activities));
    } catch {
      // storage unavailable or quota exceeded
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- Appointments ---
  public getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  public getAppointmentById(id: string): Appointment | undefined {
    return this.appointments.find(a => a.id === id);
  }

  public addAppointment(data: Omit<Appointment, 'id'>): Appointment {
    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now().toString().slice(-4)}`
    };
    this.appointments.unshift(newAppointment);
    this.persist();
    this.recordActivity({
      patientId: newAppointment.patientId,
      patientName: newAppointment.patientName,
      type: 'check_in',
      description: `New visit booked: "${newAppointment.reasonForVisit}" with ${newAppointment.doctorName}.`,
      time: 'Just now',
      doctorName: newAppointment.doctorName,
      urgency: newAppointment.urgency
    });
    return newAppointment;
  }

  public updateAppointmentStatus(id: string, status: AppointmentStatus): boolean {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      const appt = this.appointments[index];
      appt.status = status;
      if (status === 'Checked-In' && !appt.checkInTime) {
        const now = new Date();
        appt.checkInTime = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        this.recordActivity({
          patientId: appt.patientId,
          patientName: appt.patientName,
          type: 'check_in',
          description: `Patient checked in to waiting lounge for ${appt.doctorName}.`,
          time: 'Just now',
          doctorName: appt.doctorName,
          urgency: appt.urgency
        });
      } else if (status === 'In-Consultation') {
        this.recordActivity({
          patientId: appt.patientId,
          patientName: appt.patientName,
          type: 'consultation_started',
          description: `Consultation started in ${appt.room} with ${appt.doctorName}.`,
          time: 'Just now',
          doctorName: appt.doctorName,
          urgency: appt.urgency
        });
      } else if (status === 'Completed') {
        this.recordActivity({
          patientId: appt.patientId,
          patientName: appt.patientName,
          type: 'prescription_issued',
          description: `Clinical consultation concluded by ${appt.doctorName}. Orders filed.`,
          time: 'Just now',
          doctorName: appt.doctorName
        });
      }
      this.persist();
      return true;
    }
    return false;
  }

  public deleteAppointment(id: string): boolean {
    const prevLen = this.appointments.length;
    this.appointments = this.appointments.filter(a => a.id !== id);
    if (this.appointments.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Patients ---
  public getPatients(): Patient[] {
    return [...this.patients];
  }

  public getPatientById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  public addPatient(patient: Omit<Patient, 'id'> & { id?: string }): Patient {
    const newPatient: Patient = {
      ...patient,
      id: patient.id ? patient.id.toUpperCase() : `PAT-${Date.now().toString().slice(-4)}`
    };
    this.patients.unshift(newPatient);
    this.persist();
    this.recordActivity({
      patientId: newPatient.id,
      patientName: newPatient.name,
      type: 'vitals_logged',
      description: `New patient record created for ${newPatient.name}. Intake symptoms: "${newPatient.currentSymptoms || 'Routine intake'}".`,
      time: 'Just now'
    });
    return newPatient;
  }

  // --- Doctors ---
  public getDoctors(): Doctor[] {
    return [...this.doctors];
  }

  public getDoctorById(id: string): Doctor | undefined {
    return this.doctors.find(d => d.id === id);
  }

  public updateDoctorStatus(id: string, status: Doctor['status']): void {
    const doc = this.doctors.find(d => d.id === id);
    if (doc) {
      doc.status = status;
      this.persist();
    }
  }

  // --- Triage Records ---
  public getTriageRecords(): TriageEntry[] {
    return [...this.triageRecords];
  }

  public addTriageRecord(record: Omit<TriageEntry, 'id'>): TriageEntry {
    const newRecord: TriageEntry = {
      ...record,
      id: `trg-${Date.now().toString().slice(-4)}`
    };
    this.triageRecords.unshift(newRecord);
    this.persist();
    return newRecord;
  }

  // --- Metrics ---
  public getMetrics(): ClinicMetrics {
    const todayAppointments = this.appointments;
    const checkedIn = todayAppointments.filter(a => a.status === 'Checked-In').length;
    const inConsult = todayAppointments.filter(a => a.status === 'In-Consultation').length;
    const completed = todayAppointments.filter(a => a.status === 'Completed').length;
    const urgent = todayAppointments.filter(a => a.urgency.includes('Level 1') || a.urgency.includes('Level 2')).length;
    const activePhysicians = this.doctors.filter(d => d.status === 'In Clinic' || d.status === 'In Consultation').length;

    return {
      totalAppointmentsToday: todayAppointments.length,
      checkedInCount: checkedIn,
      inConsultationCount: inConsult,
      completedToday: completed,
      avgWaitTimeMinutes: 12,
      agentTriageAccuracy: 98.7,
      urgentCasesCount: urgent,
      activePhysiciansCount: activePhysicians
    };
  }

  // --- Activities ---
  public getActivities(): PatientActivity[] {
    return [...this.activities];
  }

  public recordActivity(activity: Omit<PatientActivity, 'id'>): PatientActivity {
    const newAct: PatientActivity = {
      ...activity,
      id: `act-${Date.now().toString().slice(-4)}`
    };
    this.activities.unshift(newAct);
    if (this.activities.length > 25) {
      this.activities = this.activities.slice(0, 25);
    }
    this.persist();
    return newAct;
  }

  // Reset to original mock data
  public resetToDefault() {
    this.appointments = [...INITIAL_APPOINTMENTS];
    this.patients = [...INITIAL_PATIENTS];
    this.doctors = [...INITIAL_DOCTORS];
    this.triageRecords = [...INITIAL_TRIAGE_RECORDS];
    this.activities = [...INITIAL_ACTIVITIES];
    this.persist();
  }
}

export const clinicService = new ClinicService();
