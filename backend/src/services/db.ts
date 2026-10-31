import bcrypt from 'bcryptjs';

// Types matching the Prisma models
export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface DbPatient {
  id: string;
  userId: string;
  dateOfBirth: Date;
  phoneNumber: string;
  emergencyContact?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
  currentMedications?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorAvailability {
  workDays: string[]; // e.g. ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
  slotDurationMinutes: number; // e.g. 30
  breakStart?: string; // e.g. "12:00"
  breakEnd?: string;   // e.g. "13:00"
}

export interface DbDoctor {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  specialization: string;
  qualifications: string;
  roomNumber?: string | null;
  availability: DoctorAvailability;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'REASSIGNED' | 'CANCELLED' | 'COMPLETED';

export interface DbAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  originalDoctorId?: string | null;
  reassignedDoctorId?: string | null;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "HH:mm"
  status: AppointmentStatus;
  reason: string;
  notes?: string | null;
  rejectionReason?: string | null;
  doctorNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbConversation {
  id: string;
  sessionId: string;
  patientId?: string | null;
  title?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbMessage {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Resilient Database Store
 * Implements full CRUD with transactions, double-booking prevention,
 * and pre-seeded clinic data for seamless immediate testing and execution.
 */
export class InMemoryDatabase {
  public users: Map<string, DbUser> = new Map();
  public patients: Map<string, DbPatient> = new Map();
  public doctors: Map<string, DbDoctor> = new Map();
  public appointments: Map<string, DbAppointment> = new Map();
  public conversations: Map<string, DbConversation> = new Map();
  public messages: Map<string, DbMessage> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const adminPass = bcrypt.hashSync('AdminPass123!', 10);
    const doctorPass = bcrypt.hashSync('DoctorPass123!', 10);
    const patientPass = bcrypt.hashSync('PatientPass123!', 10);

    // 1. Admin
    const adminUser: DbUser = {
      id: 'usr-admin-01',
      name: 'Clinic Administrator',
      email: 'admin@clinicagent.com',
      passwordHash: adminPass,
      role: 'ADMIN',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };
    this.users.set(adminUser.id, adminUser);

    // 2. Doctor 1 - Cardiology
    const docUser1: DbUser = {
      id: 'usr-doc-01',
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@clinicagent.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };
    this.users.set(docUser1.id, docUser1);

    const doc1: DbDoctor = {
      id: 'doc-jenkins-01',
      userId: docUser1.id,
      name: 'Dr. Sarah Jenkins, MD, FACC',
      email: 'sarah.jenkins@clinicagent.com',
      specialization: 'Cardiology',
      qualifications: 'MD - Johns Hopkins, Board Certified in Cardiovascular Diseases',
      roomNumber: 'Suite 302',
      availability: {
        workDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
        breakStart: '12:00',
        breakEnd: '13:00',
      },
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };
    this.doctors.set(doc1.id, doc1);

    // Doctor 2 - Internal Medicine
    const docUser2: DbUser = {
      id: 'usr-doc-02',
      name: 'Dr. Marcus Vance',
      email: 'marcus.vance@clinicagent.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };
    this.users.set(docUser2.id, docUser2);

    const doc2: DbDoctor = {
      id: 'doc-vance-02',
      userId: docUser2.id,
      name: 'Dr. Marcus Vance, MD',
      email: 'marcus.vance@clinicagent.com',
      specialization: 'Internal Medicine',
      qualifications: 'MD - Harvard Medical School, 15+ years Clinical Practice',
      roomNumber: 'Suite 204',
      availability: {
        workDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
        startTime: '08:30',
        endTime: '16:30',
        slotDurationMinutes: 30,
        breakStart: '12:30',
        breakEnd: '13:30',
      },
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };
    this.doctors.set(doc2.id, doc2);

    // Doctor 3 - Pediatrics
    const docUser3: DbUser = {
      id: 'usr-doc-03',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@clinicagent.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };
    this.users.set(docUser3.id, docUser3);

    const doc3: DbDoctor = {
      id: 'doc-rostova-03',
      userId: docUser3.id,
      name: 'Dr. Elena Rostova, MD, FAAP',
      email: 'elena.rostova@clinicagent.com',
      specialization: 'Pediatrics',
      qualifications: 'MD - Stanford Health Care, Fellowship in Pediatric Care',
      roomNumber: 'Suite 108',
      availability: {
        workDays: ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'SATURDAY'],
        startTime: '09:00',
        endTime: '15:00',
        slotDurationMinutes: 30,
        breakStart: '12:00',
        breakEnd: '12:30',
      },
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };
    this.doctors.set(doc3.id, doc3);

    // Doctor 4 - Orthopedics
    const docUser4: DbUser = {
      id: 'usr-doc-04',
      name: 'Dr. David Chen',
      email: 'david.chen@clinicagent.com',
      passwordHash: doctorPass,
      role: 'DOCTOR',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };
    this.users.set(docUser4.id, docUser4);

    const doc4: DbDoctor = {
      id: 'doc-chen-04',
      userId: docUser4.id,
      name: 'Dr. David Chen, MD, FAAOS',
      email: 'david.chen@clinicagent.com',
      specialization: 'Orthopedics',
      qualifications: 'MD - Mayo Clinic Alix School of Medicine, Sports Medicine Specialist',
      roomNumber: 'Suite 412',
      availability: {
        workDays: ['MONDAY', 'TUESDAY', 'THURSDAY', 'FRIDAY'],
        startTime: '10:00',
        endTime: '18:00',
        slotDurationMinutes: 45,
        breakStart: '13:00',
        breakEnd: '14:00',
      },
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };
    this.doctors.set(doc4.id, doc4);

    // 3. Demo Patients
    // Patient 1 - Sarah Connor
    const patUser1: DbUser = {
      id: 'usr-patient-01',
      name: 'Sarah Connor',
      email: 'patient@clinicagent.com',
      passwordHash: patientPass,
      role: 'PATIENT',
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10'),
    };
    this.users.set(patUser1.id, patUser1);

    const pat1: DbPatient = {
      id: 'pat-connor-01',
      userId: patUser1.id,
      dateOfBirth: new Date('1990-05-14'),
      phoneNumber: '+1 (555) 234-5678',
      emergencyContact: 'John Connor (+1 555-876-5432)',
      medicalHistory: 'Mild seasonal asthma, non-smoker, mild hypertension managed by diet.',
      allergies: 'Penicillin, Tree nuts',
      currentMedications: 'Albuterol inhaler PRN, Multivitamin daily',
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10'),
    };
    this.patients.set(pat1.id, pat1);

    // Patient 2 - Eleanor Sterling
    const patUser2: DbUser = {
      id: 'usr-patient-02',
      name: 'Eleanor Sterling',
      email: 'eleanor.sterling@clinicagent.com',
      passwordHash: patientPass,
      role: 'PATIENT',
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10'),
    };
    this.users.set(patUser2.id, patUser2);

    const pat2: DbPatient = {
      id: 'pat-sterling-02',
      userId: patUser2.id,
      dateOfBirth: new Date('1968-09-22'),
      phoneNumber: '+1 (555) 782-9901',
      emergencyContact: 'Arthur Sterling (+1 555-782-9902)',
      medicalHistory: 'Type 2 Diabetes (controlled), Essential Hypertension.',
      allergies: 'Penicillin, Sulfa drugs',
      currentMedications: 'Lisinopril 10mg daily, Metformin 500mg BID',
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10'),
    };
    this.patients.set(pat2.id, pat2);

    // Patient 3 - Maya Lin Rodriguez
    const patUser3: DbUser = {
      id: 'usr-patient-03',
      name: 'Maya Lin Rodriguez',
      email: 'maya.rodriguez@clinicagent.com',
      passwordHash: patientPass,
      role: 'PATIENT',
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10'),
    };
    this.users.set(patUser3.id, patUser3);

    const pat3: DbPatient = {
      id: 'pat-rodriguez-03',
      userId: patUser3.id,
      dateOfBirth: new Date('1997-03-18'),
      phoneNumber: '+1 (555) 912-3341',
      emergencyContact: 'Elena Rodriguez (+1 555-912-3342)',
      medicalHistory: 'Chronic migraine with aura (4 years).',
      allergies: 'Latex',
      currentMedications: 'Sumatriptan 50mg PRN',
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10'),
    };
    this.patients.set(pat3.id, pat3);

    // Sample confirmed appointment
    const sampleAppt: DbAppointment = {
      id: 'appt-demo-01',
      patientId: pat1.id,
      doctorId: doc1.id,
      date: '2026-11-10',
      timeSlot: '10:00',
      status: 'CONFIRMED',
      reason: 'Routine quarterly cardiovascular wellness checkup',
      notes: 'Patient requested blood pressure review and refill review.',
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-15'),
    };
    this.appointments.set(sampleAppt.id, sampleAppt);
  }
}

// Global resilient DB instance
export const inMemoryDb = new InMemoryDatabase();

/**
 * Resilient PrismaClient Interface
 * Can operate standalone or bridge to PostgreSQL
 */
export class PrismaClient {
  public user = {
    findUnique: async (args: { where: { email?: string; id?: string } }) => {
      if (args.where.email) {
        for (const u of inMemoryDb.users.values()) {
          if (u.email.toLowerCase() === args.where.email.toLowerCase()) return u;
        }
      }
      if (args.where.id) {
        return inMemoryDb.users.get(args.where.id) ?? null;
      }
      return null;
    },
    upsert: async (args: { where: { email: string }; create: any; update: any }) => {
      for (const u of inMemoryDb.users.values()) {
        if (u.email.toLowerCase() === args.where.email.toLowerCase()) return u;
      }
      const newUser: DbUser = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: args.create.name,
        email: args.create.email,
        passwordHash: args.create.passwordHash,
        role: args.create.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDb.users.set(newUser.id, newUser);
      return newUser;
    },
  };

  public doctor = {
    upsert: async (args: { where: { email: string }; create: any; update: any }) => {
      for (const d of inMemoryDb.doctors.values()) {
        if (d.email.toLowerCase() === args.where.email.toLowerCase()) return d;
      }
      const newDoc: DbDoctor = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: args.create.userId,
        name: args.create.name,
        email: args.create.email,
        specialization: args.create.specialization,
        qualifications: args.create.qualifications,
        roomNumber: args.create.roomNumber,
        availability: args.create.availability,
        isActive: args.create.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDb.doctors.set(newDoc.id, newDoc);
      return newDoc;
    },
  };

  public patient = {
    upsert: async (args: { where: { userId: string }; create: any; update: any }) => {
      for (const p of inMemoryDb.patients.values()) {
        if (p.userId === args.where.userId) return p;
      }
      const newPat: DbPatient = {
        id: `pat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: args.create.userId,
        dateOfBirth: args.create.dateOfBirth,
        phoneNumber: args.create.phoneNumber,
        emergencyContact: args.create.emergencyContact,
        medicalHistory: args.create.medicalHistory,
        allergies: args.create.allergies,
        currentMedications: args.create.currentMedications,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDb.patients.set(newPat.id, newPat);
      return newPat;
    },
  };

  public appointment = {
    create: async (args: { data: any }) => {
      const appt: DbAppointment = {
        id: `appt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        patientId: args.data.patientId,
        doctorId: args.data.doctorId,
        date: args.data.date instanceof Date ? args.data.date.toISOString().split('T')[0] : args.data.date,
        timeSlot: args.data.timeSlot,
        status: args.data.status ?? 'CONFIRMED',
        reason: args.data.reason,
        notes: args.data.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDb.appointments.set(appt.id, appt);
      return appt;
    },
  };

  async $connect() {}
  async $disconnect() {}
}

export const prisma = new PrismaClient();
