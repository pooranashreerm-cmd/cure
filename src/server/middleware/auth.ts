import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { db } from '../db';
import { JwtPayload, UserRole } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id: string; profileId?: string; patient?: any; doctor?: any; worker?: any; pharmacy?: any };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token is required to access this resource.',
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const user = db.users.find((u) => u.id === decoded.userId && u.isActive);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The authenticated user session is invalid or inactive.',
        },
      });
      return;
    }

    // Attach role profiles
    let profileId: string | undefined;
    if (user.role === 'PATIENT') {
      const patient = db.patients.find((p) => p.userId === user.id);
      profileId = patient?.id;
      req.user = { ...decoded, id: user.id, profileId, patient };
    } else if (user.role === 'DOCTOR') {
      const doctor = db.doctors.find((d) => d.userId === user.id);
      profileId = doctor?.id;
      req.user = { ...decoded, id: user.id, profileId, doctor };
    } else if (user.role === 'COMMUNITY_WORKER') {
      const worker = db.communityWorkers.find((w) => w.userId === user.id);
      profileId = worker?.id;
      req.user = { ...decoded, id: user.id, profileId, worker };
    } else if (user.role === 'PHARMACY') {
      const pharmacy = db.pharmacies.find((ph) => ph.userId === user.id);
      profileId = pharmacy?.id;
      req.user = { ...decoded, id: user.id, profileId, pharmacy };
    } else {
      req.user = { ...decoded, id: user.id };
    }

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'The provided authentication token has expired or is invalid.',
      },
    });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: `Access denied. This endpoint requires one of the following roles: [${allowedRoles.join(', ')}]`,
        },
      });
      return;
    }

    next();
  };
};

export const requirePatientAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    return;
  }
  if (req.user.role === 'PATIENT') {
    next();
    return;
  }
  res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Patient access only' } });
};

export const requireDoctorAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    return;
  }
  if (req.user.role === 'DOCTOR') {
    // Check doctor verification
    const doctor = db.doctors.find((d) => d.userId === req.user?.id);
    if (!doctor || !doctor.isVerified) {
      res.status(403).json({
        success: false,
        error: { code: 'DOCTOR_NOT_VERIFIED', message: 'Only verified medical practitioners can execute this action.' },
      });
      return;
    }
    next();
    return;
  }
  res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Doctor access only' } });
};

export const requireCommunityWorkerAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    return;
  }
  if (req.user.role === 'COMMUNITY_WORKER') {
    next();
    return;
  }
  res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Community Health Worker access only' } });
};

export const requirePharmacyAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    return;
  }
  if (req.user.role === 'PHARMACY') {
    next();
    return;
  }
  res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Pharmacy dispensary access only' } });
};
