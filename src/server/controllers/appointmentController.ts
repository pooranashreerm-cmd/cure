import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppointmentService } from '../services/appointmentService';
import { db } from '../db';

const bookSchema = z.object({
  doctorId: z.string().min(1),
  hospitalId: z.string().min(1),
  department: z.string().min(1),
  appointmentDate: z.string().min(10), // YYYY-MM-DD
  appointmentTime: z.string().min(1),
  reason: z.string().optional(),
});

export class AppointmentController {
  public static async book(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = bookSchema.parse(req.body);
      const result = await AppointmentService.bookAppointment(req.user?.id || db.users[0].id, validated);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Appointment booked successfully. Reminders and token assigned.',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await AppointmentService.cancelAppointment(id, req.user?.id || db.users[0].id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const patient = db.patients.find((p) => p.userId === userId);
      const doctor = db.doctors.find((d) => d.userId === userId);

      let appointments = db.appointments;
      if (patient) {
        appointments = appointments.filter((a) => a.patientId === patient.id);
      } else if (doctor) {
        appointments = appointments.filter((a) => a.doctorId === doctor.id);
      }

      const enriched = appointments.map((a) => {
        const doc = db.doctors.find((d) => d.id === a.doctorId);
        const pat = db.patients.find((p) => p.id === a.patientId);
        const user = pat ? db.users.find((u) => u.id === pat.userId) : null;
        return {
          ...a,
          doctorName: doc?.name || 'Dr. Medical Practitioner',
          patientName: user?.name || 'Patient',
        };
      });

      res.status(200).json({ success: true, data: enriched });
    } catch (err) {
      next(err);
    }
  }
}
