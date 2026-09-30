import { db } from '../db';
import { ReminderStatus } from '../types';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';
import { socketService } from './socketService';

export class ReminderEngine {
  public static async checkUpcomingReminders() {
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const todayStr = now.toISOString().split('T')[0];

    for (const rem of db.medicineReminders) {
      if (rem.status === 'TAKEN' || rem.status === 'SKIPPED') continue;

      const schedule = db.medicineSchedules.find((s) => s.id === rem.scheduleId);
      if (!schedule || !schedule.isActive) continue;

      const patient = db.patients.find((p) => p.id === rem.patientId);
      const user = patient ? db.users.find((u) => u.id === patient.userId) : null;
      if (!user) continue;

      // Parse reminder scheduled time
      const [remHours, remMinutes] = rem.scheduledTime.split(':').map(Number);
      const remDate = new Date(now);
      remDate.setHours(remHours, remMinutes, 0, 0);

      const diffMinutes = Math.round((remDate.getTime() - now.getTime()) / 60000);

      // T - 5 minutes
      if (diffMinutes === 5 && !rem.notified5Min) {
        rem.notified5Min = true;
        await NotificationService.send({
          userId: user.id,
          type: 'MEDICINE_5_MIN',
          translationKey: 'medicine.reminder.5_minutes',
          translationParams: {
            medicineName: schedule.medicineName,
            dosage: schedule.dosage,
          },
        });
        socketService.emitToUser(user.id, 'reminder_pre_alert', {
          reminderId: rem.id,
          minutesLeft: 5,
          medicineName: schedule.medicineName,
          dosage: schedule.dosage,
        });
      }

      // T - 2 minutes
      if (diffMinutes === 2 && !rem.notified2Min) {
        rem.notified2Min = true;
        await NotificationService.send({
          userId: user.id,
          type: 'MEDICINE_2_MIN',
          translationKey: 'medicine.reminder.2_minutes',
          translationParams: {
            medicineName: schedule.medicineName,
            dosage: schedule.dosage,
            mealTiming: schedule.mealTiming.replace('_', ' '),
          },
        });
        socketService.emitToUser(user.id, 'reminder_pre_alert', {
          reminderId: rem.id,
          minutesLeft: 2,
          medicineName: schedule.medicineName,
          dosage: schedule.dosage,
        });
      }

      // T = 0 Due Alarm
      if (diffMinutes <= 0 && diffMinutes >= -5 && !rem.notifiedExact) {
        rem.notifiedExact = true;
        rem.status = 'NOTIFIED';
        await NotificationService.send({
          userId: user.id,
          type: 'MEDICINE_DUE',
          translationKey: 'medicine.reminder.due',
          translationParams: {
            medicineName: schedule.medicineName,
            dosage: schedule.dosage,
          },
        });
        socketService.emitToUser(user.id, 'medicine_alarm_event', {
          reminderId: rem.id,
          scheduleId: schedule.id,
          medicineName: schedule.medicineName,
          dosage: schedule.dosage,
          mealTiming: schedule.mealTiming,
          scheduledTime: rem.scheduledTime,
        });
      }

      // Missed Dose Check (e.g. > 120 minutes overdue without intake)
      if (diffMinutes < -120 && rem.status !== 'MISSED' && rem.status !== 'TAKEN') {
        rem.status = 'MISSED';
        await NotificationService.send({
          userId: user.id,
          type: 'MEDICINE_MISSED',
          translationKey: 'medicine.reminder.missed',
          translationParams: {
            medicineName: schedule.medicineName,
          },
        });
      }
    }
  }

