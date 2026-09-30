import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';

const sendOtpSchema = z.object({
  mobileNumber: z.string().min(10, 'Mobile number must have at least 10 digits'),
  role: z.enum(['PATIENT', 'DOCTOR', 'COMMUNITY_WORKER', 'PHARMACY', 'ADMIN']).optional(),
});

const verifyOtpSchema = z.object({
  mobileNumber: z.string().min(10),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  role: z.enum(['PATIENT', 'DOCTOR', 'COMMUNITY_WORKER', 'PHARMACY', 'ADMIN']).optional(),
  name: z.string().optional(),
});

export class AuthController {
  public static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = sendOtpSchema.parse(req.body);
      const result = await AuthService.sendOtp(validated.mobileNumber, validated.role);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = verifyOtpSchema.parse(req.body);
      const result = await AuthService.verifyOtp(
        validated.mobileNumber,
        validated.otp,
        validated.role,
        validated.name
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, error: { code: 'MISSING_TOKEN', message: 'refreshToken is required' } });
        return;
      }
      const result = await AuthService.refreshToken(refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
        return;
      }

      const user = db.users.find((u) => u.id === req.user?.id);
      let profile: any = null;

      if (user?.role === 'PATIENT') {
        profile = db.patients.find((p) => p.userId === user.id);
      } else if (user?.role === 'DOCTOR') {
        profile = db.doctors.find((d) => d.userId === user.id);
      } else if (user?.role === 'COMMUNITY_WORKER') {
        profile = db.communityWorkers.find((w) => w.userId === user.id);
      } else if (user?.role === 'PHARMACY') {
        profile = db.pharmacies.find((ph) => ph.userId === user.id);
      }

      res.status(200).json({
        success: true,
        data: {
          user,
          profile,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateLanguage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { language } = req.body;
      if (!language) {
        res.status(400).json({ success: false, error: { code: 'MISSING_LANGUAGE', message: 'language is required' } });
        return;
      }

      const user = db.users.find((u) => u.id === req.user?.id);
      if (user) {
        user.preferredLanguage = language;
        user.updatedAt = new Date().toISOString();
      }

      res.status(200).json({ success: true, message: `Language preference set to ${language}` });
    } catch (err) {
      next(err);
    }
  }
}
