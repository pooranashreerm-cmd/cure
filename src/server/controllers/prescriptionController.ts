import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { PrescriptionService } from '../services/prescriptionService';
import { db } from '../db';

const createPrescriptionSchema = z.object({
  patientId: z.string().min(1, 'patientId is required'),
  diagnosis: z.string().min(2, 'diagnosis is required'),
  instructions: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  vitals: z
    .object({
      bloodPressure: z.string().optional(),
      pulse: z.string().optional(),
      temperature: z.string().optional(),
      weight: z.string().optional(),
      spo2: z.string().optional(),
    })
    .optional(),
  items: z.array(
    z.object({
      medicineName: z.string().min(1, 'Medicine name is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      dosageForm: z.string().optional(),
      frequency: z.string().min(1, 'Frequency is required'),
      times: z.array(z.string()).optional(),
      mealTiming: z.enum(['before_food', 'after_food', 'with_food', 'empty_stomach']).optional(),
      quantity: z.number().optional(),
      durationDays: z.number().optional(),
      specialInstructions: z.string().optional(),
    })
  ).min(1, 'At least one medicine item is required'),
});

export class PrescriptionController {
  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createPrescriptionSchema.parse(req.body);
      const doctor = db.doctors.find((d) => d.userId === req.user?.id) || db.doctors[0];

      const result = await PrescriptionService.createPrescription(doctor.id, validated);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Prescription created successfully, automatic medicine alarms set, and sent to dispensary.',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const prescription = db.prescriptions.find((p) => p.id === id || p.prescriptionNumber === id);
      if (!prescription) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Prescription not found' } });
        return;
      }

      const items = db.prescriptionItems.filter((i) => i.prescriptionId === prescription.id);
      const doctor = db.doctors.find((d) => d.id === prescription.doctorId);
      const patient = db.patients.find((p) => p.id === prescription.patientId);
      const patientUser = patient ? db.users.find((u) => u.id === patient.userId) : null;

      res.status(200).json({
        success: true,
        data: {
          ...prescription,
          doctorName: doctor?.name || 'Dr. Medical Practitioner',
          patientName: patientUser?.name || 'Patient',
          items,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const prescriptions = db.prescriptions.map((p) => {
        const items = db.prescriptionItems.filter((i) => i.prescriptionId === p.id);
        const patient = db.patients.find((pat) => pat.id === p.patientId);
        const user = patient ? db.users.find((u) => u.id === patient.userId) : null;
        return {
          ...p,
          patientName: user?.name || 'Patient',
          itemsCount: items.length,
        };
      });

      res.status(200).json({ success: true, data: prescriptions });
    } catch (err) {
      next(err);
    }
  }
}
