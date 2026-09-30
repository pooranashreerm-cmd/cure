import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { FamilyService } from '../services/familyService';
import { db } from '../db';

export class FamilyController {
  public static async getCircle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = FamilyService.getFamilyCircle(req.user?.id || db.users[0].id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async invite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await FamilyService.inviteFamilyMember(req.user?.id || db.users[0].id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async revoke(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { memberId } = req.params;
      const result = await FamilyService.revokeMember(memberId, req.user?.id || db.users[0].id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
