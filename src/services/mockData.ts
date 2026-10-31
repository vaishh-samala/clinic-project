export interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  temperature: number; // in Fahrenheit
  oxygenSaturation: number; // in percentage
  recordedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  dob: string;
  bloodType: string;
  phone: string;
  email: string;
  address: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  medicalHistory?: string;
  currentSymptoms?: string;
  recentVitals: VitalSigns;
  insuranceProvider: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  lastVisit: string;
  avatarUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  department: string;
  avatarUrl: string;
  room: string;
  status: 'In Clinic' | 'In Consultation' | 'In Surgery' | 'On Break' | 'Off Duty';
  patientsToday: number;
  maxPatientsPerDay: number;
  schedule: string;
  phone: string;
}

export type AppointmentStatus = 'Scheduled' | 'Checked-In' | 'In-Consultation' | 'Completed' | 'Cancelled';
export type TriageUrgency = 'Emergency (Level 1)' | 'Urgent (Level 2)' | 'Standard (Level 3)' | 'Routine (Level 4)';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  durationMinutes: number;
  status: AppointmentStatus;
  urgency: TriageUrgency;
  reasonForVisit: string;
  symptoms: string[];
  room: string;
  checkInTime?: string;
  triageNotes?: string;
  agentRecommendedAction?: string;
}

export interface TriageEntry {
  id: string;
  patientName: string;
  timestamp: string;
  symptoms: string[];
  urgency: TriageUrgency;
  recommendedDepartment: string;
  recommendedDoctor: string;
  agentSummary: string;
  vitalFlags: string[];
  status: 'Pending Review' | 'Assigned' | 'Treated';
}

