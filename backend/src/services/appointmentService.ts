import { inMemoryDb, type DbAppointment, type AppointmentStatus } from './db.js';
import { doctorService } from './doctorService.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors.js';
import type { TokenPayload } from '../utils/jwt.js';
import type {
  CreateAppointmentInput,
  ListAppointmentsQuery,
  UpdateAppointmentInput,
  AcceptAppointmentInput,
  RejectAppointmentInput,
} from '../validators/appointmentValidators.js';

export class AppointmentService {
  /**
   * Helper to format an appointment with populated doctor & patient details
   */
  private formatAppointment(appt: DbAppointment) {
    const doctor = inMemoryDb.doctors.get(appt.doctorId);
    const patient = inMemoryDb.patients.get(appt.patientId);
    const patientUser = patient ? inMemoryDb.users.get(patient.userId) : null;
    const reassignedDoc = appt.reassignedDoctorId ? inMemoryDb.doctors.get(appt.reassignedDoctorId) : null;
    const originalDoc = appt.originalDoctorId ? inMemoryDb.doctors.get(appt.originalDoctorId) : null;

    return {
      id: appt.id,
      patientId: appt.patientId,
      patient: patient
        ? {
            id: patient.id,
            name: patientUser?.name ?? 'Unknown Patient',
            email: patientUser?.email ?? '',
            phoneNumber: patient.phoneNumber,
            dateOfBirth: patient.dateOfBirth,
          }
        : null,
      doctorId: appt.doctorId,
      doctor: doctor
        ? {
            id: doctor.id,
            name: doctor.name,
            specialization: doctor.specialization,
            roomNumber: doctor.roomNumber,
          }
        : null,
      originalDoctorId: appt.originalDoctorId ?? null,
      originalDoctorName: originalDoc?.name ?? null,
      reassignedDoctorId: appt.reassignedDoctorId ?? null,
      reassignedDoctorName: reassignedDoc?.name ?? null,
      date: appt.date,
      timeSlot: appt.timeSlot,
      status: appt.status,
      reason: appt.reason,
      notes: appt.notes ?? null,
      rejectionReason: appt.rejectionReason ?? null,
      doctorNotes: appt.doctorNotes ?? null,
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
    };
  }

  /**
   * Book a new appointment with double-booking prevention & availability checks
   */
  async createAppointment(input: CreateAppointmentInput, user: TokenPayload) {
    // 1. Resolve patient ID
    let targetPatientId: string;

    if (user.role === 'PATIENT') {
      if (!user.patientId) {
        throw new BadRequestError('Current user does not have a linked patient record');
      }
      targetPatientId = user.patientId;
    } else {
      // DOCTOR or ADMIN booking on behalf of patient
      if (!input.patientId) {
        throw new BadRequestError('Patient ID is required when booking as staff or administrator');
      }
      targetPatientId = input.patientId;
    }

    // Verify patient exists
    const patient = inMemoryDb.patients.get(targetPatientId);
    if (!patient) {
      throw new NotFoundError(`Patient with ID '${targetPatientId}' not found`);
    }

    // 2. Verify doctor exists and is active
    const doctor = inMemoryDb.doctors.get(input.doctorId);
    if (!doctor) {
      throw new NotFoundError(`Doctor with ID '${input.doctorId}' not found`);
    }
    if (!doctor.isActive) {
      throw new BadRequestError('The selected doctor is currently not accepting appointments');
    }

    // 3. Verify date is not in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (input.date < todayStr) {
      throw new BadRequestError('Cannot schedule appointments in the past');
    }

    // 4. Validate doctor availability for the requested date & time
    const availability = await doctorService.getDoctorAvailability(input.doctorId, input.date);
    if (!availability.isWorkingDay) {
      throw new BadRequestError(`Doctor ${doctor.name} does not have clinic hours on this day`);
    }

    const matchedSlot = availability.slots.find((s) => s.timeSlot === input.timeSlot);
    if (!matchedSlot) {
      throw new BadRequestError(
        `Time slot '${input.timeSlot}' is outside Doctor ${doctor.name}'s scheduled hours for this day`
      );
    }

