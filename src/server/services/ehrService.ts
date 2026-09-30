import { db } from '../db';
import { EHRRecordType } from '../types';
import { AuditService } from './auditService';

export class EHRService {
  public static getPatientEHR(patientId: string, actorUserId: string, actorRole: string) {
    const patient = db.patients.find(
      (p) => p.id === patientId || p.patientId === patientId || p.userId === patientId
    );
    if (!patient) throw { statusCode: 404, code: 'PATIENT_NOT_FOUND', message: 'Patient not found' };

    // Role-based access validation
    if (actorRole === 'PATIENT') {
      if (patient.userId !== actorUserId) {
        // Check if user is an approved family member
        const isApprovedFamily = db.familyMembers.some(
          (fm) =>
            fm.patientId === patient.id &&
            fm.status === 'ACCEPTED' &&
            fm.permissions.includes('VIEW_MEDICAL_RECORDS')
        );
        if (!isApprovedFamily) {
          throw { statusCode: 403, code: 'EHR_ACCESS_DENIED', message: 'Unauthorized to view this EHR record.' };
        }
      }
    }

    const records = db.ehrRecords
      .filter((r) => r.patientId === patient.id)
      .map((r) => {
        const documents = db.ehrDocuments.filter((d) => d.ehrRecordId === r.id);
        return {
          ...r,
          documents: documents.map((doc) => ({
            ...doc,
            downloadUrl: `/api/ehr/documents/${doc.id}/download`,
          })),
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Record audit log
    AuditService.log({
      userId: actorUserId,
      actorRole,
      action: 'EHR_VIEW',
      resource: 'PatientEHR',
      resourceId: patient.id,
      metadata: { recordCount: records.length },
    });

    return {
      patient: {
        id: patient.id,
        patientId: patient.patientId,
        bloodGroup: patient.bloodGroup,
        chronicConditions: patient.chronicConditions,
        allergies: patient.allergies,
        medicalRecordNumber: patient.medicalRecordNumber,
      },
      records,
    };
  }

  public static async createEHRRecord(params: {
    patientId: string;
    doctorUserId: string;
    type: EHRRecordType;
    title: string;
    summary: string;
    doctorName?: string;
    hospitalName?: string;
    metadata?: any;
  }) {
    const patient = db.patients.find(
      (p) => p.id === params.patientId || p.patientId === params.patientId || p.userId === params.patientId
    );
    if (!patient) throw { statusCode: 404, code: 'PATIENT_NOT_FOUND', message: 'Patient not found' };

    const doctor = db.doctors.find((d) => d.userId === params.doctorUserId || d.id === params.doctorUserId);
    const todayStr = new Date().toISOString().split('T')[0];

    const record = {
      id: `ehr-${Date.now()}`,
      patientId: patient.id,
      createdById: doctor?.id || 'system',
      prescriptionId: null,
      type: params.type,
      title: params.title,
      summary: params.summary,
      doctorName: params.doctorName || doctor?.name || 'Attending Physician',
      hospitalName: params.hospitalName || 'Apollo City Hospital & Care Center',
      date: todayStr,
      metadata: params.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.ehrRecords.unshift(record);

    AuditService.log({
      userId: params.doctorUserId,
      actorRole: 'DOCTOR',
      action: 'EHR_RECORD_CREATED',
      resource: 'EHRRecord',
      resourceId: record.id,
      metadata: { type: params.type, title: params.title },
    });

    return record;
  }

  public static async attachDocument(recordId: string, file: Express.Multer.File, uploadedById: string) {
    const record = db.ehrRecords.find((r) => r.id === recordId);
    if (!record) throw { statusCode: 404, code: 'EHR_RECORD_NOT_FOUND', message: 'EHR record not found' };

    const doc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ehrRecordId: record.id,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      storageKey: file.filename,
      storageBucket: 'curevia-ehr-vault',
      uploadedById,
      isEncrypted: true,
      createdAt: new Date().toISOString(),
    };

    db.ehrDocuments.push(doc);

    AuditService.log({
      userId: uploadedById,
      actorRole: 'USER',
      action: 'EHR_DOCUMENT_UPLOADED',
      resource: 'EHRDocument',
      resourceId: doc.id,
      metadata: { fileName: doc.fileName, size: doc.fileSize },
    });

    return {
      document: doc,
      downloadUrl: `/api/ehr/documents/${doc.id}/download`,
    };
  }
}