export interface ClinicMetrics {
  totalAppointmentsToday: number;
  checkedInCount: number;
  inConsultationCount: number;
  completedToday: number;
  avgWaitTimeMinutes: number;
  agentTriageAccuracy: number;
  urgentCasesCount: number;
  activePhysiciansCount: number;
}

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Mitchell',
    title: 'MD, FACC',
    specialty: 'Cardiology',
    department: 'Cardiovascular Care',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256',
    room: 'Suite 204',
    status: 'In Consultation',
    patientsToday: 9,
    maxPatientsPerDay: 14,
    schedule: '08:00 AM - 04:30 PM',
    phone: '+1 (555) 392-1081'
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Vance',
    title: 'MD, General Practice',
    specialty: 'Internal Medicine',
    department: 'Primary Care',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
    room: 'Room 102',
    status: 'In Clinic',
    patientsToday: 12,
    maxPatientsPerDay: 18,
    schedule: '08:30 AM - 05:00 PM',
    phone: '+1 (555) 392-1082'
  },
  {
    id: 'doc-3',
    name: 'Dr. Elena Rostova',
    title: 'MD, Pediatrics',
    specialty: 'Pediatrics',
    department: 'Pediatric Center',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813680-bd94652c42d3?auto=format&fit=crop&q=80&w=256',
    room: 'Suite 115',
    status: 'In Clinic',
    patientsToday: 7,
    maxPatientsPerDay: 15,
    schedule: '09:00 AM - 04:00 PM',
    phone: '+1 (555) 392-1083'
  },
  {
    id: 'doc-4',
    name: 'Dr. Julian Chen',
    title: 'DO, Sports & Ortho',
    specialty: 'Orthopedics',
    department: 'Musculoskeletal Care',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256',
    room: 'Suite 310',
    status: 'In Surgery',
    patientsToday: 4,
    maxPatientsPerDay: 8,
    schedule: '07:30 AM - 03:30 PM',
    phone: '+1 (555) 392-1084'
  },
  {
    id: 'doc-5',
    name: 'Dr. Amara Patel',
    title: 'MD, Neurologist',
    specialty: 'Neurology',
    department: 'Neurosciences',
    avatarUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=256',
    room: 'Suite 405',
    status: 'In Clinic',
    patientsToday: 6,
    maxPatientsPerDay: 10,
    schedule: '08:30 AM - 05:00 PM',
    phone: '+1 (555) 392-1085'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Eleanor Sterling',
    age: 58,
    gender: 'Female',
    dob: '1968-04-12',
    bloodType: 'A+',
    phone: '+1 (555) 782-9901',
    email: 'eleanor.sterling@example.com',
    address: '742 Evergreen Terrace, West Hills',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    currentMedications: ['Lisinopril 10mg', 'Metformin 500mg'],
    medicalHistory: 'Type 2 Diabetes diagnosed 2018; Essential Hypertension diagnosed 2019; prior cholecystectomy in 2014.',
    currentSymptoms: 'Mild morning dizziness and dry mouth over the past 3 days.',
    recentVitals: {
      bloodPressure: '138/86',
      heartRate: 74,
      respiratoryRate: 16,
      temperature: 98.4,
      oxygenSaturation: 98,
      recordedAt: 'Today, 09:15 AM'
    },
    insuranceProvider: 'BlueCross Health Premier',
    emergencyContact: {
      name: 'Thomas Sterling',
      relationship: 'Spouse',
      phone: '+1 (555) 782-9905'
    },
    lastVisit: '2026-09-14'
  },
  {
    id: 'pat-2',
    name: 'David K. Morrison',
    age: 42,
    gender: 'Male',
    dob: '1984-11-20',
    bloodType: 'O+',
    phone: '+1 (555) 431-8822',
    email: 'dmorrison84@example.com',
    address: '1204 Pine Hollow Way, Metro City',
    allergies: ['No known allergies'],
    chronicConditions: ['Asthma (Mild intermittent)'],
    currentMedications: ['Albuterol Inhaler (PRN)'],
    medicalHistory: 'Mild intermittent asthma since childhood; seasonal allergic rhinitis.',
    currentSymptoms: 'Routine annual preventative wellness checkup and seasonal flu immunization.',
    recentVitals: {
      bloodPressure: '122/78',
      heartRate: 82,
      respiratoryRate: 18,
      temperature: 99.1,
      oxygenSaturation: 97,
      recordedAt: 'Today, 09:40 AM'
    },
    insuranceProvider: 'Aetna Select Gold',
    emergencyContact: {
      name: 'Claire Morrison',
      relationship: 'Sister',
      phone: '+1 (555) 431-8890'
    },
    lastVisit: '2026-07-22'
  },
  {
    id: 'pat-3',
    name: 'Maya Lin Rodriguez',
    age: 29,
    gender: 'Female',
    dob: '1997-03-05',
    bloodType: 'B+',
    phone: '+1 (555) 912-3341',
    email: 'maya.rodriguez@example.com',
    address: '350 Skyline Blvd, Apt 4B',
    allergies: ['Latex'],
    chronicConditions: ['Migraine with aura'],
    currentMedications: ['Sumatriptan 50mg (PRN)'],
    medicalHistory: 'Migraine with visual aura for 4 years; episodic tension headache.',
    currentSymptoms: 'Increasing migraine frequency with throbbing temporal pain and photophobia.',
    recentVitals: {
      bloodPressure: '116/74',
      heartRate: 68,
      respiratoryRate: 14,
      temperature: 98.6,
      oxygenSaturation: 99,
      recordedAt: 'Today, 10:05 AM'
    },
    insuranceProvider: 'United Healthcare PPO',
    emergencyContact: {
      name: 'Carlos Rodriguez',
      relationship: 'Brother',
      phone: '+1 (555) 912-3349'
    },
    lastVisit: '2026-10-02'
  },
  {
    id: 'pat-4',
    name: 'Arthur Pendelton',
    age: 71,
    gender: 'Male',
    dob: '1955-08-30',
    bloodType: 'O-',
    phone: '+1 (555) 234-5511',
    email: 'arthur.p@example.com',
    address: '89 Oak Ridge Court, North Oaks',
    allergies: ['Aspirin', 'Iodine contrast dye'],
    chronicConditions: ['Coronary Artery Disease', 'Osteoarthritis'],
    currentMedications: ['Atorvastatin 40mg', 'Metoprolol 25mg'],
    medicalHistory: 'Coronary Artery Disease with prior stent placement (2021); bilateral knee osteoarthritis.',
    currentSymptoms: 'Substernal chest tightness and shortness of breath when walking up steps since this morning.',
    recentVitals: {
      bloodPressure: '142/90',
      heartRate: 66,
      respiratoryRate: 17,
      temperature: 98.2,
      oxygenSaturation: 96,
      recordedAt: 'Today, 08:30 AM'
    },
    insuranceProvider: 'Medicare Advantage Part C',
    emergencyContact: {
      name: 'Grace Pendelton',
      relationship: 'Daughter',
      phone: '+1 (555) 234-5599'
    },
    lastVisit: '2026-08-19'
  },
  {
    id: 'pat-5',
    name: 'Zoe Chen',
    age: 8,
    gender: 'Female',
    dob: '2018-06-14',
    bloodType: 'A-',
    phone: '+1 (555) 670-2210',
    email: 'parents.chen@example.com',
    address: '412 Meadowland Dr',
    allergies: ['Peanuts', 'Tree nuts'],
    chronicConditions: ['Eczema'],
    currentMedications: ['Hydrocortisone 1% cream'],
    medicalHistory: 'Childhood eczema; severe food allergies to peanuts and tree nuts.',
    currentSymptoms: 'Persistent low-grade fever (100.2F), right ear tugging, and mild throat irritation for 24 hours.',
    recentVitals: {
      bloodPressure: '102/65',
      heartRate: 92,
      respiratoryRate: 20,
      temperature: 100.2,
      oxygenSaturation: 99,
      recordedAt: 'Today, 10:30 AM'
    },
    insuranceProvider: 'Cigna Open Access Plus',
    emergencyContact: {
      name: 'Vivian Chen',
      relationship: 'Mother',
      phone: '+1 (555) 670-2212'
    },
    lastVisit: '2026-05-11'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    patientId: 'pat-4',
    patientName: 'Arthur Pendelton',
    patientAge: 71,
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Mitchell',
    specialty: 'Cardiology',
    date: '2026-10-31',
    time: '09:00 AM',
    durationMinutes: 45,
    status: 'In-Consultation',
    urgency: 'Urgent (Level 2)',
    reasonForVisit: 'Exertional chest tightness and shortness of breath',
    symptoms: ['Chest tightness', 'Dyspnea on stairs', 'Fatigue'],
    room: 'Suite 204',
    checkInTime: '08:45 AM',
    triageNotes: 'ECG completed at reception, sinus rhythm with slight ST elevation in lead V3. Dr. Mitchell requested priority exam.',
    agentRecommendedAction: 'Immediate 12-lead ECG review, troponin baseline check.'
  },
  {
    id: 'apt-102',
    patientId: 'pat-1',
    patientName: 'Eleanor Sterling',
    patientAge: 58,
    doctorId: 'doc-2',
    doctorName: 'Dr. Marcus Vance',
    specialty: 'Internal Medicine',
    date: '2026-10-31',
    time: '09:30 AM',
    durationMinutes: 30,
    status: 'Checked-In',
    urgency: 'Standard (Level 3)',
    reasonForVisit: 'Quarterly diabetes & BP medication evaluation',
    symptoms: ['Mild dizziness in morning', 'Dry mouth'],
    room: 'Waiting Area B',
    checkInTime: '09:12 AM',
    triageNotes: 'Blood pressure slightly elevated at 138/86. Fasting blood sugar logged at 128 mg/dL.',
    agentRecommendedAction: 'Review Lisinopril dosage and consider HbA1c lab order.'
  },
  {
    id: 'apt-103',
    patientId: 'pat-5',
    patientName: 'Zoe Chen',
    patientAge: 8,
    doctorId: 'doc-3',
    doctorName: 'Dr. Elena Rostova',
    specialty: 'Pediatrics',
    date: '2026-10-31',
    time: '10:00 AM',
    durationMinutes: 30,
    status: 'Checked-In',
    urgency: 'Urgent (Level 2)',
    reasonForVisit: 'Persistent fever (100.2F), sore throat, and ear tugging',
    symptoms: ['Fever', 'Otalgia', 'Pharyngitis'],
    room: 'Pediatric Bay 1',
    checkInTime: '09:50 AM',
    triageNotes: 'Child irritable, tympanic temp verified. Rapid strep swab prepared.',
    agentRecommendedAction: 'Otoscopic ear canal inspection, rapid strep test.'
  },
  {
    id: 'apt-104',
    patientId: 'pat-2',
    patientName: 'David K. Morrison',
    patientAge: 42,
    doctorId: 'doc-2',
    doctorName: 'Dr. Marcus Vance',
    specialty: 'Internal Medicine',
    date: '2026-10-31',
    time: '11:00 AM',
    durationMinutes: 20,
    status: 'Scheduled',
    urgency: 'Routine (Level 4)',
    reasonForVisit: 'Annual preventative wellness checkup & seasonal vaccine',
    symptoms: ['None active'],
    room: 'Room 102',
    triageNotes: 'Standard wellness intake. Pre-visit digital questionnaire completed via patient portal.',
    agentRecommendedAction: 'Flu vaccine administration, routine lipid panel order.'
  },
  {
    id: 'apt-105',
    patientId: 'pat-3',
    patientName: 'Maya Lin Rodriguez',
    patientAge: 29,
    doctorId: 'doc-5',
    doctorName: 'Dr. Amara Patel',
    specialty: 'Neurology',
    date: '2026-10-31',
    time: '01:30 PM',
    durationMinutes: 45,
    status: 'Scheduled',
    urgency: 'Standard (Level 3)',
    reasonForVisit: 'Increasing frequency of visual aura migraines',
    symptoms: ['Photophobia', 'Hemilateral throbbing headache', 'Nausea'],
    room: 'Suite 405',
    triageNotes: 'Patient notes 4 migraine episodes this month versus baseline 1/month.',
    agentRecommendedAction: 'Evaluate for preventative CGRP inhibitor or Topiramate protocol.'
  },
  {
    id: 'apt-106',
    patientId: 'pat-1',
    patientName: 'Eleanor Sterling',
    patientAge: 58,
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Mitchell',
    specialty: 'Cardiology',
    date: '2026-10-30',
    time: '02:00 PM',
    durationMinutes: 30,
    status: 'Completed',
    urgency: 'Routine (Level 4)',
    reasonForVisit: 'Echocardiogram follow-up',
    symptoms: ['Stable'],
    room: 'Suite 204',
    triageNotes: 'Ejection fraction normal at 60%. Preserved systolic function.',
    agentRecommendedAction: 'Routine 12-month echocardiogram follow-up scheduled.'
  }
];

