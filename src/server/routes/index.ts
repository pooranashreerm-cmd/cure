import { Router } from 'express';
import authRoutes from './authRoutes';
import patientRoutes from './patientRoutes';
import doctorRoutes from './doctorRoutes';
import communityRoutes from './communityRoutes';
import pharmacyRoutes from './pharmacyRoutes';
import prescriptionRoutes from './prescriptionRoutes';
import appointmentRoutes from './appointmentRoutes';
import ehrRoutes from './ehrRoutes';
import familyRoutes from './familyRoutes';
import hospitalRoutes from './hospitalRoutes';
import aiRoutes from './aiRoutes';
import { DocsController } from '../controllers/docsController';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patient', patientRoutes);
router.use('/doctor', doctorRoutes);
router.use('/community', communityRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/ehr', ehrRoutes);
router.use('/family', familyRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/ai', aiRoutes);
router.get('/docs/openapi.json', DocsController.getOpenApiSpec);

export default router;
