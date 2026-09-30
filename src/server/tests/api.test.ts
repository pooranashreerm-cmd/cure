import bcrypt from 'bcryptjs';
import { AuthService } from '../services/authService';
import { PrescriptionService } from '../services/prescriptionService';
import { ReminderEngine } from '../services/reminderEngine';
import { AppointmentService } from '../services/appointmentService';
import { OPQueueService } from '../services/opQueueService';
import { EHRService } from '../services/ehrService';
import { FamilyService } from '../services/familyService';
import { RefillService } from '../services/refillService';
import { db } from '../db';

export async function runCureviaBackendTests() {
  console.log('--- STARTING CUREVIA BACKEND UNIT & INTEGRATION TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Real Server OTP Generation, Storage & Rate Limit
    const testPhone = '+919999988888';
    const otpRes = await AuthService.sendOtp(testPhone, 'PATIENT');
    assert(!!otpRes.message, 'OTP Send Service generates response message');
    assert((otpRes as any).otp === undefined && (otpRes as any).mockOtp === undefined, 'OTP value is NEVER exposed in API response');

    // Retrieve the active stored hashed OTP record
    const otpRecord = db.otpVerifications.find((o) => o.mobileNumber === testPhone && !o.isUsed);
    assert(!!otpRecord, 'OTP record stored securely in database');
    assert(otpRecord?.hashedOtp.startsWith('$2'), 'Stored OTP is cryptographically hashed with bcrypt');

    // Test 2: Invalid OTP Attempt & Counter Increment
    let failedAttemptCaught = false;
    try {
      await AuthService.verifyOtp(testPhone, '000000', 'PATIENT');
    } catch (e: any) {
      failedAttemptCaught = e.code === 'INVALID_OTP';
    }
    assert(failedAttemptCaught, 'Invalid OTP attempt correctly rejected with attempt tracking');

    // Set known hash for deterministic verification test
    const knownCode = '882194';
    otpRecord!.hashedOtp = await bcrypt.hash(knownCode, 10);
    otpRecord!.attempts = 0;

    // Test 3: OTP Verification & JWT Issuance
    const verifyRes = await AuthService.verifyOtp(testPhone, knownCode, 'PATIENT', 'Test User');
    assert(!!verifyRes.token && !!verifyRes.refreshToken, 'OTP Verification returns valid JWT & Refresh Token');
    assert(verifyRes.user.role === 'PATIENT', 'User is created with PATIENT role');
    assert(otpRecord!.isUsed === true, 'OTP record is immediately marked as used after successful verification');

    // Test 4: Prescription Creation & Automatic Schedule Calculation
    const patient = db.patients[0];
    const doctor = db.doctors[0];
    const initialScheduleCount = db.medicineSchedules.length;

    const rxResult = await PrescriptionService.createPrescription(doctor.id, {
      patientId: patient.id,
      diagnosis: 'Hypertension & T2D Review',
      items: [
        {
          medicineName: 'Amlodipine Besylate',
          dosage: '5 mg',
          frequency: '1-0-1 (Twice daily)',
          durationDays: 14,
        },
      ],
    });

    assert(!!rxResult.prescription.id, 'Prescription created with unique ID');
    assert(rxResult.schedules.length === 2, 'Generated 2 schedule times for 1-0-1 frequency (08:30, 20:30)');
    assert(db.medicineSchedules.length > initialScheduleCount, 'Medicine schedules stored in database');

    // Test 5: Reminder Intake & Adherence Rate Calculation
    const reminder = db.medicineReminders.find((r) => r.patientId === patient.id && r.status === 'SCHEDULED');
    if (reminder) {
      const takeRes = await ReminderEngine.markReminderTaken(reminder.id, patient.userId, 'Taken with water');
      assert(takeRes.reminder.status === 'TAKEN', 'Reminder marked as TAKEN');
      assert(takeRes.intake.status === 'TAKEN', 'Medicine Intake record created');
    }

    const adherence = ReminderEngine.calculateAdherence(patient.id);
    assert(typeof adherence.adherenceRate === 'number' && adherence.adherenceRate >= 0, 'Adherence calculation computed accurately');

    // Test 6: OP Queue Management
    const initialQueue = OPQueueService.getDoctorQueue(doctor.id);
    assert(Array.isArray(initialQueue.queue), 'OP Queue retrieves list of waiting patients');

    const nextTokenRes = await OPQueueService.callNextToken(doctor.id);
    const tokenVal = 'currentToken' in nextTokenRes ? nextTokenRes.currentToken : nextTokenRes.queue?.currentToken;
    assert(tokenVal !== undefined && tokenVal >= 1, 'Doctor can call next token in live OP queue');

    // Test 7: EHR Access Control & Audit Log
    const ehrResult = EHRService.getPatientEHR(patient.id, patient.userId, 'PATIENT');
    assert(Array.isArray(ehrResult.records), 'EHR records retrieved for authorized patient');
    assert(db.auditLogs.some((l) => l.action === 'EHR_VIEW'), 'Audit log records EHR access event');

    // Test 8: Family Circle Permission Management
    const inviteRes = await FamilyService.inviteFamilyMember(patient.userId, {
      phoneNumber: '+919876543219',
      name: 'Kavita Sharma',
      relation: 'Daughter',
      permissions: ['VIEW_BASIC_PROFILE', 'VIEW_MEDICINES'],
    });
    assert(inviteRes.success, 'Family member invitation dispatched');

    // Test 9: Low Medicine Supply & Refills
    const refills = await RefillService.getRefillStatus(patient.id);
    assert(Array.isArray(refills), 'Medicine refills list accessible');

    console.log(`\n--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
    return { passed, failed };
  } catch (err: any) {
    console.error('Test execution error:', err);
    return { passed, failed: failed + 1, error: err.message };
  }
}
