import type { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointmentService.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

export class AppointmentController {
  async createAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const appointment = await appointmentService.createAppointment(req.body, req.user);
      sendCreated(res, appointment, 'Appointment booked successfully');
    } catch (error) {
      next(error);
    }
  }

  async listAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const appointments = await appointmentService.listAppointments(req.query as any, req.user);
      sendSuccess(res, appointments, undefined, 200, { count: appointments.length });
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const appointment = await appointmentService.getAppointmentById(req.params.id, req.user);
      sendSuccess(res, appointment);
    } catch (error) {
      next(error);
    }
  }

  async updateAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const updated = await appointmentService.updateAppointment(req.params.id, req.body, req.user);
      sendSuccess(res, updated, 'Appointment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async acceptAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const result = await appointmentService.acceptAppointment(req.params.id, req.body, req.user);
      sendSuccess(res, result.appointment, result.message);
    } catch (error) {
      next(error);
    }
  }

  async rejectAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const result = await appointmentService.rejectAppointment(req.params.id, req.body, req.user);
      sendSuccess(res, result.appointment, result.message);
    } catch (error) {
      next(error);
    }
  }

  async cancelAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const result = await appointmentService.cancelAppointment(req.params.id, req.user);
      sendSuccess(res, result.appointment, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();
