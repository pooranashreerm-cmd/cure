export type UserRole = 'PATIENT' | 'DOCTOR' | 'COMMUNITY_WORKER' | 'PHARMACY' | 'ADMIN';

export type ReminderStatus = 'SCHEDULED' | 'NOTIFIED' | 'TAKEN' | 'SKIPPED' | 'SNOOZED' | 'MISSED';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export type QueueStatus = 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';

export type NotificationType =
  | 'MEDICINE_5_MIN'
  | 'MEDICINE_2_MIN'
  | 'MEDICINE_DUE'
  | 'MEDICINE_MISSED'
  | 'APPOINTMENT_10_DAYS'
  | 'APPOINTMENT_5_DAYS'
  | 'APPOINTMENT_1_DAY'
  | 'APPOINTMENT_TODAY'
  | 'AI_CALL'
  | 'NEW_PRESCRIPTION'
  | 'FAMILY_ACCESS_REQUEST'
  | 'FAMILY_ACCESS_ACCEPTED'
  | 'MEDICINE_REFILL'
  | 'OP_QUEUE_UPDATE'
  | 'SYSTEM_NOTIFICATION';

export type CallStatus = 'SCHEDULED' | 'CALLING' | 'COMPLETED' | 'FAILED' | 'MISSED';

export type AccessStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVOKED';

export type EHRRecordType =
  | 'CONSULTATION'
  | 'DIAGNOSIS'
  | 'PRESCRIPTION'
  | 'LAB_REPORT'
  | 'BLOOD_REPORT'
  | 'XRAY'
  | 'SCAN_REPORT'
  | 'MEDICAL_CERTIFICATE'
  | 'DOCTOR_NOTES'
  | 'HOSPITAL_VISIT';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  mobileNumber: string;
  patientId?: string;
  doctorId?: string;
  workerId?: string;
  pharmacyId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface SendOtpRequest {
  mobileNumber: string;
  role?: UserRole;
}

export interface VerifyOtpRequest {
  mobileNumber: string;
  otp: string;
  role?: UserRole;
  name?: string;
}

export interface CreatePrescriptionRequest {
  patientId: string;
  diagnosis: string;
  instructions?: string;
  notes?: string;
  followUpDate?: string;
  vitals?: {
    bloodPressure?: string;
    pulse?: string;
    temperature?: string;
    weight?: string;
    spo2?: string;
  };
  items: Array<{
    medicineName: string;
    dosage: string;
    dosageForm?: string;
    frequency: string;
    times?: string[];
    mealTiming?: 'before_food' | 'after_food' | 'with_food' | 'empty_stomach';
    quantity?: number;
    durationDays?: number;
    specialInstructions?: string;
  }>;
}

export interface BookAppointmentRequest {
  doctorId: string;
  hospitalId: string;
  department: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:30 AM"
  reason?: string;
}

export interface FamilyInvitationRequest {
  phoneNumber: string;
  name: string;
  relation: string;
  permissions: string[];
}
