/**
 * Automated Test Suite for Clinic AI Agent Backend
 * Tests:
 * - Patient registration & input validation
 * - Login authentication & password hashing
 * - JWT issuance & RBAC enforcement
 * - Doctor listing & availability slot calculation
 * - Appointment booking & strict double-booking collision prevention
 * - Appointment cancellation & slot release
 * - Cross-patient authorization isolation
 * - AI Agent triage, red-flag emergency detection, and tool calling
 */

import { authService } from '../src/services/authService.js';
import { doctorService } from '../src/services/doctorService.js';
import { appointmentService } from '../src/services/appointmentService.js';
import { agentService } from '../src/agent/agentService.js';
import { conversationService } from '../src/services/conversationService.js';
import { verifyToken } from '../src/utils/jwt.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    failedTests++;
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
    console.log(`  ✅ PASSED: ${message}`);
  }
}

async function runTestSuite() {
  console.log('\n=======================================================');
  console.log('🧪 Starting Clinic AI Agent Backend Test Suite');
  console.log('=======================================================\n');

  // TEST 1: Patient Registration
  console.log('--- Suite 1: Authentication & Patient Registration ---');
  const uniqueEmail = `test.patient.${Date.now()}@example.com`;
  const regResult = await authService.registerPatient({
    name: 'Jane Doe',
    email: uniqueEmail,
    password: 'SecurePassword123!',
    dateOfBirth: '1992-08-20',
    phoneNumber: '+1 (555) 345-6789',
    medicalHistory: 'No chronic illness',
    allergies: 'None',
  });

  assert(Boolean(regResult.token), 'Registration returns valid JWT access token');
  assert(regResult.user.email === uniqueEmail.toLowerCase(), 'Registered user email matches');
  assert(regResult.user.role === 'PATIENT', 'Registered user has PATIENT role');
  assert(Boolean(regResult.patient.id), 'Linked patient profile record created');

  // Verify JWT decoding
  const decodedToken = verifyToken(regResult.token);
  assert(decodedToken.userId === regResult.user.id, 'JWT payload contains valid userId');
  assert(decodedToken.role === 'PATIENT', 'JWT payload contains PATIENT role');

  // Test duplicate email rejection
  let duplicateRejected = false;
  try {
    await authService.registerPatient({
      name: 'Jane Clone',
      email: uniqueEmail,
      password: 'SecurePassword123!',
      dateOfBirth: '1992-08-20',
      phoneNumber: '+1 (555) 999-0000',
    });
  } catch (err: any) {
    if (err.statusCode === 409) duplicateRejected = true;
  }
  assert(duplicateRejected, 'Duplicate email registration throws 409 ConflictError');

  // TEST 2: Login Flow
  console.log('\n--- Suite 2: Login Flow ---');
  const loginResult = await authService.login({
    email: uniqueEmail,
    password: 'SecurePassword123!',
  });
  assert(Boolean(loginResult.token), 'Login returns valid token');
  assert(loginResult.user.id === regResult.user.id, 'Login authenticated correct user');

  let invalidPassRejected = false;
  try {
    await authService.login({
      email: uniqueEmail,
      password: 'WrongPassword!',
    });
  } catch (err: any) {
    if (err.statusCode === 401) invalidPassRejected = true;
  }
  assert(invalidPassRejected, 'Invalid password throws 401 UnauthorizedError');

  // TEST 3: Doctor Listings & Availability Calculation
  console.log('\n--- Suite 3: Doctor Catalog & Schedule Availability ---');
  const allDoctors = await doctorService.listDoctors({});
  assert(allDoctors.length >= 4, 'Doctors list returns pre-seeded specialists');

  const cardiologists = await doctorService.listDoctors({ specialization: 'Cardiology' });
  assert(cardiologists.length >= 1, 'Filters doctors by Cardiology specialization');
  const docJenkins = cardiologists[0];

  // Test availability on a Monday (Dr. Jenkins works Mon-Fri)
  // 2026-11-09 is a Monday
  const availMonday = await doctorService.getDoctorAvailability(docJenkins.id, '2026-11-09');
  assert(availMonday.isWorkingDay === true, 'Identifies 2026-11-09 as a valid working day');
  assert(availMonday.slots.length > 0, 'Generates time slots for doctor schedule');

  // Test on Sunday (2026-11-08 is a Sunday - doctor does not work)
  const availSunday = await doctorService.getDoctorAvailability(docJenkins.id, '2026-11-08');
  assert(availSunday.isWorkingDay === false, 'Recognizes non-working days for doctor');

  // TEST 4: Patient Booking & Doctor Accept/Reject/Reassign Workflow
  console.log('\n--- Suite 4: Patient Booking & Doctor Accept/Reject Workflow ---');
  const testDate = '2026-11-09'; // Monday
  const testSlot = '11:00';

  const userContext = {
    userId: regResult.user.id,
    email: regResult.user.email,
    role: regResult.user.role as 'PATIENT',
    patientId: regResult.patient.id,
  };

  // 4.1 Patient requests a visit with Doctor 1 (Dr. Jenkins)
  const bookedAppt = await appointmentService.createAppointment(
    {
      doctorId: docJenkins.id,
      date: testDate,
      timeSlot: testSlot,
      reason: 'Chest fluttering and shortness of breath',
    },
    userContext
  );

  assert(bookedAppt.status === 'PENDING', 'New visit request starts as PENDING awaiting doctor explicit review');
  assert(bookedAppt.doctorId === docJenkins.id, 'Visit request assigned to Doctor 1 (Dr. Jenkins)');
  assert(bookedAppt.patientId === regResult.patient.id, 'Appointment linked to authenticated patient');

  // 4.2 Doctor 1 explicitly rejects the request
  const docJenkinsContext = {
    userId: 'usr-doc-01',
    email: 'sarah.jenkins@clinicagent.com',
    role: 'DOCTOR' as const,
    doctorId: docJenkins.id,
  };

  const rejectResult = await appointmentService.rejectAppointment(
    bookedAppt.id,
    { reason: 'Specialist schedule fully committed; transfer to Internal Medicine recommended.' },
    docJenkinsContext
  );

  assert(rejectResult.success === true, 'Doctor 1 rejection processed successfully');
  assert(rejectResult.appointment.status === 'REASSIGNED', 'Status transitioned to REASSIGNED by AI Agent');
  assert(rejectResult.appointment.originalDoctorId === docJenkins.id, 'Original doctor tracked as Dr. Jenkins');
  assert(Boolean(rejectResult.appointment.reassignedDoctorId), 'AI Agent reassigned request to alternative available doctor');
  const reassignedDoctorId = rejectResult.appointment.reassignedDoctorId!;
  console.log(`    ↳ AI Agent auto-reassigned request to doctor ID: ${reassignedDoctorId} (${rejectResult.appointment.reassignedDoctorName})`);

  // 4.3 Second doctor explicitly accepts the reassigned request
  const doc2Context = {
    userId: 'usr-doc-02',
    email: 'marcus.vance@clinicagent.com',
    role: 'DOCTOR' as const,
    doctorId: reassignedDoctorId,
  };

  const acceptResult = await appointmentService.acceptAppointment(
    bookedAppt.id,
    { doctorNotes: 'Accepted for comprehensive evaluation and ECG check.' },
    doc2Context
  );

  assert(acceptResult.success === true, 'Second doctor explicit acceptance succeeded');
  assert(acceptResult.appointment.status === 'CONFIRMED', 'Visit status transitioned to CONFIRMED only after explicit doctor acceptance');
  assert(acceptResult.appointment.doctorNotes?.includes('comprehensive evaluation') === true, 'Physician clinical notes saved');

  // 4.4 Double-booking collision prevention for the newly confirmed slot
  let doubleBookingPrevented = false;
  try {
    await appointmentService.createAppointment(
      {
        doctorId: reassignedDoctorId,
        date: testDate,
        timeSlot: testSlot,
        reason: 'Colliding appointment attempt',
        patientId: 'pat-connor-01',
      },
      {
        userId: 'usr-admin-01',
        email: 'admin@clinicagent.com',
        role: 'ADMIN',
      }
    );
  } catch (err: any) {
    if (err.statusCode === 409) doubleBookingPrevented = true;
  }
  assert(doubleBookingPrevented, 'Double booking prevented: 409 Conflict thrown when slot already taken');

  // TEST 5: RBAC & Cross-Patient Protection
  console.log('\n--- Suite 5: RBAC & Record Isolation ---');
  let crossPatientBlocked = false;
  try {
    // Demo patient attempting to access Jane Doe's appointment
    await appointmentService.getAppointmentById(bookedAppt.id, {
      userId: 'usr-patient-01',
      email: 'patient@clinicagent.com',
      role: 'PATIENT',
      patientId: 'pat-connor-01',
    });
  } catch (err: any) {
    if (err.statusCode === 403) crossPatientBlocked = true;
  }
  assert(crossPatientBlocked, 'Cross-patient access blocked with 403 ForbiddenError');

  // TEST 6: Appointment Cancellation & Slot Liberation
  console.log('\n--- Suite 6: Appointment Cancellation ---');
  const cancelResult = await appointmentService.cancelAppointment(bookedAppt.id, userContext);
  assert(cancelResult.appointment.status === 'CANCELLED', 'Appointment status transitioned to CANCELLED');

  // Slot should now be available again!
  const availAfterCancel = await doctorService.getDoctorAvailability(docJenkins.id, testDate);
  const freedSlot = availAfterCancel.slots.find((s) => s.timeSlot === testSlot);
  assert(freedSlot?.available === true, 'Cancelled slot is liberated and available for re-booking');

  // TEST 7: AI Agent Chat & Clinical Safety Guardrails
  console.log('\n--- Suite 7: AI Agent Chat & Guardrails ---');
  const testSessionId = `test-sess-${Date.now()}`;

  // 7.1 Emergency Red Flag Escalation
  const redFlagResponse = await agentService.processMessage(
    testSessionId,
    'I have sudden severe chest pain, crushing pressure, and shortness of breath',
    regResult.patient.id
  );
  assert(redFlagResponse.urgency === 'RED_FLAG', 'Agent classifies acute chest pain as RED_FLAG');
  assert(redFlagResponse.assessment?.isEmergency === true, 'Agent marks assessment as emergency');
  assert(
    redFlagResponse.reply.includes('911') || redFlagResponse.reply.includes('Emergency'),
    'Agent response directs user to 911 / Emergency Department'
  );
  assert(Boolean(redFlagResponse.disclaimer), 'Includes mandatory clinical disclaimer');

  // 7.2 Conversational Doctor Search Tool
  const doctorQueryResponse = await agentService.processMessage(
    testSessionId,
    'I need to see a cardiologist',
    regResult.patient.id
  );
  assert(
    doctorQueryResponse.reply.includes('Dr. Sarah Jenkins') || doctorQueryResponse.reply.includes('Cardiology'),
    'Agent executes doctor search tool and recommends cardiologist'
  );

  // 7.3 Multi-Turn Session Persistence
  const sessionHistory = await conversationService.getConversationBySessionId(testSessionId);
  assert(sessionHistory.messages.length >= 4, 'Conversation session persists all multi-turn messages');

  // TEST 8: Input Validation Error Rejection (Zod Schemas)
  console.log('\n--- Suite 8: Input Validation Errors (Zod) ---');
  const { registerPatientSchema, loginSchema: zodLoginSchema } = await import('../src/validators/authValidators.js');
  const { createAppointmentSchema: zodApptSchema } = await import('../src/validators/appointmentValidators.js');

  // 8.1 Invalid email rejection
  const badEmailParse = registerPatientSchema.safeParse({
    name: 'Invalid Email Person',
    email: 'not-an-email',
    password: 'ValidPassword1!',
    dateOfBirth: '1990-01-01',
    phoneNumber: '1234567890',
  });
  assert(!badEmailParse.success, 'Validation rejects invalid email format');

  // 8.2 Short/weak password rejection (no uppercase/number)
  const weakPassParse = registerPatientSchema.safeParse({
    name: 'Weak Pass Person',
    email: 'valid@example.com',
    password: 'short',
    dateOfBirth: '1990-01-01',
    phoneNumber: '1234567890',
  });
  assert(!weakPassParse.success, 'Validation rejects weak password missing length/uppercase/number criteria');

  // 8.3 Invalid appointment date/time slot format
  const badSlotParse = zodApptSchema.safeParse({
    doctorId: 'doc-jenkins-01',
    date: '11-09-2026', // wrong format, expects YYYY-MM-DD
    timeSlot: '9:00',   // wrong format, expects HH:mm
    reason: 'Follow-up',
  });
  assert(!badSlotParse.success, 'Validation rejects invalid date and timeSlot formatting');

  console.log('\n=======================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('=======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