export const INITIAL_TRIAGE_RECORDS: TriageEntry[] = [
  {
    id: 'trg-01',
    patientName: 'Arthur Pendelton',
    timestamp: 'Today, 08:40 AM',
    symptoms: ['Substernal chest pressure', 'Shortness of breath on mild exertion'],
    urgency: 'Urgent (Level 2)',
    recommendedDepartment: 'Cardiovascular Care',
    recommendedDoctor: 'Dr. Sarah Mitchell',
    agentSummary: 'High clinical suspicion of ischemic cardiac symptoms in patient with known CAD history. Fast-tracked to immediate consult.',
    vitalFlags: ['BP 142/90 mmHg', 'Pulse 66 bpm'],
    status: 'Treated'
  },
  {
    id: 'trg-02',
    patientName: 'Zoe Chen',
    timestamp: 'Today, 09:48 AM',
    symptoms: ['Fever 100.2F', 'Right ear tugging', 'Decreased appetite for 24h'],
    urgency: 'Urgent (Level 2)',
    recommendedDepartment: 'Pediatric Center',
    recommendedDoctor: 'Dr. Elena Rostova',
    agentSummary: 'Pediatric otitis media / pharyngitis presentation. Assigned to child-friendly bay.',
    vitalFlags: ['Elevated temp 100.2F', 'Tachycardia appropriate for fever (92 bpm)'],
    status: 'Assigned'
  },
  {
    id: 'trg-03',
    patientName: 'Eleanor Sterling',
    timestamp: 'Today, 09:10 AM',
    symptoms: ['Morning lightheadedness', 'Polyuria'],
    urgency: 'Standard (Level 3)',
    recommendedDepartment: 'Primary Care',
    recommendedDoctor: 'Dr. Marcus Vance',
    agentSummary: 'Possible orthostatic hypotension or glycemic fluctuation in diabetic patient.',
    vitalFlags: ['Mildly elevated fasting glucose 128 mg/dL'],
    status: 'Assigned'
  }
];

