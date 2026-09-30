import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController';
import { OPQueueController } from '../controllers/opQueueController';
import { PrescriptionController } from '../controllers/prescriptionController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/dashboard', requireAuth, DoctorController.getDashboard);
router.get('/patients', requireAuth, DoctorController.getPatientsList);
router.get('/queue', requireAuth, OPQueueController.getQueue);
router.post('/queue/call-next', requireAuth, OPQueueController.callNext);
router.post('/prescriptions', requireAuth, PrescriptionController.create);

export default router;
