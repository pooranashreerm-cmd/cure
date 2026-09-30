import { db } from '../db';
import { AppointmentStatus, BookAppointmentRequest } from '../types';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';
import { socketService } from './socketService';

export class AppointmentService {
  public static async bookAppointment(patientUserId: string, payload: BookAppointmentRequest) {
    const patient = db.patients.find((p) => p.userId === patientUserId || p.id === patientUserId);
    if (!patient) throw { statusCode: 404, code: 'PATIENT_NOT_FOUND', message: 'Patient profile not found' };

    const doctor = db.doctors.find((d) => d.id === payload.doctorId);
    if (!doctor) throw { statusCode: 404, code: 'DOCTOR_NOT_FOUND', message: 'Doctor not found' };

    const hospital = db.hospitals.find((h) => h.id === payload.hospitalId) || db.hospitals[0];

    // Determine OP Token Number for the day
    const existingForDay = db.appointments.filter(
      (a) => a.doctorId === doctor.id && a.appointmentDate === payload.appointmentDate
    );
    const opNumber = existingForDay.length + 1;

    const newAppointment = {
      id: `apt-${Date.now()}`,
      appointmentRef: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      doctorId: doctor.id,
      hospitalId: hospital.id,
      department: payload.department || doctor.specialization,
      appointmentDate: payload.appointmentDate,
      appointmentTime: payload.appointmentTime,
      status: 'CONFIRMED' as AppointmentStatus,
      type: 'In-Person Consultation',
      opNumber,
      reason: payload.reason || 'General Medical Consultation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.appointments.unshift(newAppointment);

    // Create OP Queue entry
    const opQueue = {
      id: `op-${Date.now()}`,
      appointmentId: newAppointment.id,
      hospitalId: hospital.id,
      doctorId: doctor.id,
      patientId: patient.id,
      tokenNumber: opNumber,
      currentToken: 1,
      status: 'WAITING',
      estimatedWaitMinutes: (opNumber - 1) * 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.opQueues.unshift(opQueue);

    // Schedule AI Voice Call 1 day prior
    const callDate = new Date(payload.appointmentDate);
    callDate.setDate(callDate.getDate() - 1);
    callDate.setHours(9, 30, 0, 0);

    const user = db.users.find((u) => u.id === patient.userId);
    const voiceReminder = {
      id: `vcr-${Date.now()}`,
      appointmentId: newAppointment.id,
      patientId: patient.id,
      scheduledAt: callDate.toISOString(),
      language: user?.preferredLanguage || 'en',
      callStatus: 'SCHEDULED',
      providerCallId: `CALL-CUREVIA-${Date.now()}`,
      transcript: `Hello ${user?.name || 'Patient'}, this is Curevia AI reminding you of your consultation with ${doctor.name} on ${payload.appointmentDate} at ${payload.appointmentTime} (OP Token #${opNumber}).`,
      createdAt: new Date().toISOString(),
    };
    db.voiceCallReminders.unshift(voiceReminder);

    // Send confirmation notification
    await NotificationService.send({
      userId: patientUserId,
      type: 'SYSTEM_NOTIFICATION',
      translationKey: 'appointment.reminder.today',
      customTitle: 'Appointment Confirmed',
      translationParams: {
        doctorName: doctor.name,
        time: payload.appointmentTime,
        tokenNumber: opNumber,
      },
    });

    // Audit Log
    AuditService.log({
      userId: patientUserId,
      actorRole: 'PATIENT',
      action: 'APPOINTMENT_BOOKED',
      resource: 'Appointment',
      resourceId: newAppointment.id,
      metadata: { doctorId: doctor.id, appointmentDate: payload.appointmentDate, opNumber },
    });

    // Broadcast to doctor queue
    socketService.emitToDoctorQueue(doctor.id, 'op_queue_patient_registered', {
      appointment: newAppointment,
      opQueue,
    });

    return {
      appointment: newAppointment,
      opQueue,
      voiceReminderScheduled: true,
    };
  }

  public static async cancelAppointment(appointmentId: string, userId: string) {
    const apt = db.appointments.find((a) => a.id === appointmentId);
    if (!apt) throw { statusCode: 404, code: 'APPOINTMENT_NOT_FOUND', message: 'Appointment not found' };

    apt.status = 'CANCELLED';
    apt.updatedAt = new Date().toISOString();

    // Cancel related OP queue
    const op = db.opQueues.find((q) => q.appointmentId === apt.id);
    if (op) op.status = 'CANCELLED';

    // Cancel pending voice calls
    db.voiceCallReminders = db.voiceCallReminders.filter((v) => v.appointmentId !== apt.id);

    AuditService.log({
      userId,
      actorRole: 'USER',
      action: 'APPOINTMENT_CANCELLED',
      resource: 'Appointment',
      resourceId: apt.id,
    });

    return { success: true, message: 'Appointment cancelled and reminders cleared.' };
  }
}
