import { Router } from 'express';
import { PrescriptionController } from '../controllers/prescriptionController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, PrescriptionController.getAll);
router.post('/', requireAuth, PrescriptionController.create);
router.get('/:id', requireAuth, PrescriptionController.getById);

export default router;
