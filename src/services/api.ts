/**
 * Typed API Client connecting React Frontend to Express Backend
 */

const API_BASE = '/api';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

export interface ApiPatientProfile {
  id: string;
  userId: string;
  dateOfBirth: string;
  phoneNumber: string;
  emergencyContact?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
  currentMedications?: string | null;
}

export interface ApiDoctorProfile {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  specialization: string;
  qualifications: string;
  roomNumber?: string | null;
  isActive: boolean;
  availability: {
    workDays: string[];
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    breakStart?: string;
    breakEnd?: string;
  };
}

export interface ApiAppointment {
  id: string;
  patientId: string;
  patient?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
  } | null;
  doctorId: string;
  doctor?: {
    id: string;
    name: string;
    specialization: string;
    roomNumber?: string | null;
  } | null;
  originalDoctorId?: string | null;
  originalDoctorName?: string | null;
  reassignedDoctorId?: string | null;
  reassignedDoctorName?: string | null;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'REASSIGNED' | 'CANCELLED' | 'COMPLETED';
  reason: string;
  notes?: string | null;
  rejectionReason?: string | null;
  doctorNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAgentResponse {
  sessionId: string;
  reply: string;
  urgency: 'NORMAL' | 'URGENT' | 'RED_FLAG';
  assessment?: {
    urgency: string;
    isEmergency: boolean;
    symptomsSummary: string;
    possibleExplanations: string[];
    suggestedQuestionsForDoctor: string[];
    recommendedNextSteps: string[];
    disclaimer: string;
  };
  actionsExecuted?: Array<{ toolName: string; parameters: any; result: any }>;
  suggestedPrompts?: string[];
  disclaimer: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    try {
      this.token = localStorage.getItem('clinic_agent_jwt_token');
    } catch {
      this.token = null;
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem('clinic_agent_jwt_token', token);
      } else {
        localStorage.removeItem('clinic_agent_jwt_token');
      }
    } catch {
      // ignore
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || `HTTP ${response.status}: Request failed`;
      throw new Error(errorMsg);
    }

    return (data.data !== undefined ? data.data : data) as T;
  }

  // Auth Endpoints
  async login(emailOrPhone: string, password: string = 'DoctorPass123!') {
    // If phone number or demo credentials, format accordingly
    let email = emailOrPhone.trim();
    if (!email.includes('@')) {
      // It's a phone login for demo
      if (email.includes('234-5678') || email.includes('2345678')) {
        email = 'patient@clinicagent.com';
      } else if (email.includes('782-9901') || email.includes('7829901')) {
        email = 'eleanor.sterling@clinicagent.com';
      } else if (email.includes('912-3341') || email.includes('9123341')) {
        email = 'maya.rodriguez@clinicagent.com';
      } else {
        email = 'patient@clinicagent.com';
      }
    }

    // Default password fallback for demo ease
    let pass = password;
    if (email.includes('patient') || email.includes('sterling') || email.includes('rodriguez')) {
      pass = 'PatientPass123!';
    } else if (email.includes('admin')) {
      pass = 'AdminPass123!';
    } else {
      pass = 'DoctorPass123!';
    }

    const result = await this.request<{
      token: string;
      user: ApiUser;
      patientId?: string;
      doctorId?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async getMe() {
    return this.request<{
      id: string;
      name: string;
      email: string;
      role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
      patient?: ApiPatientProfile | null;
      doctor?: ApiDoctorProfile | null;
    }>('/auth/me');
  }

  // Doctor Endpoints
  async getDoctors(specialty?: string) {
    const query = specialty ? `?specialty=${encodeURIComponent(specialty)}` : '';
    return this.request<ApiDoctorProfile[]>(`/doctors${query}`);
  }

  async getDoctorAvailability(doctorId: string, date: string) {
    return this.request<{
      doctorId: string;
      doctorName: string;
      date: string;
      dayOfWeek: string;
      isWorkingDay: boolean;
      slots: Array<{
        timeSlot: string;
        isAvailable: boolean;
        isBreakTime?: boolean;
        reason?: string;
      }>;
    }>(`/doctors/${doctorId}/availability?date=${date}`);
  }

  // Appointment Endpoints
  async getAppointments(params?: { status?: string; doctorId?: string; patientId?: string; date?: string }) {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'All') q.set('status', params.status);
    if (params?.doctorId && params.doctorId !== 'All') q.set('doctorId', params.doctorId);
    if (params?.patientId && params.patientId !== 'All') q.set('patientId', params.patientId);
    if (params?.date) q.set('date', params.date);

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return this.request<ApiAppointment[]>(`/appointments${queryStr}`);
  }

  async createAppointment(input: {
    doctorId: string;
    date: string;
    timeSlot: string;
    reason: string;
    notes?: string;
    patientId?: string;
  }) {
    return this.request<ApiAppointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async acceptAppointment(id: string, input?: { doctorNotes?: string; appointmentTime?: string }) {
    return this.request<ApiAppointment>(`/appointments/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify(input || {}),
    });
  }

  async rejectAppointment(id: string, input: { reason: string; preferredDoctorId?: string }) {
    return this.request<ApiAppointment>(`/appointments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async cancelAppointment(id: string) {
    return this.request<ApiAppointment>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // AI Agent Chat & Triage Endpoint
  async chatWithAgent(message: string, sessionId: string = 'default-session', patientId?: string) {
    return this.request<ApiAgentResponse>('/agent/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        sessionId,
        patientId,
      }),
    });
  }
}

export const api = new ApiClient();