export const INITIAL_METRICS: ClinicMetrics = {
  totalAppointmentsToday: 24,
  checkedInCount: 8,
  inConsultationCount: 4,
  completedToday: 11,
  avgWaitTimeMinutes: 14,
  agentTriageAccuracy: 98.4,
  urgentCasesCount: 3,
  activePhysiciansCount: 5
};

export interface PatientActivity {
  id: string;
  patientId: string;
  patientName: string;
  type: 'check_in' | 'consultation_started' | 'triage_flag' | 'vitals_logged' | 'prescription_issued';
  description: string;
  time: string;
  doctorName?: string;
  urgency?: string;
}

export const INITIAL_ACTIVITIES: PatientActivity[] = [
  {
    id: 'act-1',
    patientId: 'pat-4',
    patientName: 'Arthur Pendelton',
    type: 'triage_flag',
    description: 'AI Triage classified patient as Level 1 Priority for substernal chest discomfort.',
    time: '8 mins ago',
    doctorName: 'Dr. Sarah Mitchell',
    urgency: 'Level 1 · Emergency'
  },
  {
    id: 'act-2',
    patientId: 'pat-1',
    patientName: 'Eleanor Sterling',
    type: 'check_in',
    description: 'Checked into waiting lounge for diabetic follow-up & hypertension evaluation.',
    time: '18 mins ago',
    doctorName: 'Dr. Marcus Vance'
  },
  {
    id: 'act-3',
    patientId: 'pat-5',
    patientName: 'Zoe Chen',
    type: 'consultation_started',
    description: 'Consultation started in Pediatric Bay 1 for acute otitis media assessment.',
    time: '26 mins ago',
    doctorName: 'Dr. Elena Rostova',
    urgency: 'Level 2 · Urgent'
  },
  {
    id: 'act-4',
    patientId: 'pat-3',
    patientName: 'Maya Lin Rodriguez',
    type: 'vitals_logged',
    description: 'Vitals logged: BP 116/74 mmHg, Heart Rate 68 bpm, SpO2 99%.',
    time: '42 mins ago',
    doctorName: 'Dr. Amara Patel'
  },
  {
    id: 'act-5',
    patientId: 'pat-2',
    patientName: 'David K. Morrison',
    type: 'prescription_issued',
    description: 'Routine Albuterol inhaler prescription refill verified and queued.',
    time: '1 hour ago',
    doctorName: 'Dr. Marcus Vance'
  }
];

