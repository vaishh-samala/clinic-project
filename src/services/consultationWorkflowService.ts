import { Doctor, INITIAL_DOCTORS } from './mockData';
import { api } from './api';

export type UrgencyLevel = 'Red Flag' | 'Urgent' | 'Normal';
export type ConsultationStatus = 'Awaiting Doctor Approval' | 'Accepted' | 'Rejected' | 'Reassigned';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'patient';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}

export interface ConsultationRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientEmail: string;
  symptomsReported: string;
  symptomsList: string[];
  urgency: UrgencyLevel;
  urgencyReason: string;
  relevantMedicalHistory: string;
  currentMedications: string[];
  allergies: string[];
  chatTranscript: ChatMessage[];
  assignedDoctorId: string;
  assignedDoctorName: string;
  status: ConsultationStatus;
  createdAt: string;
  doctorNotes?: string;
  appointmentTime?: string;
  rejectionReason?: string;
  reassignedDoctorId?: string;
  reassignedDoctorName?: string;
}

export interface ClinicNotification {
  id: string;
  type: 'consultation_request' | 'urgent_alert' | 'reassigned' | 'status_change';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedRequestId?: string;
  urgency?: UrgencyLevel;
  targetDoctorId?: string;
}

export interface PastPatientConsultation {
  id: string;
  patientId: string;
  date: string;
  symptoms: string;
  doctorName: string;
  specialty: string;
  clinicalNotes: string;
  diagnosis: string;
  status: 'Completed' | 'Follow-Up Scheduled';
  prescriptionSummary?: string;
}

const REQUESTS_STORAGE_KEY = 'clinic_agent_consultation_requests_v2';
const NOTIFICATIONS_STORAGE_KEY = 'clinic_agent_notifications_v2';

