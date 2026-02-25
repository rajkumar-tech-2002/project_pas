import express from 'express';
const router = express.Router();
import * as appointmentController from '../controllers/appointmentController.js';

router.get('/', appointmentController.getAllAppointments);
router.get('/date/:date', appointmentController.getAppointmentsByDate);
router.post('/', appointmentController.saveAppointment);
router.patch('/:id/status', appointmentController.updateStatus);
router.patch('/:id/reschedule', appointmentController.rescheduleAppointment);
router.delete('/:id', appointmentController.deleteAppointment);
router.get('/stats', appointmentController.getStats);
router.get('/insights', appointmentController.getStrategicInsights);
router.patch('/:id/start', appointmentController.startMeeting);
router.patch('/:id/complete', appointmentController.completeMeeting);
router.get('/report', appointmentController.getReportData);
router.get('/:id', appointmentController.getAppointmentById);

export default router;
