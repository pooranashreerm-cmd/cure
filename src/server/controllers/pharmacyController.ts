import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { AuditService } from '../services/auditService';
import { NotificationService } from '../services/notificationService';
import { socketService } from './../services/socketService';

export class PharmacyController {
  public static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const pharmacy = db.pharmacies.find((ph) => ph.userId === req.user?.id) || db.pharmacies[0];
      const user = db.users.find((u) => u.id === pharmacy.userId) || db.users[3];

      const orders = db.prescriptions.map((rx) => {
        const patient = db.patients.find((p) => p.id === rx.patientId);
        const patientUser = patient ? db.users.find((u) => u.id === patient.userId) : null;
        const doctor = db.doctors.find((d) => d.id === rx.doctorId);
        const items = db.prescriptionItems.filter((i) => i.prescriptionId === rx.id);

        return {
          prescriptionId: rx.id,
          prescriptionNumber: rx.prescriptionNumber,
          patientId: patient?.patientId || 'CRV-UNKNOWN',
          patientName: patientUser?.name || 'Patient',
          doctorName: doctor?.name || 'Dr. Medical Practitioner',
          status: rx.pharmacyStatus || 'PENDING',
          items,
          createdAt: rx.createdAt,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          pharmacy: {
            ...pharmacy,
            name: user.name,
          },
          stats: {
            pendingOrdersCount: orders.filter((o) => o.status === 'PENDING' || o.status === 'NEW' || o.status === 'PREPARING').length,
            dispensedTodayCount: 18,
            lowStockAlertsCount: 3,
          },
          orders,
          refillRequests: db.medicineRefills.filter((r) => r.status === 'REFILL_REQUESTED'),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prescriptionId } = req.params;
      const { status } = req.body; // PREPARING, READY, DISPENSED, CANCELLED

      const rx = db.prescriptions.find((p) => p.id === prescriptionId || p.prescriptionNumber === prescriptionId);
      if (!rx) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Prescription not found' } });
        return;
      }

      rx.pharmacyStatus = status;
      rx.updatedAt = new Date().toISOString();

      const patient = db.patients.find((p) => p.id === rx.patientId);
      if (patient) {
        if (status === 'READY') {
          await NotificationService.send({
            userId: patient.userId,
            type: 'SYSTEM_NOTIFICATION',
            translationKey: 'prescription.created',
            customTitle: 'Prescription Ready for Pickup',
            metadata: { prescriptionId: rx.id },
          });
        }
        socketService.emitToUser(patient.userId, 'prescription_order_status', {
          prescriptionId: rx.id,
          status,
        });
      }

      AuditService.log({
        userId: req.user?.id,
        actorRole: 'PHARMACY',
        action: 'PHARMACY_ORDER_STATUS_UPDATE',
        resource: 'Prescription',
        resourceId: rx.id,
        metadata: { status },
      });

      res.status(200).json({ success: true, message: `Prescription status updated to ${status}` });
    } catch (err) {
      next(err);
    }
  }
}
