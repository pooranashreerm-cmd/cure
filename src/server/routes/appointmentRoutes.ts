import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, AppointmentController.list);
router.post('/book', requireAuth, AppointmentController.book);
router.post('/:id/cancel', requireAuth, AppointmentController.cancel);

export default router;
