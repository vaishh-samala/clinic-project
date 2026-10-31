import { Router } from 'express';
import { doctorController } from '../controllers/doctorController.js';
import { validateParams, validateQuery } from '../middleware/validate.js';
import {
  listDoctorsQuerySchema,
  doctorAvailabilityQuerySchema,
  doctorIdParamSchema,
} from '../validators/doctorValidators.js';

export const doctorRouter = Router();

doctorRouter.get('/', validateQuery(listDoctorsQuerySchema), doctorController.listDoctors);
doctorRouter.get('/:id', validateParams(doctorIdParamSchema), doctorController.getDoctorById);
doctorRouter.get(
  '/:id/availability',
  validateParams(doctorIdParamSchema),
  validateQuery(doctorAvailabilityQuerySchema),
  doctorController.getDoctorAvailability
);