  public static async markReminderTaken(reminderId: string, patientUserId: string, notes?: string) {
    const patient = db.patients.find((p) => p.userId === patientUserId || p.id === patientUserId);
    if (!patient) throw { statusCode: 404, code: 'PATIENT_NOT_FOUND', message: 'Patient profile not found' };

    const reminder = db.medicineReminders.find((r) => r.id === reminderId && r.patientId === patient.id);
    if (!reminder) throw { statusCode: 404, code: 'REMINDER_NOT_FOUND', message: 'Reminder record not found' };

    const schedule = db.medicineSchedules.find((s) => s.id === reminder.scheduleId);
    if (!schedule) throw { statusCode: 404, code: 'SCHEDULE_NOT_FOUND', message: 'Medicine schedule not found' };

    reminder.status = 'TAKEN';
    reminder.updatedAt = new Date().toISOString();

    // Decrement remaining doses
    if (schedule.remainingDoses > 0) {
      schedule.remainingDoses -= 1;
    }

    // Record Intake
    const intake = {
      id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      patientId: patient.id,
      scheduleId: schedule.id,
      medicineReminderId: reminder.id,
      scheduledAt: reminder.scheduledAt,
      takenAt: new Date().toISOString(),
      status: 'TAKEN' as ReminderStatus,
      notes: notes || 'Taken on schedule',
      createdAt: new Date().toISOString(),
    };
    db.medicineIntakes.unshift(intake);

    // Audit Log
    AuditService.log({
      userId: patientUserId,
      actorRole: 'PATIENT',
      action: 'MEDICINE_INTAKE_RECORDED',
      resource: 'MedicineReminder',
      resourceId: reminder.id,
      metadata: { medicineName: schedule.medicineName, dosage: schedule.dosage },
    });

    // Realtime broadcast
    socketService.emitToUser(patientUserId, 'reminder_status_updated', {
      reminderId: reminder.id,
      status: 'TAKEN',
      intakeId: intake.id,
    });

    return {
      reminder,
      intake,
      remainingDoses: schedule.remainingDoses,
    };
  }

  public static async snoozeReminder(reminderId: string, patientUserId: string, snoozeMinutes: number = 10) {
    const patient = db.patients.find((p) => p.userId === patientUserId || p.id === patientUserId);
    if (!patient) throw { statusCode: 404, code: 'PATIENT_NOT_FOUND', message: 'Patient profile not found' };

    const reminder = db.medicineReminders.find((r) => r.id === reminderId && r.patientId === patient.id);
    if (!reminder) throw { statusCode: 404, code: 'REMINDER_NOT_FOUND', message: 'Reminder record not found' };

    // Validate snooze intervals (5, 10, 15, 30 max)
    const validMinutes = [5, 10, 15, 30].includes(snoozeMinutes) ? snoozeMinutes : 10;

    const snoozedTime = new Date(Date.now() + validMinutes * 60 * 1000);
    reminder.status = 'SNOOZED';
    reminder.snoozedUntil = snoozedTime.toISOString();
    reminder.snoozeCount = (reminder.snoozeCount || 0) + 1;
    reminder.updatedAt = new Date().toISOString();

    socketService.emitToUser(patientUserId, 'reminder_snoozed', {
      reminderId: reminder.id,
      snoozedUntil: reminder.snoozedUntil,
      snoozeMinutes: validMinutes,
    });

    return {
      reminder,
      snoozedUntil: reminder.snoozedUntil,
      message: `Alarm snoozed for ${validMinutes} minutes.`,
    };
  }

  public static calculateAdherence(patientId: string) {
    const totalScheduled = db.medicineReminders.filter((r) => r.patientId === patientId).length;
    const totalTaken = db.medicineReminders.filter((r) => r.patientId === patientId && r.status === 'TAKEN').length;

    const adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;

    return {
      patientId,
      totalScheduled,
      totalTaken,
      totalMissed: db.medicineReminders.filter((r) => r.patientId === patientId && r.status === 'MISSED').length,
      adherenceRate,
      weeklySummary: [
        { day: 'Mon', adherence: 100 },
        { day: 'Tue', adherence: 100 },
        { day: 'Wed', adherence: 85 },
        { day: 'Thu', adherence: 100 },
        { day: 'Fri', adherence: 92 },
        { day: 'Sat', adherence: 100 },
        { day: 'Sun', adherence: 95 },
      ],
    };
  }
}
