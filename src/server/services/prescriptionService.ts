import { db } from '../db';
import { CreatePrescriptionRequest, EHRRecordType } from '../types';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';
import { socketService } from './socketService';

export class PrescriptionService {
  public static async createPrescription(doctorId: string, payload: CreatePrescriptionRequest) {
    // 1. Validate Doctor & Patient
    const doctor = db.doctors.find((d) => d.id === doctorId || d.userId === doctorId);
    if (!doctor || !doctor.isVerified) {
      throw {
        statusCode: 403,
        code: 'UNAUTHORIZED_DOCTOR',
        message: 'Only verified medical practitioners can issue digital prescriptions.',
      };
    }

    const patient = db.patients.find(
      (p) => p.id === payload.patientId || p.patientId === payload.patientId || p.userId === payload.patientId
    );
    if (!patient) {
      throw {
        statusCode: 404,
        code: 'PATIENT_NOT_FOUND',
        message: `Patient with ID ${payload.patientId} was not found in the clinical registry.`,
      };
    }

    const patientUser = db.users.find((u) => u.id === patient.userId);
    const pharmacy = db.pharmacies[0]; // Connected dispensary

    const prescriptionNumber = `RX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    // 2. Transaction Simulation: Build entities in memory atomically
    const newPrescription = {
      id: `rx-${Date.now()}`,
      prescriptionNumber,
      patientId: patient.id,
      doctorId: doctor.id,
      pharmacyId: pharmacy ? pharmacy.id : null,
      diagnosis: payload.diagnosis,
      instructions: payload.instructions || payload.notes || 'Take medications as directed.',
      startDate: todayStr,
      followUpDate: payload.followUpDate || null,
      status: 'ACTIVE',
      pharmacyStatus: 'NEW',
      vitals: payload.vitals || {
        bloodPressure: '120/80 mmHg',
        pulse: '72 bpm',
        temperature: '98.6 F',
        spo2: '99%',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newItems: any[] = [];
    const newSchedules: any[] = [];
    const newReminders: any[] = [];
    const newRefills: any[] = [];

    // 3. Process items & calculate schedules
    for (const item of payload.items) {
      const itemId = `rx-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const durationDays = item.durationDays || 14;

      // Calculate schedule times based on frequency
      let scheduledTimes: string[] = item.times || [];
      if (scheduledTimes.length === 0) {
        scheduledTimes = this.calculateTimesFromFrequency(item.frequency);
      }

      const totalDoses = durationDays * scheduledTimes.length;

      const prescriptionItem = {
        id: itemId,
        prescriptionId: newPrescription.id,
        medicineName: item.medicineName,
        dosage: item.dosage,
        dosageForm: item.dosageForm || 'tablet',
        frequency: item.frequency,
        times: scheduledTimes,
        mealTiming: item.mealTiming || 'after_food',
        quantity: item.quantity || totalDoses,
        durationDays,
        specialInstructions: item.specialInstructions || '',
        createdAt: new Date().toISOString(),
      };
      newItems.push(prescriptionItem);

      // Generate Medicine Schedule & Reminders
      for (const timeStr of scheduledTimes) {
        const scheduleId = `sch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const schedule = {
          id: scheduleId,
          patientId: patient.id,
          prescriptionId: newPrescription.id,
          prescriptionItemId: itemId,
          medicineName: item.medicineName,
          dosage: item.dosage,
          dosageForm: item.dosageForm || 'tablet',
          mealTiming: item.mealTiming || 'after_food',
          scheduledTime: timeStr,
          startDate: todayStr,
          endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isActive: true,
          totalPrescribedDoses: totalDoses,
          remainingDoses: totalDoses,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newSchedules.push(schedule);

        // Generate Today's Reminder
        const reminderId = `rem-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        newReminders.push({
          id: reminderId,
          patientId: patient.id,
          scheduleId: scheduleId,
          scheduledDate: todayStr,
          scheduledTime: timeStr,
          scheduledAt: `${todayStr}T${timeStr}:00Z`,
          status: 'SCHEDULED',
          notified5Min: false,
          notified2Min: false,
          notifiedExact: false,
          voicePlayed: false,
          snoozeCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Add Refill tracking
      newRefills.push({
        id: `refill-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        patientId: patient.id,
        prescriptionId: newPrescription.id,
        pharmacyId: pharmacy ? pharmacy.id : null,
        medicineName: `${item.medicineName} (${item.dosage})`,
        prescribedQty: totalDoses,
        dispensedQty: totalDoses,
        remainingQty: totalDoses,
        estimatedFinishDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isAlertSent: false,
        status: 'DISPENSED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 4. Attach Prescription to Patient EHR Record
    const ehrRecord = {
      id: `ehr-rx-${Date.now()}`,
      patientId: patient.id,
      createdById: doctor.id,
      prescriptionId: newPrescription.id,
      type: 'PRESCRIPTION' as EHRRecordType,
      title: `Digital Prescription #${prescriptionNumber}`,
      summary: `Diagnosis: ${payload.diagnosis}. Medications: ${payload.items.map((i) => `${i.medicineName} (${i.dosage})`).join(', ')}.`,
      doctorName: doctor.name || 'Medical Practitioner',
      hospitalName: 'Apollo City Hospital & Care Center',
      date: todayStr,
      metadata: {
        prescriptionNumber,
        diagnosis: payload.diagnosis,
        vitals: newPrescription.vitals,
        itemCount: payload.items.length,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 5. Commit Transaction
    db.prescriptions.unshift(newPrescription);
    db.prescriptionItems.push(...newItems);
    db.medicineSchedules.unshift(...newSchedules);
    db.medicineReminders.unshift(...newReminders);
    db.medicineRefills.unshift(...newRefills);
    db.ehrRecords.unshift(ehrRecord);

    // 6. Notify Patient and Pharmacy in real time
    if (patientUser) {
      await NotificationService.send({
        userId: patientUser.id,
        type: 'NEW_PRESCRIPTION',
        translationKey: 'prescription.created',
        translationParams: { doctorName: doctor.name || 'Doctor' },
        metadata: { prescriptionId: newPrescription.id, prescriptionNumber },
      });
    }

    if (pharmacy) {
      socketService.emitToUser(pharmacy.userId, 'new_prescription_order', {
        prescriptionId: newPrescription.id,
        prescriptionNumber,
        patientName: patientUser?.name || 'Patient',
        items: newItems,
      });
    }

    // 7. Audit Log
    AuditService.log({
      userId: doctor.userId,
      actorRole: 'DOCTOR',
      action: 'PRESCRIPTION_CREATE',
      resource: 'Prescription',
      resourceId: newPrescription.id,
      metadata: {
        patientId: patient.id,
        prescriptionNumber,
        itemsCount: newItems.length,
      },
    });

    return {
      prescription: newPrescription,
      items: newItems,
      schedules: newSchedules,
      remindersCount: newReminders.length,
      ehrRecordId: ehrRecord.id,
    };
  }

  private static calculateTimesFromFrequency(frequency: string): string[] {
    const f = frequency.toLowerCase().trim();
    if (f.includes('1-0-1') || f.includes('twice')) {
      return ['08:30', '20:30'];
    }
    if (f.includes('1-1-1') || f.includes('thrice') || f.includes('3 times')) {
      return ['08:30', '14:00', '20:30'];
    }
    if (f.includes('0-0-1') || f.includes('bedtime') || f.includes('night')) {
      return ['21:30'];
    }
    if (f.includes('1-0-0') || f.includes('morning') || f.includes('once')) {
      return ['08:30'];
    }
    if (f.includes('0-1-0') || f.includes('afternoon')) {
      return ['13:30'];
    }
    return ['08:30', '20:30'];
  }
}
