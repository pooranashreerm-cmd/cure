import { Router } from 'express';
import { PharmacyController } from '../controllers/pharmacyController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/dashboard', requireAuth, PharmacyController.getDashboard);
router.post('/orders/:prescriptionId/status', requireAuth, PharmacyController.updateOrderStatus);

export default router;
