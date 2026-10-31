import type { Request, Response, NextFunction } from 'express';
import { doctorService } from '../services/doctorService.js';
import { sendSuccess } from '../utils/response.js';

export class DoctorController {
  async listDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctors = await doctorService.listDoctors(req.query as any);
      sendSuccess(res, doctors, undefined, 200, { total: doctors.length });
    } catch (error) {
      next(error);
    }
  }

  async getDoctorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor = await doctorService.getDoctorById(req.params.id);
      sendSuccess(res, doctor);
    } catch (error) {
      next(error);
    }
  }

  async getDoctorAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = req.query.date as string;
      const availability = await doctorService.getDoctorAvailability(req.params.id, date);
      sendSuccess(res, availability);
    } catch (error) {
      next(error);
    }
  }
}

export const doctorController = new DoctorController();
