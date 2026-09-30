import { Router } from 'express';
import { CommunityController } from '../controllers/communityController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/dashboard', requireAuth, CommunityController.getDashboard);
router.post('/field-visit', requireAuth, CommunityController.logFieldVisit);

export default router;