    // 5. Check Double Booking: Is Doctor already booked at this date + timeSlot?
    for (const existing of inMemoryDb.appointments.values()) {
      if (
        existing.doctorId === input.doctorId &&
        existing.date === input.date &&
        existing.timeSlot === input.timeSlot &&
        (existing.status === 'CONFIRMED' || existing.status === 'PENDING')
      ) {
        throw new ConflictError(
          `Conflict: Doctor ${doctor.name} already has an active appointment at ${input.timeSlot} on ${input.date}`
        );
      }
    }

    // 6. Check Double Booking: Does Patient already have an appointment at this date + timeSlot?
    for (const existing of inMemoryDb.appointments.values()) {
      if (
        existing.patientId === targetPatientId &&
        existing.date === input.date &&
        existing.timeSlot === input.timeSlot &&
        (existing.status === 'CONFIRMED' || existing.status === 'PENDING')
      ) {
        throw new ConflictError(
          `Conflict: Patient already has an appointment scheduled at ${input.timeSlot} on ${input.date}`
        );
      }
    }

    // 7. Persist Appointment (Starts as PENDING until assigned doctor explicitly accepts)
    const appointmentId = `appt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newAppointment: DbAppointment = {
      id: appointmentId,
      patientId: targetPatientId,
      doctorId: input.doctorId,
      date: input.date,
      timeSlot: input.timeSlot,
      status: 'PENDING',
      reason: input.reason,
      notes: input.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryDb.appointments.set(newAppointment.id, newAppointment);

    return this.formatAppointment(newAppointment);
  }

  /**
   * List appointments with Role-Based Access Control
   */
  async listAppointments(query: ListAppointmentsQuery, user: TokenPayload) {
    let appointments = Array.from(inMemoryDb.appointments.values());

    // Role-based visibility enforcement
    if (user.role === 'PATIENT') {
      if (!user.patientId) return [];
      appointments = appointments.filter((a) => a.patientId === user.patientId);
    } else if (user.role === 'DOCTOR') {
      if (!user.doctorId) return [];
      appointments = appointments.filter((a) =>
        a.doctorId === user.doctorId ||
        a.reassignedDoctorId === user.doctorId ||
        a.originalDoctorId === user.doctorId
      );
    } else if (user.role === 'ADMIN') {
      // Admin can filter by patientId or doctorId if supplied
      if (query.patientId) {
        appointments = appointments.filter((a) => a.patientId === query.patientId);
      }
      if (query.doctorId) {
        appointments = appointments.filter((a) => a.doctorId === query.doctorId);
      }
    }

    // Additional query filters
    if (query.status) {
      appointments = appointments.filter((a) => a.status === query.status);
    }
    if (query.date) {
      appointments = appointments.filter((a) => a.date === query.date);
    }

    // Sort by date and time slot
    appointments.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    return appointments.map((a) => this.formatAppointment(a));
  }

  /**
   * Get single appointment by ID with authorization checks
   */
  async getAppointmentById(id: string, user: TokenPayload) {
    const appt = inMemoryDb.appointments.get(id);
    if (!appt) {
      throw new NotFoundError(`Appointment with ID '${id}' not found`);
    }

    // Authorize: Patient can only view their own; Doctor can only view their own; Admin can view all
    if (user.role === 'PATIENT' && appt.patientId !== user.patientId) {
      throw new ForbiddenError('You are not authorized to view this appointment');
    }
    if (user.role === 'DOCTOR' && appt.doctorId !== user.doctorId) {
      throw new ForbiddenError('You are not authorized to view this appointment');
    }

    return this.formatAppointment(appt);
  }

  /**
   * Update or reschedule appointment
   */
  async updateAppointment(id: string, input: UpdateAppointmentInput, user: TokenPayload) {
    const appt = inMemoryDb.appointments.get(id);
    if (!appt) {
      throw new NotFoundError(`Appointment with ID '${id}' not found`);
    }

    // Authorization checks
    if (user.role === 'PATIENT') {
      if (appt.patientId !== user.patientId) {
        throw new ForbiddenError('You are not authorized to update this appointment');
      }
      // Patients cannot mark appointments COMPLETED
      if (input.status === 'COMPLETED') {
        throw new ForbiddenError('Only medical staff can mark appointments as completed');
      }
    } else if (user.role === 'DOCTOR') {
      if (appt.doctorId !== user.doctorId) {
        throw new ForbiddenError('You are not authorized to update this appointment');
      }
    }

    const newDate = input.date ?? appt.date;
    const newTimeSlot = input.timeSlot ?? appt.timeSlot;

    // If rescheduling to a new date or slot, check availability & collision
    const isRescheduling = input.date !== undefined || input.timeSlot !== undefined;

    if (isRescheduling) {
      if (appt.status === 'CANCELLED') {
        throw new BadRequestError('Cannot reschedule a cancelled appointment. Please book a new appointment');
      }

      // Check doctor availability
      const availability = await doctorService.getDoctorAvailability(appt.doctorId, newDate);
      const slot = availability.slots.find((s) => s.timeSlot === newTimeSlot);
      if (!slot) {
        throw new BadRequestError(`Time slot '${newTimeSlot}' is not valid for Doctor schedule on ${newDate}`);
      }

      // Check collision with other appointments
      for (const other of inMemoryDb.appointments.values()) {
        if (other.id === appt.id) continue; // skip self
        if (
          other.doctorId === appt.doctorId &&
          other.date === newDate &&
          other.timeSlot === newTimeSlot &&
          (other.status === 'CONFIRMED' || other.status === 'PENDING')
        ) {
          throw new ConflictError(
            `Cannot reschedule: Doctor already has an active appointment at ${newTimeSlot} on ${newDate}`
          );
        }
      }

      appt.date = newDate;
      appt.timeSlot = newTimeSlot;
    }

    if (input.status) {
      appt.status = input.status as AppointmentStatus;
    }
    if (input.reason) {
      appt.reason = input.reason;
    }
    if (input.notes !== undefined) {
      appt.notes = input.notes;
    }

    appt.updatedAt = new Date();
    inMemoryDb.appointments.set(appt.id, appt);

    return this.formatAppointment(appt);
  }

  /**
   * Explicit Doctor Acceptance of a Visit / Consultation Request
   */
  async acceptAppointment(id: string, input: AcceptAppointmentInput, user: TokenPayload) {
    const appt = inMemoryDb.appointments.get(id);
    if (!appt) {
      throw new NotFoundError(`Appointment with ID '${id}' not found`);
    }

    // Must be assigned doctor or admin
    if (user.role === 'DOCTOR' && appt.doctorId !== user.doctorId && appt.reassignedDoctorId !== user.doctorId) {
      throw new ForbiddenError('Only the assigned physician can accept this consultation request');
    }

    if (appt.status === 'CONFIRMED') {
      return {
        success: true,
        message: 'Appointment is already confirmed',
        appointment: this.formatAppointment(appt),
      };
    }

    if (appt.status === 'CANCELLED') {
      throw new BadRequestError('Cannot accept a cancelled consultation request');
    }

    // Verify doctor does not already have a conflicting confirmed booking
    for (const other of inMemoryDb.appointments.values()) {
      if (other.id === appt.id) continue;
      if (
        other.doctorId === appt.doctorId &&
        other.date === appt.date &&
        other.timeSlot === appt.timeSlot &&
        other.status === 'CONFIRMED'
      ) {
        throw new ConflictError(
          `Schedule conflict: Doctor already has a confirmed appointment at ${appt.timeSlot} on ${appt.date}`
        );
      }
    }

    appt.status = 'CONFIRMED';
    if (input.doctorNotes) {
      appt.doctorNotes = input.doctorNotes;
    }
    if (input.appointmentTime) {
      appt.timeSlot = input.appointmentTime;
    }
    appt.updatedAt = new Date();
    inMemoryDb.appointments.set(appt.id, appt);

    return {
      success: true,
      message: 'Consultation request accepted and scheduled successfully',
      appointment: this.formatAppointment(appt),
    };
  }

  /**
   * Explicit Doctor Rejection with AI Agent Automatic Reassignment Workflow
   */
  async rejectAppointment(id: string, input: RejectAppointmentInput, user: TokenPayload) {
    const appt = inMemoryDb.appointments.get(id);
    if (!appt) {
      throw new NotFoundError(`Appointment with ID '${id}' not found`);
    }

    // Must be assigned doctor or admin
    if (user.role === 'DOCTOR' && appt.doctorId !== user.doctorId && appt.reassignedDoctorId !== user.doctorId) {
      throw new ForbiddenError('Only the assigned physician can reject/reassign this consultation request');
    }

    const currentDoc = inMemoryDb.doctors.get(appt.doctorId);
    const rejectingDoctorName = currentDoc?.name ?? 'Assigned Doctor';

    appt.rejectionReason = input.reason;
    appt.originalDoctorId = appt.doctorId;

    // AI Agent Reassignment: find next available active doctor
    let nextDoctor: typeof currentDoc | undefined;

    if (input.preferredDoctorId && inMemoryDb.doctors.has(input.preferredDoctorId)) {
      const preferred = inMemoryDb.doctors.get(input.preferredDoctorId);
      if (preferred && preferred.id !== appt.doctorId && preferred.isActive) {
        nextDoctor = preferred;
      }
    }

    if (!nextDoctor) {
      const allDoctors = Array.from(inMemoryDb.doctors.values()).filter(
        (d) => d.id !== appt.doctorId && d.isActive
      );

      // 1. Try to find doctor in same specialty without slot collision
      const sameSpecialty = allDoctors.filter(
        (d) => d.specialization.toLowerCase() === currentDoc?.specialization.toLowerCase()
      );
      for (const candidate of sameSpecialty) {
        const hasConflict = Array.from(inMemoryDb.appointments.values()).some(
          (a) => a.doctorId === candidate.id && a.date === appt.date && a.timeSlot === appt.timeSlot && a.status === 'CONFIRMED'
        );
        if (!hasConflict) {
          nextDoctor = candidate;
          break;
        }
      }

      // 2. Fall back to Internal Medicine / Primary Care or another active doctor
      if (!nextDoctor) {
        for (const candidate of allDoctors) {
          const hasConflict = Array.from(inMemoryDb.appointments.values()).some(
            (a) => a.doctorId === candidate.id && a.date === appt.date && a.timeSlot === appt.timeSlot && a.status === 'CONFIRMED'
          );
          if (!hasConflict) {
            nextDoctor = candidate;
            break;
          }
        }
      }
    }

    if (nextDoctor) {
      appt.doctorId = nextDoctor.id;
      appt.reassignedDoctorId = nextDoctor.id;
      appt.status = 'REASSIGNED';
      appt.doctorNotes = `Reassigned from ${rejectingDoctorName} to ${nextDoctor.name} by AI Clinic Agent. Reason: ${input.reason}`;
      appt.updatedAt = new Date();
      inMemoryDb.appointments.set(appt.id, appt);

      return {
        success: true,
        reassigned: true,
        message: `Request rejected by ${rejectingDoctorName} and automatically offered to ${nextDoctor.name} (${nextDoctor.specialization}).`,
        appointment: this.formatAppointment(appt),
      };
    } else {
      appt.status = 'REJECTED';
      appt.doctorNotes = `Declined by ${rejectingDoctorName}. No alternative physicians available for immediate reassignment. Reason: ${input.reason}`;
      appt.updatedAt = new Date();
      inMemoryDb.appointments.set(appt.id, appt);

      return {
        success: true,
        reassigned: false,
        message: `Consultation request rejected by ${rejectingDoctorName}. No alternate physicians available.`,
        appointment: this.formatAppointment(appt),
      };
    }
  }

  /**
   * Cancel an appointment (soft-cancel, liberating the doctor's calendar slot)
   */
  async cancelAppointment(id: string, user: TokenPayload) {
    const appt = inMemoryDb.appointments.get(id);
    if (!appt) {
      throw new NotFoundError(`Appointment with ID '${id}' not found`);
    }

    if (user.role === 'PATIENT' && appt.patientId !== user.patientId) {
      throw new ForbiddenError('You are not authorized to cancel this appointment');
    }
    if (user.role === 'DOCTOR' && appt.doctorId !== user.doctorId) {
      throw new ForbiddenError('You are not authorized to cancel this appointment');
    }

    if (appt.status === 'CANCELLED') {
      throw new BadRequestError('This appointment is already cancelled');
    }

    appt.status = 'CANCELLED';
    appt.updatedAt = new Date();
    inMemoryDb.appointments.set(appt.id, appt);

    return {
      success: true,
      message: 'Appointment cancelled successfully. The time slot has been released.',
      appointment: this.formatAppointment(appt),
    };
  }
}

export const appointmentService = new AppointmentService();
