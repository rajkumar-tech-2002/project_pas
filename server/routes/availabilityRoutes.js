import express from 'express';
const router = express.Router();
import * as availabilityController from '../controllers/availabilityController.js';

router.get('/', availabilityController.getAllAvailability);
router.get('/:date', availabilityController.getAvailabilityByDate);
router.post('/', availabilityController.createAvailability);
router.put('/:id', availabilityController.updateAvailability);
router.delete('/:id', availabilityController.deleteAvailability);

export default router;
