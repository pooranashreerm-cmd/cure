import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { OPQueueService } from '../services/opQueueService';
import { db } from '../db';

export class OPQueueController {
  public static async getQueue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = (req.params.doctorId as string) || req.user?.doctorId || db.doctors[0].id;
      const result = OPQueueService.getDoctorQueue(doctorId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async callNext(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user?.doctorId || (req.body.doctorId as string) || db.doctors[0].id;
      const { tokenNumber } = req.body;
      const result = await OPQueueService.callNextToken(doctorId, tokenNumber);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
