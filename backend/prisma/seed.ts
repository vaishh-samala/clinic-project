import { prisma } from '../src/services/db.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding clinic database...');

  const passwordHash = await bcrypt.hash('ClinicSecure2025!', 10);

  // 1. Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clinicagent.com' },
    update: {},
    create: {
      name: 'Clinic Administrator',
      email: 'admin@clinicagent.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Doctors
  const doctor1User = await prisma.user.upsert({
    where: { email: 'sarah.jenkins@clinicagent.com' },
    update: {},
    create: {
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@clinicagent.com',
      passwordHash,
      role: 'DOCTOR',
    },
  });

  const doctor1 = await prisma.doctor.upsert({
    where: { email: 'sarah.jenkins@clinicagent.com' },
    update: {},
    create: {
      userId: doctor1User.id,
      name: 'Dr. Sarah Jenkins, MD, FACC',
      email: 'sarah.jenkins@clinicagent.com',
      specialization: 'Cardiology',
      qualifications: 'MD - Johns Hopkins Medicine, Board Certified in Cardiovascular Diseases',
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
    },
  });

  const doctor2User = await prisma.user.upsert({
    where: { email: 'marcus.vance@clinicagent.com' },
    update: {},
    create: {
      name: 'Dr. Marcus Vance',
      email: 'marcus.vance@clinicagent.com',
      passwordHash,
      role: 'DOCTOR',
    },
  });

  await prisma.doctor.upsert({
    where: { email: 'marcus.vance@clinicagent.com' },
    update: {},
    create: {
      userId: doctor2User.id,
      name: 'Dr. Marcus Vance, MD',
      email: 'marcus.vance@clinicagent.com',
      specialization: 'Internal Medicine',
      qualifications: 'MD - Harvard Medical School, 15+ years Clinical Experience',
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
    },
  });

  // 3. Demo Patient
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@clinicagent.com' },
    update: {},
    create: {
      name: 'Sarah Connor',
      email: 'patient@clinicagent.com',
      passwordHash,
      role: 'PATIENT',
    },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      dateOfBirth: new Date('1990-05-14'),
      phoneNumber: '+1 (555) 234-5678',
      emergencyContact: 'John Connor (+1 555-876-5432)',
      medicalHistory: 'Mild seasonal asthma, non-smoker, mild hypertension managed by diet.',
      allergies: 'Penicillin, Tree nuts',
      currentMedications: 'Albuterol inhaler PRN, Daily Multivitamin',
    },
  });

  // 4. Sample Appointment
  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor1.id,
      date: new Date('2026-11-10T00:00:00Z'),
      timeSlot: '10:00',
      status: 'CONFIRMED',
      reason: 'Routine quarterly cardiovascular wellness checkup',
      notes: 'Blood pressure review requested',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
