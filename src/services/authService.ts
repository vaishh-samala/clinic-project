import { Patient, Doctor, INITIAL_PATIENTS, INITIAL_DOCTORS } from './mockData';
import { api } from './api';

export type UserRole = 'patient' | 'doctor';

export interface AuthSession {
  role: UserRole;
  user: Patient | Doctor;
}

const AUTH_STORAGE_KEY = 'clinic_agent_auth_session_v1';

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    this.initSession();
  }

  private initSession() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentSession = JSON.parse(stored);
      } else {
        // Default to a patient session for immediate exploration
        this.currentSession = {
          role: 'patient',
          user: INITIAL_PATIENTS[0] // Eleanor Sterling
        };
        this.save();
      }
    } catch {
      this.currentSession = {
        role: 'patient',
        user: INITIAL_PATIENTS[0]
      };
    }
  }

  private save() {
    try {
      if (this.currentSession) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getSession(): AuthSession | null {
    return this.currentSession;
  }

  public isPatient(): boolean {
    return this.currentSession?.role === 'patient';
  }

  public isDoctor(): boolean {
    return this.currentSession?.role === 'doctor';
  }

  public getPatientUser(): Patient | null {
    if (this.currentSession?.role === 'patient') {
      return this.currentSession.user as Patient;
    }
    return null;
  }

  public getDoctorUser(): Doctor | null {
    if (this.currentSession?.role === 'doctor') {
      return this.currentSession.user as Doctor;
    }
    return null;
  }

  /**
   * Log in as patient using phone number or email
   */
  public loginAsPatient(identifier: string): { success: boolean; message?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = cleanId.replace(/\D/g, '');

    const patient = INITIAL_PATIENTS.find(p => {
      const emailMatch = p.email.toLowerCase() === cleanId;
      const phoneDigits = p.phone.replace(/\D/g, '');
      const phoneMatch = cleanDigits.length >= 7 && phoneDigits.includes(cleanDigits);
      const nameMatch = p.name.toLowerCase().includes(cleanId);
      const idMatch = p.id.toLowerCase() === cleanId;
      return emailMatch || phoneMatch || nameMatch || idMatch;
    });

    if (patient) {
      this.currentSession = {
        role: 'patient',
        user: patient
      };
      this.save();
      api.login(patient.email).catch(() => {});
      return { success: true };
    }

    // If identifier is not in initial list, create a virtual registered patient for smooth demo
    if (cleanId.includes('@') || cleanDigits.length >= 7) {
      const newPatient: Patient = {
        id: `pat-${Date.now().toString().slice(-4)}`,
        name: cleanId.includes('@') ? cleanId.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Patient Guest',
        age: 36,
        gender: 'Female',
        dob: '1990-05-15',
        bloodType: 'O+',
        phone: cleanDigits.length >= 7 ? identifier : '+1 (555) 019-2834',
        email: cleanId.includes('@') ? identifier : 'guest.patient@example.com',
        address: '88 Meadow Lane, Clinic City',
        allergies: ['No known allergies'],
        chronicConditions: ['None documented'],
        currentMedications: ['Multivitamin daily'],
        medicalHistory: 'General good health. No major hospitalizations.',
        currentSymptoms: 'Seeking outpatient consultation.',
        recentVitals: {
          bloodPressure: '120/80',
          heartRate: 72,
          respiratoryRate: 16,
          temperature: 98.6,
          oxygenSaturation: 99,
          recordedAt: 'Today'
        },
        insuranceProvider: 'Standard Healthcare Network',
        emergencyContact: {
          name: 'Contact Person',
          relationship: 'Family Member',
          phone: '+1 (555) 019-9999'
        },
        lastVisit: '2026-08-10'
      };

      this.currentSession = {
        role: 'patient',
        user: newPatient
      };
      this.save();
      api.login(newPatient.email).catch(() => {});
      return { success: true };
    }

    return {
      success: false,
      message: 'No patient record found matching this email or phone number. Please check or use a demo account.'
    };
  }

  /**
   * Log in as doctor using email
   */
  public loginAsDoctor(email: string): { success: boolean; message?: string } {
    const cleanEmail = email.trim().toLowerCase();

    // Check doctors
    const doctor = INITIAL_DOCTORS.find(d => {
      const nameParts = d.name.toLowerCase().replace('dr. ', '').split(' ');
      const lastName = nameParts[nameParts.length - 1];
      return (
        cleanEmail.includes(lastName) ||
        cleanEmail === `${lastName}@clinic.org` ||
        cleanEmail === `dr.${lastName}@clinic.org` ||
        cleanEmail.includes(d.id)
      );
    }) || INITIAL_DOCTORS[1]; // Fallback to Dr. Marcus Vance if standard matching

    if (cleanEmail.length > 0) {
      this.currentSession = {
        role: 'doctor',
        user: doctor
      };
      this.save();
      api.login(cleanEmail).catch(() => {});
      return { success: true };
    }

    return {
      success: false,
      message: 'Please provide a valid doctor email address.'
    };
  }

  /**
   * Quick role switch helper for demo
   */
  public switchToRole(role: UserRole, specificId?: string) {
    if (role === 'patient') {
      const patient = specificId
        ? INITIAL_PATIENTS.find(p => p.id === specificId) || INITIAL_PATIENTS[0]
        : INITIAL_PATIENTS[0];
      this.currentSession = { role: 'patient', user: patient };
    } else {
      const doctor = specificId
        ? INITIAL_DOCTORS.find(d => d.id === specificId) || INITIAL_DOCTORS[1]
        : INITIAL_DOCTORS[1]; // Dr. Marcus Vance (Primary Care / Internal Med)
      this.currentSession = { role: 'doctor', user: doctor };
    }
    this.save();
  }

  public logout() {
    this.currentSession = null;
    this.save();
  }
}

export const authService = new AuthService();
