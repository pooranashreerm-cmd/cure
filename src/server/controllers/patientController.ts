import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { ReminderEngine } from '../services/reminderEngine';
import { RefillService } from '../services/refillService';
import { VoiceService } from '../services/voiceService';

export class PatientController {
  public static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const patient = db.patients.find((p) => p.userId === userId) || db.patients[0];
      const user = db.users.find((u) => u.id === patient?.userId) || db.users[0];

      const todayStr = new Date().toISOString().split('T')[0];

      const reminders = db.medicineReminders.filter(
        (r) => r.patientId === patient.id && r.scheduledDate === todayStr
      );

      const activePrescriptions = db.prescriptions.filter(
        (p) => p.patientId === patient.id && p.status === 'ACTIVE'
      );

      const appointments = db.appointments
        .filter((a) => a.patientId === patient.id && a.status === 'CONFIRMED')
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

      const adherence = ReminderEngine.calculateAdherence(patient.id);
      const notifications = db.notifications.filter((n) => n.userId === user.id).slice(0, 10);
      const refills = await RefillService.getRefillStatus(patient.id);

      res.status(200).json({
        success: true,
        data: {
          patient: {
            ...patient,
            name: user.name,
            mobileNumber: user.mobileNumber,
            preferredLanguage: user.preferredLanguage,
            profileImage: user.profileImage,
          },
          reminders,
          activePrescriptions,
          nextAppointment: appointments[0] || null,
          adherence,
          notifications,
          refills,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getReminders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const patient = db.patients.find((p) => p.userId === req.user?.id) || db.patients[0];
      const reminders = db.medicineReminders.filter((r) => r.patientId === patient.id);
      res.status(200).json({ success: true, data: reminders });
    } catch (err) {
      next(err);
    }
  }

  public static async markTaken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const result = await ReminderEngine.markReminderTaken(id, req.user?.id || db.users[0].id, notes);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async snooze(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { minutes } = req.body;
      const result = await ReminderEngine.snoozeReminder(id, req.user?.id || db.users[0].id, minutes || 10);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getAdherence(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const patient = db.patients.find((p) => p.userId === req.user?.id) || db.patients[0];
      const adherence = ReminderEngine.calculateAdherence(patient.id);
      res.status(200).json({ success: true, data: adherence });
    } catch (err) {
      next(err);
    }
  }

  public static async requestRefill(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refillId } = req.body;
      const result = await RefillService.requestRefill(refillId, req.user?.id || db.users[0].id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async triggerVoiceCall(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const patient = db.patients.find((p) => p.userId === req.user?.id) || db.patients[0];
      const result = await VoiceService.simulateTriggerCall(patient.id, req.body.message);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
