import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/chat', requireAuth, AIController.chat);

export default router;
