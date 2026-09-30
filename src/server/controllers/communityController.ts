import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { AuditService } from '../services/auditService';

export class CommunityController {
  public static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const worker = db.communityWorkers.find((w) => w.userId === req.user?.id) || db.communityWorkers[0];
      const user = db.users.find((u) => u.id === worker.userId) || db.users[2];

      const patients = db.patients.map((p) => {
        const u = db.users.find((user) => user.id === p.userId);
        const lastRx = db.prescriptions.find((r) => r.patientId === p.id);
        const scheduledReminders = db.medicineReminders.filter((r) => r.patientId === p.id);
        const takenReminders = scheduledReminders.filter((r) => r.status === 'TAKEN');
        const adherence = scheduledReminders.length > 0 ? Math.round((takenReminders.length / scheduledReminders.length) * 100) : 90;

        return {
          id: p.id,
          patientId: p.patientId,
          name: u?.name || 'Patient',
          mobileNumber: u?.mobileNumber || '',
          age: 48,
          conditions: p.chronicConditions,
          adherence,
          riskLevel: adherence < 75 ? 'HIGH_RISK' : adherence < 90 ? 'MODERATE' : 'GOOD',
          lastVisitDate: '2026-08-12',
          nextFollowUp: '2026-08-25',
          notes: 'Regular check-up conducted. Vitals stable.',
        };
      });

      res.status(200).json({
        success: true,
        data: {
          worker: {
            ...worker,
            name: user.name,
            mobileNumber: user.mobileNumber,
          },
          stats: {
            assignedPatientsCount: patients.length,
            highRiskCount: patients.filter((p) => p.riskLevel === 'HIGH_RISK').length,
            visitsCompletedThisMonth: 34,
            averageAdherence: 92,
          },
          roster: patients,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async logFieldVisit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patientId, vitals, observations, followUpDate } = req.body;
      const worker = db.communityWorkers.find((w) => w.userId === req.user?.id) || db.communityWorkers[0];

      const log = {
        id: `fvl-${Date.now()}`,
        workerId: worker.id,
        patientId,
        vitals: vitals || { bp: '124/80', pulse: '72', spo2: '99%' },
        observations: observations || 'Patient taking morning and evening medications regularly.',
        followUpDate: followUpDate || '2026-09-01',
        createdAt: new Date().toISOString(),
      };

      AuditService.log({
        userId: req.user?.id,
        actorRole: 'COMMUNITY_WORKER',
        action: 'FIELD_VISIT_LOGGED',
        resource: 'Patient',
        resourceId: patientId,
        metadata: { vitals },
      });

      res.status(201).json({ success: true, message: 'Field visit logged successfully', data: log });
    } catch (err) {
      next(err);
    }
  }
}
