import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/me', requireAuth, AuthController.getMe);
router.post('/language', requireAuth, AuthController.updateLanguage);

export default router;
