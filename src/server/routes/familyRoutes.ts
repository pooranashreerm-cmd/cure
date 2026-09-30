import { Router } from 'express';
import { FamilyController } from '../controllers/familyController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/circle', requireAuth, FamilyController.getCircle);
router.post('/invite', requireAuth, FamilyController.invite);
router.delete('/members/:memberId', requireAuth, FamilyController.revoke);

export default router;