const INITIAL_REQUESTS: ConsultationRequest[] = [
  {
    id: 'req-101',
    patientId: 'pat-3',
    patientName: 'Maya Lin Rodriguez',
    patientAge: 29,
    patientGender: 'Female',
    patientPhone: '+1 (555) 912-3341',
    patientEmail: 'maya.rodriguez@example.com',
    symptomsReported: 'Severe unilateral pulsing headache, aura flashing in right visual field, acute nausea and intense photophobia for 6 hours.',
    symptomsList: ['Unilateral throbbing headache', 'Visual aura (scintillating scotoma)', 'Severe photophobia', 'Nausea'],
    urgency: 'Urgent',
    urgencyReason: 'Escalating migraine refractory to initial oral triptan; accompanied by neurological visual disturbance.',
    relevantMedicalHistory: 'Chronic migraine with aura (4 years); episodic tension cephalalgia.',
    currentMedications: ['Sumatriptan 50mg (PRN)'],
    allergies: ['Latex'],
    assignedDoctorId: 'doc-2', // Dr. Marcus Vance
    assignedDoctorName: 'Dr. Marcus Vance',
    status: 'Awaiting Doctor Approval',
    createdAt: 'Today, 10:18 AM',
    chatTranscript: [
      {
        id: 'msg-1',
        sender: 'bot',
        text: 'Hello Maya! I am your Clinic Health Assistant. Could you please describe what symptoms you are experiencing today?',
        timestamp: '10:14 AM'
      },
      {
        id: 'msg-2',
        sender: 'patient',
        text: 'I have a terrible throbbing pain behind my right temple that started this morning. I am seeing zig-zag lights in my vision.',
        timestamp: '10:15 AM'
      },
      {
        id: 'msg-3',
        sender: 'bot',
        text: 'I understand this is very distressing. How severe is the pain on a scale of 1 to 10, and have you taken any medication like your prescribed Sumatriptan?',
        timestamp: '10:15 AM'
      },
      {
        id: 'msg-4',
        sender: 'patient',
        text: 'Pain is around 8/10. I took Sumatriptan 50mg two hours ago but it didn’t ease the pain, and bright screen light hurts my eyes.',
        timestamp: '10:16 AM'
      },
      {
        id: 'msg-5',
        sender: 'bot',
        text: 'Thank you for these clinical details. Based on your documented history of migraine with aura and resistance to first-line triptan, I have assessed this as Urgent. I am preparing your consultation request for Dr. Marcus Vance for immediate clinical review and possible parenteral intervention.',
        timestamp: '10:17 AM'
      }
    ]
  },
  {
    id: 'req-102',
    patientId: 'pat-1',
    patientName: 'Eleanor Sterling',
    patientAge: 58,
    patientGender: 'Female',
    patientPhone: '+1 (555) 782-9901',
    patientEmail: 'eleanor.sterling@example.com',
    symptomsReported: 'Mild orthostatic dizziness upon rising in the morning and mild dry mouth for 3 days.',
    symptomsList: ['Morning lightheadedness / postural dizziness', 'Dry mouth'],
    urgency: 'Normal',
    urgencyReason: 'Mild hemodynamic symptoms likely related to antihypertensive Lisinopril titration; no syncope, chest pain, or focal deficits.',
    relevantMedicalHistory: 'Type 2 Diabetes (diagnosed 2018); Essential Hypertension (diagnosed 2019).',
    currentMedications: ['Lisinopril 10mg daily', 'Metformin 500mg BID'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    assignedDoctorId: 'doc-2', // Dr. Marcus Vance
    assignedDoctorName: 'Dr. Marcus Vance',
    status: 'Accepted',
    createdAt: 'Today, 09:20 AM',
    appointmentTime: 'Today at 02:30 PM',
    doctorNotes: 'Approved for in-clinic blood pressure check and electrolyte review. Instructed patient to drink fluids and rise slowly.',
    chatTranscript: [
      {
        id: 'msg-10',
        sender: 'bot',
        text: 'Hello Eleanor! How can I help you today? Please tell me about what you are feeling.',
        timestamp: '09:12 AM'
      },
      {
        id: 'msg-11',
        sender: 'patient',
        text: 'I have been feeling slightly dizzy when standing up out of bed the last few mornings, and my mouth feels dry.',
        timestamp: '09:13 AM'
      },
      {
        id: 'msg-12',
        sender: 'bot',
        text: 'Have you experienced any fainting, chest discomfort, shortness of breath, or weakness in your arms or legs?',
        timestamp: '09:14 AM'
      },
      {
        id: 'msg-13',
        sender: 'patient',
        text: 'No fainting or chest pain at all. Just mild lightheadedness for about 30 seconds after getting up.',
        timestamp: '09:15 AM'
      },
      {
        id: 'msg-14',
        sender: 'bot',
        text: 'Thank you. Correlating with your Lisinopril medication and diabetes history, this is categorized as Normal urgency for non-emergency clinical review. Dr. Marcus Vance will review your request.',
        timestamp: '09:16 AM'
      }
    ]
  },
  {
    id: 'req-103',
    patientId: 'pat-4',
    patientName: 'Robert Vance',
    patientAge: 64,
    patientGender: 'Male',
    patientPhone: '+1 (555) 302-8871',
    patientEmail: 'r.vance@example.com',
    symptomsReported: 'Sudden onset substernal chest heaviness radiating to left shoulder, accompanied by cold sweat and mild dyspnea while walking up stairs.',
    symptomsList: ['Substernal chest pressure', 'Radiation to left shoulder', 'Diaphoresis (cold sweat)', 'Exertional dyspnea'],
    urgency: 'Red Flag',
    urgencyReason: 'High suspicion for Acute Coronary Syndrome (ACS) / Ischemia in a 64M with risk factors. Immediate medical evaluation and 12-lead ECG indicated.',
    relevantMedicalHistory: 'Hyperlipidemia, 25 pack-year smoking history, Family history of early CAD.',
    currentMedications: ['Atorvastatin 40mg', 'Aspirin 81mg'],
    allergies: ['No known drug allergies'],
    assignedDoctorId: 'doc-1', // Dr. Sarah Mitchell (Cardiology)
    assignedDoctorName: 'Dr. Sarah Mitchell',
    status: 'Awaiting Doctor Approval',
    createdAt: 'Today, 11:05 AM',
    chatTranscript: [
      {
        id: 'msg-20',
        sender: 'bot',
        text: 'Hello Robert. What symptoms are you currently experiencing?',
        timestamp: '11:01 AM'
      },
      {
        id: 'msg-21',
        sender: 'patient',
        text: 'I started having heavy pressure in the center of my chest while climbing the stairs 20 minutes ago. It radiates towards my left arm and I broke out in a cold sweat.',
        timestamp: '11:02 AM'
      },
      {
        id: 'msg-22',
        sender: 'bot',
        text: 'CRITICAL ALERT: Your symptoms suggest potential acute cardiovascular distress. I have flagged this case as RED FLAG urgency and routed it directly to Dr. Sarah Mitchell in Cardiology. If your symptoms worsen or you feel faint, please dial 911 immediately.',
        timestamp: '11:03 AM'
      }
    ]
  }
];

const INITIAL_NOTIFICATIONS: ClinicNotification[] = [
  {
    id: 'notif-1',
    type: 'urgent_alert',
    title: 'RED FLAG Triage Alert',
    message: 'Robert Vance (64M) presented with substernal chest heaviness and diaphoresis. Immediate ECG review recommended.',
    timestamp: '11:05 AM',
    read: false,
    relatedRequestId: 'req-103',
    urgency: 'Red Flag',
    targetDoctorId: 'doc-1'
  },
  {
    id: 'notif-2',
    type: 'consultation_request',
    title: 'New Consultation Request',
    message: 'Maya Lin Rodriguez submitted an Urgent consultation request for intractable migraine with aura.',
    timestamp: '10:18 AM',
    read: false,
    relatedRequestId: 'req-101',
    urgency: 'Urgent',
    targetDoctorId: 'doc-2'
  },
  {
    id: 'notif-3',
    type: 'status_change',
    title: 'Consultation Accepted',
    message: 'Eleanor Sterling’s dizziness consultation was accepted and scheduled for 02:30 PM.',
    timestamp: '09:22 AM',
    read: true,
    relatedRequestId: 'req-102',
    urgency: 'Normal',
    targetDoctorId: 'doc-2'
  }
];

const INITIAL_PAST_CONSULTATIONS: PastPatientConsultation[] = [
  {
    id: 'pc-1',
    patientId: 'pat-1',
    date: '2026-09-14',
    symptoms: 'Follow-up for blood pressure control and routine quarterly HbA1c screening.',
    doctorName: 'Dr. Marcus Vance',
    specialty: 'Internal Medicine',
    clinicalNotes: 'HbA1c steady at 6.8%. Blood pressure well tolerated on Lisinopril 10mg. Encouraged low-sodium dietary regimen and continued daily 30-minute walks.',
    diagnosis: 'Type 2 Diabetes Mellitus (Controlled), Essential Hypertension',
    status: 'Completed',
    prescriptionSummary: 'Refilled Lisinopril 10mg (90 days), Metformin 500mg BID (90 days).'
  },
  {
    id: 'pc-2',
    patientId: 'pat-1',
    date: '2026-05-20',
    symptoms: 'Mild productive cough and sinus congestion following seasonal weather change.',
    doctorName: 'Dr. Marcus Vance',
    specialty: 'Internal Medicine',
    clinicalNotes: 'Lungs clear bilaterally. Tympanic membranes clear. Diagnosed viral upper respiratory infection. Symptomatic relief advised.',
    diagnosis: 'Acute Viral Rhinopharyngitis',
    status: 'Completed',
    prescriptionSummary: 'Saline nasal spray, increased oral hydration, Acetaminophen PRN.'
  },
  {
    id: 'pc-3',
    patientId: 'pat-2',
    date: '2026-07-22',
    symptoms: 'Annual physical examination and preventative wellness screening.',
    doctorName: 'Dr. Marcus Vance',
    specialty: 'Internal Medicine',
    clinicalNotes: 'Normal cardiovascular and pulmonary exam. Spirometry within normal parameters. Administered annual influenza immunization.',
    diagnosis: 'Routine General Medical Examination',
    status: 'Completed'
  },
  {
    id: 'pc-4',
    patientId: 'pat-3',
    date: '2026-08-04',
    symptoms: 'Recurrent severe left-sided hemicranial headache with nausea and light sensitivity.',
    doctorName: 'Dr. Elena Rostova',
    specialty: 'Neurology / Primary Care',
    clinicalNotes: 'Classic migraine presentation. Cranial nerves II-XII intact. Prescribed Sumatriptan 50mg with headache diary log instruction.',
    diagnosis: 'Migraine with Visual Aura',
    status: 'Completed',
    prescriptionSummary: 'Sumatriptan 50mg tabs #9 (PRN at onset).'
  }
];

class ConsultationWorkflowService {
  private requests: ConsultationRequest[] = [];
  private notifications: ClinicNotification[] = [];
  private pastConsultations: PastPatientConsultation[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.initData();
  }

  private initData() {
    try {
      const storedReq = localStorage.getItem(REQUESTS_STORAGE_KEY);
      this.requests = storedReq ? JSON.parse(storedReq) : INITIAL_REQUESTS;

      const storedNotif = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      this.notifications = storedNotif ? JSON.parse(storedNotif) : INITIAL_NOTIFICATIONS;

      this.pastConsultations = INITIAL_PAST_CONSULTATIONS;
    } catch {
      this.requests = [...INITIAL_REQUESTS];
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.pastConsultations = [...INITIAL_PAST_CONSULTATIONS];
    }
  }

  private persist() {
    try {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(this.requests));
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications));
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

  // --- Consultation Requests ---

  public getAllRequests(): ConsultationRequest[] {
    return [...this.requests];
  }

  public getRequestsForDoctor(doctorId: string): ConsultationRequest[] {
    return this.requests.filter(
      r => r.assignedDoctorId === doctorId || r.reassignedDoctorId === doctorId
    );
  }

  public getRequestsForPatient(patientId: string): ConsultationRequest[] {
    return this.requests.filter(r => r.patientId === patientId);
  }

  public getRequestById(id: string): ConsultationRequest | undefined {
    return this.requests.find(r => r.id === id);
  }

  public submitNewConsultation(data: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>): ConsultationRequest {
    const now = new Date();
    const timeFormatted = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    const newRequest: ConsultationRequest = {
      ...data,
      id: `req-${Date.now().toString().slice(-4)}`,
      status: 'Awaiting Doctor Approval',
      createdAt: `Today, ${timeFormatted}`
    };

    this.requests.unshift(newRequest);

    // Add alert notification for doctor
    const notifTitle = newRequest.urgency === 'Red Flag' 
      ? '🚨 RED FLAG Triage Alert' 
      : newRequest.urgency === 'Urgent' 
        ? '⚠️ Urgent Consultation Request' 
        : '📋 New Consultation Request';

    this.notifications.unshift({
      id: `notif-${Date.now().toString().slice(-4)}`,
      type: newRequest.urgency === 'Red Flag' ? 'urgent_alert' : 'consultation_request',
      title: notifTitle,
      message: `${newRequest.patientName} (${newRequest.patientAge}y) submitted an intake with ${newRequest.urgency} urgency: "${newRequest.symptomsReported.slice(0, 70)}..."`,
      timestamp: timeFormatted,
      read: false,
      relatedRequestId: newRequest.id,
      urgency: newRequest.urgency,
      targetDoctorId: newRequest.assignedDoctorId
    });

    this.persist();

    // Persist to backend API as PENDING appointment
    const todayStr = new Date().toISOString().split('T')[0];
    api.createAppointment({
      doctorId: newRequest.assignedDoctorId,
      date: todayStr,
      timeSlot: '14:00',
      reason: newRequest.symptomsReported,
      notes: `AI Triage: ${newRequest.urgency}. ${newRequest.urgencyReason}`,
      patientId: newRequest.patientId,
    }).catch(() => {});

    return newRequest;
  }

  /**
   * Doctor Approves / Accepts a Consultation Request
   */
  public acceptConsultation(
    requestId: string,
    doctorNotes: string = 'Approved for clinical consultation after preliminary AI triage review.',
    appointmentTime?: string
  ): boolean {
    const index = this.requests.findIndex(r => r.id === requestId);
    if (index === -1) return false;

    const req = this.requests[index];
    req.status = 'Accepted';
    req.doctorNotes = doctorNotes;
    req.appointmentTime = appointmentTime || 'Today at 03:00 PM';

    // Add notification
    this.notifications.unshift({
      id: `notif-${Date.now().toString().slice(-4)}`,
      type: 'status_change',
      title: 'Consultation Accepted',
      message: `${req.assignedDoctorName} approved consultation for ${req.patientName}. Scheduled for ${req.appointmentTime}.`,
      timestamp: 'Just now',
      read: false,
      relatedRequestId: req.id,
      urgency: req.urgency,
      targetDoctorId: req.assignedDoctorId
    });

    this.persist();

    // Sync accept with backend API
    api.acceptAppointment(requestId, {
      doctorNotes,
      appointmentTime: req.appointmentTime,
    }).catch(() => {});

    return true;
  }

  /**
   * Doctor Rejects and Reassigns to another specialist or doctor
   */
  public rejectAndReassign(
    requestId: string,
    rejectionReason: string,
    newDoctorId: string
  ): boolean {
    const index = this.requests.findIndex(r => r.id === requestId);
    if (index === -1) return false;

    const req = this.requests[index];
    const previousDoctorName = req.assignedDoctorName;
    const newDoc = INITIAL_DOCTORS.find(d => d.id === newDoctorId) || INITIAL_DOCTORS[0];

    req.status = 'Reassigned';
    req.rejectionReason = rejectionReason;
    req.reassignedDoctorId = newDoc.id;
    req.reassignedDoctorName = newDoc.name;
    req.doctorNotes = `Reassigned from ${previousDoctorName} to ${newDoc.name} (${newDoc.specialty}). Reason: ${rejectionReason}`;

    // Add notification to newly assigned doctor
    this.notifications.unshift({
      id: `notif-${Date.now().toString().slice(-4)}`,
      type: 'reassigned',
      title: 'Reassigned Consultation',
      message: `${req.patientName} was reassigned to ${newDoc.name} by ${previousDoctorName}. Reason: ${rejectionReason}`,
      timestamp: 'Just now',
      read: false,
      relatedRequestId: req.id,
      urgency: req.urgency,
      targetDoctorId: newDoc.id
    });

    this.persist();

    // Sync rejection and reassignment with backend API
    api.rejectAppointment(requestId, {
      reason: rejectionReason,
      preferredDoctorId: newDoctorId,
    }).catch(() => {});

    return true;
  }

  // --- Notifications ---

  public getNotifications(doctorId?: string): ClinicNotification[] {
    if (doctorId) {
      return this.notifications.filter(
        n => !n.targetDoctorId || n.targetDoctorId === doctorId
      );
    }
    return [...this.notifications];
  }

  public getUnreadNotificationCount(doctorId?: string): number {
    return this.getNotifications(doctorId).filter(n => !n.read).length;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist();
    }
  }

  public markAllNotificationsAsRead(doctorId?: string) {
    this.notifications.forEach(n => {
      if (!doctorId || n.targetDoctorId === doctorId || !n.targetDoctorId) {
        n.read = true;
      }
    });
    this.persist();
  }

  // --- Past Consultations ---

  public getPastConsultationsForPatient(patientId: string): PastPatientConsultation[] {
    return this.pastConsultations.filter(pc => pc.patientId === patientId);
  }
}

export const consultationWorkflowService = new ConsultationWorkflowService();
