export type UserRole = 'patient' | 'doctor' | 'community_worker' | 'pharmacy';

export type MedicineForm = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'drops' | 'inhaler' | 'ointment';

export type MealTiming = 'before_food' | 'after_food' | 'with_food' | 'empty_stomach';

export type LanguageCode =
  | 'en' // English
  | 'ta' // Tamil
  | 'hi' // Hindi
  | 'te' // Telugu
  | 'ml' // Malayalam
  | 'kn' // Kannada
  | 'bn' // Bengali
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'pa' // Punjabi
  | 'ur' // Urdu
  | 'fr' // French
  | 'es' // Spanish
  | 'de' // German
  | 'ar' // Arabic
  | 'zh' // Chinese
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'pt' // Portuguese
  | 'ru'; // Russian

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  dir?: 'ltr' | 'rtl';
  speechCode: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  avatar?: string;
  patientId: string; // e.g. CRV-2026-8942
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  allergies?: string[];
  language: LanguageCode;
  easyMode: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
}

export interface MedicineScheduleItem {
  id: string;
  name: string;
  dosage: string; // e.g. 500 mg
  form: MedicineForm;
  quantity: number; // e.g. 1
  times: string[]; // e.g. ["08:00", "14:00", "20:00"]
  mealTiming: MealTiming;
  startDate: string;
  endDate: string;
  durationDays: number;
  totalTablets: number;
  remainingTablets: number;
  reminderSound: 'gentle-chime' | 'pulse-beep' | 'zen-bell' | 'marimba';
  reminderLanguage: LanguageCode;
  status: 'active' | 'completed' | 'paused';
  instructions: string;
  prescribedBy?: string;
  doctorPrescriptionId?: string;
  history: {
    id: string;
    date: string;
    time: string;
    status: 'taken' | 'snoozed' | 'missed';
    timestamp: string;
  }[];
}

export interface DoctorPrescription {
  id: string;
  prescriptionNumber: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorLicense?: string;
  hospitalName: string;
  hospitalAddress?: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  date: string;
  diagnosis: string;
  vitals?: {
    bp: string;
    pulse: string;
    temperature: string;
    weight: string;
  };
  medicines: {
    id: string;
    name: string;
    dosage: string;
    form: MedicineForm;
    frequency: string; // e.g. Morning - Afternoon - Night (1-1-1)
    times: string[];
    mealTiming: MealTiming;
    duration: string; // e.g. 5 days
    instructions: string;
  }[];
  items?: {
    id: string;
    name: string;
    dosage: string;
    form: MedicineForm;
    frequency: string;
    times: string[];
    mealTiming: MealTiming;
    duration: string;
    instructions: string;
  }[];
  followUpDate: string;
  notes: string;
  status: 'active' | 'dispensed' | 'completed';
  pharmacyStatus?: 'pending' | 'ready' | 'dispensed';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  department: string;
  date: string;
  time: string;
  opNumber: number;
  currentOpNumber: number;
  estimatedWaitMinutes: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
  aiCallStatus: 'scheduled' | 'completed' | 'missed';
  aiCallScheduledTime?: string;
  notes?: string;
  fee: number;
}

export interface EHRRecord {
  id: string;
  patientId: string;
  title: string;
  type: 'prescription' | 'xray' | 'scan' | 'blood_report' | 'lab_report' | 'certificate' | 'diagnosis' | 'consultation' | 'discharge_summary';
  date: string;
  doctorName: string;
  hospitalName: string;
  department: string;
  summary: string;
  fileSize?: string;
  tags: string[];
  findings?: string[];
  values?: { label: string; value: string; unit?: string; status?: 'normal' | 'high' | 'low' }[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Spouse' | 'Child' | 'Guardian';
  phone: string;
  avatar?: string;
  status: 'pending' | 'active' | 'rejected';
  permissions: {
    viewPrescriptions: boolean;
    viewLabReports: boolean;
    receiveAlerts: boolean;
    emergencyContact: boolean;
  };
  requestedDate: string;
  approvedDate?: string;
}

export type NotificationType =
  | 'medicine_reminder'
  | 'appointment_reminder'
  | 'ai_call'
  | 'new_prescription'
  | 'hospital_update'
  | 'family_access'
  | 'medicine_refill'
  | 'followup_reminder';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    medicineName?: string;
    dosage?: string;
    time?: string;
    appointmentId?: string;
    prescriptionId?: string;
    familyMemberName?: string;
    refillDaysLeft?: number;
  };
}

export interface Hospital {
  id: string;
  name: string;
  distance: string;
  address: string;
  departments: string[];
  doctorsAvailable: number;
  isOpen: boolean;
  phone: string;
  rating: number;
  reviewsCount: number;
  lat: number;
  lng: number;
  image: string;
  emergencyAvailable: boolean;
  waitTimeMins: number;
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  doctorName: string;
  department: string;
  rating: number;
  comment: string;
  date: string;
  patientAlias: string;
  verifiedVisit: boolean;
}

export interface CommunityPatient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  villageOrZone: string;
  village?: string;
  adherenceRate: number; // e.g. 92%
  missedMedicines: number;
  nextAppointmentDate: string;
  nextVisitDate?: string;
  priority: 'high' | 'medium' | 'low';
  conditions: string[];
  chronicCondition?: string;
  activeMedicines?: string[];
  activePrescriptionsCount: number;
  lastContact: string;
  notes: string;
}

export interface PharmacyOrder {
  id: string;
  prescriptionId: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  medicines: {
    name: string;
    dosage: string;
    quantity: number;
    days: number;
    inStock: boolean;
  }[];
  status: 'new' | 'pending' | 'ready' | 'dispensed';
  refillReminderTriggered: boolean;
  notes?: string;
}
