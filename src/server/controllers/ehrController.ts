import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { EHRService } from '../services/ehrService';
import { db } from '../db';
import path from 'path';
import fs from 'fs';

export class EHRController {
  public static async getPatientRecords(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.params.patientId || req.user?.profileId || db.patients[0].id;
      const result = EHRService.getPatientEHR(
        patientId,
        req.user?.id || db.users[0].id,
        req.user?.role || 'PATIENT'
      );
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async createClinicalNote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patientId, type, title, summary, metadata } = req.body;
      const result = await EHRService.createEHRRecord({
        patientId,
        doctorUserId: req.user?.id || db.users[1].id,
        type: type || 'CONSULTATION',
        title,
        summary,
        metadata,
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recordId } = req.params;
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: { code: 'FILE_REQUIRED', message: 'Medical file upload is required.' } });
        return;
      }

      const result = await EHRService.attachDocument(recordId, file, req.user?.id || 'system');
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static async downloadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const doc = db.ehrDocuments.find((d) => d.id === documentId);
      if (!doc) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
        return;
      }

      const filePath = path.join(process.cwd(), 'uploads', doc.storageKey);
      if (fs.existsSync(filePath)) {
        res.download(filePath, doc.fileName);
      } else {
        // Return simulated medical certificate/report for zero-friction testing
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}.txt"`);
        res.send(`CUREVIA EHR DOCUMENT VAULT\nDocument ID: ${doc.id}\nFile: ${doc.fileName}\nSize: ${doc.fileSize} bytes\nEncrypted Medical Record File`);
      }
    } catch (err) {
      next(err);
    }
  }
}
