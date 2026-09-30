import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AIService } from '../services/aiService';
import { db } from '../db';

export class AIController {
  public static async chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, language } = req.body;
      if (!message) {
        res.status(400).json({ success: false, error: { code: 'MESSAGE_REQUIRED', message: 'message is required' } });
        return;
      }

      const result = await AIService.queryHealthCompanion(
        req.user?.id || db.users[0].id,
        message,
        language || 'en'
      );

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
