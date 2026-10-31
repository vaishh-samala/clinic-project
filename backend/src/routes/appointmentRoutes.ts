import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  acceptAppointmentSchema,
  rejectAppointmentSchema,
  appointmentIdParamSchema,
  listAppointmentsQuerySchema,
} from '../validators/appointmentValidators.js';

export const appointmentRouter = Router();

// All appointment routes require authentication
appointmentRouter.use(authenticateJWT);

appointmentRouter.post('/', validateBody(createAppointmentSchema), appointmentController.createAppointment);
appointmentRouter.get('/', validateQuery(listAppointmentsQuerySchema), appointmentController.listAppointments);
appointmentRouter.get('/:id', validateParams(appointmentIdParamSchema), appointmentController.getAppointmentById);
appointmentRouter.post(
  '/:id/accept',
  validateParams(appointmentIdParamSchema),
  validateBody(acceptAppointmentSchema),
  appointmentController.acceptAppointment
);
appointmentRouter.post(
  '/:id/reject',
  validateParams(appointmentIdParamSchema),
  validateBody(rejectAppointmentSchema),
  appointmentController.rejectAppointment
);
appointmentRouter.patch(
  '/:id',
  validateParams(appointmentIdParamSchema),
  validateBody(updateAppointmentSchema),
  appointmentController.updateAppointment
);
appointmentRouter.delete(
  '/:id',
  validateParams(appointmentIdParamSchema),
  appointmentController.cancelAppointment
);
