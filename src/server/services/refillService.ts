import { db } from '../db';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';
import { socketService } from './socketService';

export class RefillService {
  public static async getRefillStatus(patientId: string) {
    const refills = db.medicineRefills.filter((r) => r.patientId === patientId);
    return refills;
  }

  public static async requestRefill(refillId: string, patientUserId: string) {
    const refill = db.medicineRefills.find((r) => r.id === refillId);
    if (!refill) throw { statusCode: 404, code: 'REFILL_NOT_FOUND', message: 'Refill record not found' };

    refill.status = 'REFILL_REQUESTED';
    refill.updatedAt = new Date().toISOString();

    const pharmacy = db.pharmacies[0];
    const patientUser = db.users.find((u) => u.id === patientUserId);

    if (pharmacy) {
      socketService.emitToUser(pharmacy.userId, 'new_refill_order', {
        refillId: refill.id,
        medicineName: refill.medicineName,
        patientName: patientUser?.name || 'Patient',
        requestedQty: refill.prescribedQty,
      });
    }

    AuditService.log({
      userId: patientUserId,
      actorRole: 'PATIENT',
      action: 'REFILL_REQUESTED',
      resource: 'MedicineRefill',
      resourceId: refill.id,
      metadata: { medicineName: refill.medicineName },
    });

    return {
      success: true,
      message: 'Refill request dispatched to your connected pharmacy dispensary.',
      refill,
    };
  }

  public static async checkLowSupplies() {
    for (const refill of db.medicineRefills) {
      if (refill.remainingQty <= 6 && !refill.isAlertSent) {
        refill.isAlertSent = true;
        const patient = db.patients.find((p) => p.id === refill.patientId);
        if (patient) {
          await NotificationService.send({
            userId: patient.userId,
            type: 'MEDICINE_REFILL',
            translationKey: 'medicine.refill',
            translationParams: {
              medicineName: refill.medicineName,
              remaining: refill.remainingQty,
            },
          });
        }
      }
    }
  }
}
