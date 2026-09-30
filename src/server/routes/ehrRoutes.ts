import { Router } from 'express';
import { EHRController } from '../controllers/ehrController';
import { requireAuth } from '../middleware/auth';
import { uploadEHRDocument } from '../middleware/upload';

const router = Router();

router.get('/records/:patientId?', requireAuth, EHRController.getPatientRecords);
router.post('/records', requireAuth, EHRController.createClinicalNote);
router.post('/records/:recordId/documents', requireAuth, uploadEHRDocument.single('file'), EHRController.uploadDocument);
router.get('/documents/:documentId/download', EHRController.downloadDocument);

export default router;
