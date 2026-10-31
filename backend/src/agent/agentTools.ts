import { doctorService } from '../services/doctorService.js';
import { appointmentService } from '../services/appointmentService.js';
import { inMemoryDb } from '../services/db.js';

export interface ToolDefinition {
  name: string;
  description: string;
  execute: (params: any) => Promise<unknown>;
}

export const clinicTools: Record<string, ToolDefinition> = {
  findDoctors: {
    name: 'findDoctors',
    description: 'Find clinic doctors filtered by specialty or name',
    execute: async (params: { specialty?: string; search?: string }) => {
      const doctors = await doctorService.listDoctors({
        specialization: params.specialty,
        search: params.search,
        activeOnly: true,
      });
      return doctors.map((d) => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        qualifications: d.qualifications,
        roomNumber: d.roomNumber,
      }));
    },
  },

  checkAvailability: {
    name: 'checkAvailability',
    description: 'Check available time slots for a doctor on a specific date (YYYY-MM-DD)',
    execute: async (params: { doctorId: string; date: string }) => {
      const availability = await doctorService.getDoctorAvailability(params.doctorId, params.date);
      const availableOnly = availability.slots.filter((s) => s.available).map((s) => s.timeSlot);
      return {
        doctorId: availability.doctorId,
        doctorName: availability.doctorName,
        date: availability.date,
        isWorkingDay: availability.isWorkingDay,
        availableSlotsCount: availability.availableSlotsCount,
        availableSlots: availableOnly,
      };
    },
  },

  getClinicInfo: {
    name: 'getClinicInfo',
    description: 'Get clinic contact information, hours of operation, and location',
    execute: async () => {
      return {
        name: 'Metro Health Specialist Clinic',
        address: '742 Evergreen Terrace, Medical Arts Pavilion, Suite 100',
        phone: '+1 (555) 019-2834',
        emergencyLine: '911 (or local emergency room)',
        hours: {
          weekdays: '08:00 AM - 06:00 PM',
          saturday: '09:00 AM - 03:00 PM',
          sunday: 'Closed (Emergency / Urgent Care on-call)',
        },
        services: [
          'Cardiovascular Care & ECG',
          'Internal & Preventive Medicine',
          'Pediatrics & Child Wellness',
          'Orthopedics & Sports Medicine',
          'Diagnostic Bloodwork & Imaging Consults',
        ],
      };
    },
  },

  getPatientAppointments: {
    name: 'getPatientAppointments',
    description: 'Lookup existing appointments for a verified patient',
    execute: async (params: { patientId: string }) => {
      const appts = Array.from(inMemoryDb.appointments.values()).filter(
        (a) => a.patientId === params.patientId && a.status !== 'CANCELLED'
      );
      return appts.map((a) => {
        const doc = inMemoryDb.doctors.get(a.doctorId);
        return {
          id: a.id,
          doctorName: doc?.name ?? 'Assigned Doctor',
          specialization: doc?.specialization,
          date: a.date,
          timeSlot: a.timeSlot,
          status: a.status,
          reason: a.reason,
        };
      });
    },
  },

  bookAppointmentSafe: {
    name: 'bookAppointmentSafe',
    description: 'Book an appointment safely on behalf of a patient',
    execute: async (params: {
      patientId: string;
      doctorId: string;
      date: string;
      timeSlot: string;
      reason: string;
    }) => {
      return appointmentService.createAppointment(
        {
          doctorId: params.doctorId,
          date: params.date,
          timeSlot: params.timeSlot,
          reason: params.reason,
          patientId: params.patientId,
        },
        {
          userId: 'agent-bot',
          email: 'agent@clinicagent.com',
          role: 'ADMIN', // Allowed internal execution
          patientId: params.patientId,
        }
      );
    },
  },
};
