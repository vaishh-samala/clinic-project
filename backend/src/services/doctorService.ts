import { inMemoryDb, type DbDoctor } from './db.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import type { ListDoctorsQuery } from '../validators/doctorValidators.js';

export interface DoctorSlot {
  timeSlot: string; // e.g. "09:00"
  available: boolean;
  reason?: string;
}

export interface DoctorAvailabilityResult {
  doctorId: string;
  doctorName: string;
  specialization: string;
  date: string;
  isWorkingDay: boolean;
  totalSlots: number;
  availableSlotsCount: number;
  slots: DoctorSlot[];
}

export class DoctorService {
  /**
   * List all doctors with filtering support
   */
  async listDoctors(query: ListDoctorsQuery) {
    let results: DbDoctor[] = Array.from(inMemoryDb.doctors.values());

    if (query.activeOnly !== false) {
      results = results.filter((doc) => doc.isActive);
    }

    if (query.specialization) {
      const specLower = query.specialization.toLowerCase();
      results = results.filter((doc) => doc.specialization.toLowerCase().includes(specLower));
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchLower) ||
          doc.specialization.toLowerCase().includes(searchLower) ||
          doc.qualifications.toLowerCase().includes(searchLower)
      );
    }

    return results.map((d) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      specialization: d.specialization,
      qualifications: d.qualifications,
      roomNumber: d.roomNumber,
      availability: d.availability,
      isActive: d.isActive,
    }));
  }

  /**
   * Get single doctor by ID
   */
  async getDoctorById(id: string) {
    const doctor = inMemoryDb.doctors.get(id);
    if (!doctor) {
      throw new NotFoundError(`Doctor with ID '${id}' not found`);
    }

    return {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      qualifications: doctor.qualifications,
      roomNumber: doctor.roomNumber,
      availability: doctor.availability,
      isActive: doctor.isActive,
    };
  }

  /**
   * Compute exact available appointment time slots for a doctor on a specific date
   */
  async getDoctorAvailability(doctorId: string, dateStr: string): Promise<DoctorAvailabilityResult> {
    const doctor = inMemoryDb.doctors.get(doctorId);
    if (!doctor) {
      throw new NotFoundError(`Doctor with ID '${doctorId}' not found`);
    }

    if (!doctor.isActive) {
      throw new BadRequestError('Doctor is currently inactive and not accepting appointments');
    }

    // Determine weekday of requested date in UTC
    const dateObj = new Date(dateStr + 'T00:00:00Z');
    if (isNaN(dateObj.getTime())) {
      throw new BadRequestError('Invalid date format. Expected YYYY-MM-DD');
    }

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = days[dateObj.getUTCDay()];

    const isWorkingDay = doctor.availability.workDays.includes(dayOfWeek);

    if (!isWorkingDay) {
      return {
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        date: dateStr,
        isWorkingDay: false,
        totalSlots: 0,
        availableSlotsCount: 0,
        slots: [],
      };
    }

    // Generate potential slots between startTime and endTime
    const { startTime, endTime, slotDurationMinutes, breakStart, breakEnd } = doctor.availability;

    const parseMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const formatMinutes = (totalMin: number) => {
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const startMin = parseMinutes(startTime);
    const endMin = parseMinutes(endTime);
    const breakStartMin = breakStart ? parseMinutes(breakStart) : -1;
    const breakEndMin = breakEnd ? parseMinutes(breakEnd) : -1;

    // Get all existing active appointments for this doctor on this date
    const bookedSlots = new Set<string>();
    for (const appt of inMemoryDb.appointments.values()) {
      if (
        appt.doctorId === doctorId &&
        appt.date === dateStr &&
        (appt.status === 'CONFIRMED' || appt.status === 'PENDING')
      ) {
        bookedSlots.add(appt.timeSlot);
      }
    }

    const slots: DoctorSlot[] = [];

    for (let current = startMin; current + slotDurationMinutes <= endMin; current += slotDurationMinutes) {
      // Check if slot falls inside doctor's lunch / break
      if (breakStartMin !== -1 && breakEndMin !== -1) {
        if (current >= breakStartMin && current < breakEndMin) {
          continue; // Skip lunch/break slot
        }
      }

      const timeSlotStr = formatMinutes(current);
      const isBooked = bookedSlots.has(timeSlotStr);

      slots.push({
        timeSlot: timeSlotStr,
        available: !isBooked,
        reason: isBooked ? 'Slot already reserved by another patient' : undefined,
      });
    }

    const availableSlotsCount = slots.filter((s) => s.available).length;

    return {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      date: dateStr,
      isWorkingDay: true,
      totalSlots: slots.length,
      availableSlotsCount,
      slots,
    };
  }
}

export const doctorService = new DoctorService();
