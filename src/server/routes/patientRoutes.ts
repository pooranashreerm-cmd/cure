import { Router } from 'express';
import { PatientController } from '../controllers/patientController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/dashboard', requireAuth, PatientController.getDashboard);
router.get('/reminders', requireAuth, PatientController.getReminders);
router.post('/reminders/:id/taken', requireAuth, PatientController.markTaken);
router.post('/reminders/:id/snooze', requireAuth, PatientController.snooze);
router.get('/adherence', requireAuth, PatientController.getAdherence);
router.post('/refill', requireAuth, PatientController.requestRefill);
router.post('/voice-call', requireAuth, PatientController.triggerVoiceCall);

export default router;
