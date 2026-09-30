import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { OPQueueService } from '../services/opQueueService';

export class DoctorController {
  public static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctor = db.doctors.find((d) => d.userId === req.user?.id) || db.doctors[0];
      const user = db.users.find((u) => u.id === doctor.userId) || db.users[1];

      const queueData = OPQueueService.getDoctorQueue(doctor.id);
      const totalConsultationsToday = db.appointments.filter(
        (a) => a.doctorId === doctor.id && a.status === 'COMPLETED'
      ).length;

      const recentPrescriptions = db.prescriptions
        .filter((p) => p.doctorId === doctor.id)
        .slice(0, 10);

      res.status(200).json({
        success: true,
        data: {
          doctor: {
            ...doctor,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
          },
          stats: {
            patientsInQueue: queueData.totalWaiting,
            consultationsCompleted: totalConsultationsToday,
            currentToken: queueData.currentToken,
            activePrescriptionsCount: recentPrescriptions.length,
          },
          queue: queueData.queue,
          recentPrescriptions,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getPatientsList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const patients = db.patients.map((p) => {
        const u = db.users.find((user) => user.id === p.userId);
        const lastPrescription = db.prescriptions.find((rx) => rx.patientId === p.id);
        return {
          ...p,
          name: u?.name || 'Patient',
          mobileNumber: u?.mobileNumber || '',
          lastVisit: lastPrescription?.createdAt || p.createdAt,
          diagnosis: lastPrescription?.diagnosis || 'Routine Follow-up',
        };
      });

      res.status(200).json({ success: true, data: patients });
    } catch (err) {
      next(err);
    }
  }
}
