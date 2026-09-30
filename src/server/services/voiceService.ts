import { db } from '../db';
import { CallStatus } from '../types';
import { AuditService } from './auditService';
import { socketService } from './socketService';

export class VoiceService {
  public static async simulateTriggerCall(patientId: string, customMessage?: string) {
    const patient = db.patients.find((p) => p.id === patientId || p.userId === patientId);
    if (!patient) throw { statusCode: 404, code: 'PATIENT_NOT_FOUND', message: 'Patient not found' };

    const user = db.users.find((u) => u.id === patient.userId);
    const activePrescription = db.prescriptions.find((p) => p.patientId === patient.id && p.status === 'ACTIVE');
    const upcomingAppointment = db.appointments.find((a) => a.patientId === patient.id && a.status === 'CONFIRMED');

    let transcript = customMessage;
    if (!transcript) {
      if (upcomingAppointment) {
        const doc = db.doctors.find((d) => d.id === upcomingAppointment.doctorId);
        transcript = `Namaste ${user?.name || 'Patient'}. This is Curevia AI calling from ${doc?.hospitalId ? 'Apollo City Hospital' : 'your medical center'}. Your consultation with ${doc?.name || 'your doctor'} is scheduled for ${upcomingAppointment.appointmentDate} at ${upcomingAppointment.appointmentTime}. Please bring your medication record. Press 1 to confirm.`;
      } else {
        transcript = `Namaste ${user?.name || 'Patient'}. This is Curevia AI Smart Medicine Assistant. Please remember to take your evening medications on time after dinner. Stay hydrated and healthy.`;
      }
    }

    const callRecord = {
      id: `vcr-sim-${Date.now()}`,
      appointmentId: upcomingAppointment ? upcomingAppointment.id : 'rx-routine-call',
      patientId: patient.id,
      scheduledAt: new Date().toISOString(),
      language: user?.preferredLanguage || 'en',
      callStatus: 'COMPLETED' as CallStatus,
      providerCallId: `VOICE-AI-${Date.now()}`,
      transcript,
      attemptedAt: new Date().toISOString(),
      completedAt: new Date(Date.now() + 45000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.voiceCallReminders.unshift(callRecord);

    // Broadcast to UI
    if (user) {
      socketService.emitToUser(user.id, 'incoming_voice_call_event', {
        callId: callRecord.id,
        caller: 'Curevia AI Health Companion',
        transcript: callRecord.transcript,
        language: callRecord.language,
      });
    }

    AuditService.log({
      userId: user?.id,
      actorRole: 'SYSTEM_AI',
      action: 'VOICE_CALL_TRIGGERED',
      resource: 'VoiceCallReminder',
      resourceId: callRecord.id,
      metadata: { language: callRecord.language, patientId: patient.id },
    });

    return {
      success: true,
      call: callRecord,
      message: 'AI Voice call simulated and transcript dispatched.',
    };
  }
}
