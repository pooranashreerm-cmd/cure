import { db } from '../db';
import { QueueStatus } from '../types';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';
import { socketService } from './socketService';

export class OPQueueService {
  public static getDoctorQueue(doctorId: string) {
    const doctor = db.doctors.find((d) => d.id === doctorId || d.userId === doctorId);
    if (!doctor) throw { statusCode: 404, code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found' };

    const queueItems = db.opQueues
      .filter((q) => q.doctorId === doctor.id && q.status !== 'CANCELLED')
      .map((q) => {
        const appointment = db.appointments.find((a) => a.id === q.appointmentId);
        const patient = db.patients.find((p) => p.id === q.patientId);
        const user = patient ? db.users.find((u) => u.id === patient.userId) : null;
        return {
          ...q,
          patientName: user?.name || 'Anonymous Patient',
          patientIdCode: patient?.patientId || 'CRV-UNKNOWN',
          appointmentTime: appointment?.appointmentTime || '10:00 AM',
          reason: appointment?.reason || 'Consultation',
        };
      })
      .sort((a, b) => a.tokenNumber - b.tokenNumber);

    const activeItem = queueItems.find((q) => q.status === 'IN_CONSULTATION');
    const currentToken = activeItem ? activeItem.tokenNumber : (queueItems[0]?.tokenNumber || 1);

    return {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      currentToken,
      totalWaiting: queueItems.filter((q) => q.status === 'WAITING').length,
      queue: queueItems,
    };
  }

  public static async callNextToken(doctorId: string, targetTokenNumber?: number) {
    const doctor = db.doctors.find((d) => d.id === doctorId || d.userId === doctorId);
    if (!doctor) throw { statusCode: 404, code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found' };

    // 1. Mark previous IN_CONSULTATION as COMPLETED
    const currentConsulting = db.opQueues.find((q) => q.doctorId === doctor.id && q.status === 'IN_CONSULTATION');
    if (currentConsulting) {
      currentConsulting.status = 'COMPLETED' as QueueStatus;
      currentConsulting.completedAt = new Date().toISOString();
    }

    // 2. Select next WAITING token
    let nextItem;
    if (targetTokenNumber) {
      nextItem = db.opQueues.find((q) => q.doctorId === doctor.id && q.tokenNumber === targetTokenNumber);
    } else {
      nextItem = db.opQueues
        .filter((q) => q.doctorId === doctor.id && q.status === 'WAITING')
        .sort((a, b) => a.tokenNumber - b.tokenNumber)[0];
    }

    if (!nextItem) {
      return { message: 'No more waiting patients in queue.', queue: this.getDoctorQueue(doctor.id) };
    }

    nextItem.status = 'IN_CONSULTATION' as QueueStatus;
    nextItem.calledAt = new Date().toISOString();

    // 3. Notify patient
    const patient = db.patients.find((p) => p.id === nextItem.patientId);
    const user = patient ? db.users.find((u) => u.id === patient.userId) : null;
    if (user) {
      await NotificationService.send({
        userId: user.id,
        type: 'OP_QUEUE_UPDATE',
        translationKey: 'op.queue.update',
        translationParams: {
          currentToken: nextItem.tokenNumber,
          yourToken: nextItem.tokenNumber,
        },
      });
    }

    // 4. Real-time WebSocket emission
    socketService.emitToDoctorQueue(doctor.id, 'op_queue_token_called', {
      doctorId: doctor.id,
      tokenNumber: nextItem.tokenNumber,
      patientId: nextItem.patientId,
      patientName: user?.name,
    });

    AuditService.log({
      userId: doctor.userId,
      actorRole: 'DOCTOR',
      action: 'QUEUE_TOKEN_CALLED',
      resource: 'OPQueue',
      resourceId: nextItem.id,
      metadata: { tokenNumber: nextItem.tokenNumber, doctorId: doctor.id },
    });

    return this.getDoctorQueue(doctor.id);
  }
}
