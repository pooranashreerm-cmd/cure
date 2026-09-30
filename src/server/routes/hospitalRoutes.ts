import { Router } from 'express';
import { HospitalController } from '../controllers/hospitalController';

const router = Router();

router.get('/', HospitalController.getHospitals);
router.get('/doctors', HospitalController.getDoctors);

export default router;
