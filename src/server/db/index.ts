import { UserRole, ReminderStatus, AppointmentStatus, QueueStatus, NotificationType, CallStatus, AccessStatus, EHRRecordType } from '../types';

// In-Memory Database Store with full transactional integrity & Prisma model parity
class DatabaseStore {
  public users: any[] = [];
  public patients: any[] = [];
  public doctors: any[] = [];
  public communityWorkers: any[] = [];
  public pharmacies: any[] = [];
  public hospitals: any[] = [];
  public departments: any[] = [];
  public medicines: any[] = [];
  public prescriptions: any[] = [];
  public prescriptionItems: any[] = [];
  public medicineSchedules: any[] = [];
  public medicineReminders: any[] = [];
  public medicineIntakes: any[] = [];
  public ehrRecords: any[] = [];
  public ehrDocuments: any[] = [];
  public appointments: any[] = [];
  public opQueues: any[] = [];
  public doctorAvailabilities: any[] = [];
  public voiceCallReminders: any[] = [];
  public medicineRefills: any[] = [];
  public familyGroups: any[] = [];
  public familyMembers: any[] = [];
  public familyAccessRequests: any[] = [];
  public notifications: any[] = [];
  public notificationPreferences: any[] = [];
  public feedbacks: any[] = [];
  public auditLogs: any[] = [];
  public otpVerifications: any[] = [];

  constructor() {
    this.seed();
  }

  public seed() {
    // 1. Seed Users
    const patientUser = {
      id: 'usr-patient-1',
      role: 'PATIENT' as UserRole,
      mobileNumber: '+919876543210',
      email: 'priya.sharma@example.com',
      name: 'Priya Sharma',
      dateOfBirth: '1978-04-12',
      gender: 'FEMALE',
      preferredLanguage: 'en',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      timezone: 'Asia/Kolkata',
      accessibilityMode: false,
      easyMode: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const doctorUser = {
      id: 'usr-doctor-1',
      role: 'DOCTOR' as UserRole,
      mobileNumber: '+919876500001',
      email: 'dr.ananya@apollocity.com',
      name: 'Dr. Ananya Mukherjee',
      dateOfBirth: '1984-08-22',
      gender: 'FEMALE',
      preferredLanguage: 'en',
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      timezone: 'Asia/Kolkata',
      accessibilityMode: false,
      easyMode: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const chwUser = {
      id: 'usr-chw-1',
      role: 'COMMUNITY_WORKER' as UserRole,
      mobileNumber: '+919876500002',
      email: 'rajesh.chw@nhm.gov.in',
      name: 'Rajesh Kumar',
      dateOfBirth: '1990-03-15',
      gender: 'MALE',
      preferredLanguage: 'en',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      timezone: 'Asia/Kolkata',
      accessibilityMode: false,
      easyMode: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const pharmacyUser = {
      id: 'usr-pharmacy-1',
      role: 'PHARMACY' as UserRole,
      mobileNumber: '+919876500003',
      email: 'dispensary@apexcare.com',
      name: 'Apex Care Dispensary',
      preferredLanguage: 'en',
      timezone: 'Asia/Kolkata',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users = [patientUser, doctorUser, chwUser, pharmacyUser];

    // 2. Hospital & Department
    const hospital = {
      id: 'hosp-apollo-1',
      name: 'Apollo City Hospital & Care Center',
      address: '42 Healthway Boulevard, Sector 5, City Center',
      city: 'Ramanathapuram',
      state: 'Tamil Nadu',
      postalCode: '623501',
      latitude: 9.3639,
      longitude: 78.8395,
      phone: '+91 44 2829 0200',
      emergency: '108 / +91 44 2829 3333',
      rating: 4.8,
      isOpen24x7: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.hospitals = [
      hospital,
      {
        id: 'hosp-gov-2',
        name: 'District Government Headquarter Hospital',
        address: 'Collectorate Road, Kenikarai',
        city: 'Ramanathapuram',
        state: 'Tamil Nadu',
        postalCode: '623504',
        latitude: 9.3712,
        longitude: 78.8311,
        phone: '+91 4567 220202',
        emergency: '108',
        rating: 4.5,
        isOpen24x7: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.departments = [
      { id: 'dept-cardio', name: 'Cardiology & Internal Medicine', hospitalId: hospital.id },
      { id: 'dept-endo', name: 'Endocrinology & Diabetology', hospitalId: hospital.id },
      { id: 'dept-gen', name: 'General Medicine & Geriatrics', hospitalId: hospital.id },
    ];

    // 3. Profiles
    const patientProfile = {
      id: 'pat-1',
      patientId: 'CRV-2026-8942',
      userId: patientUser.id,
      medicalRecordNumber: 'MRN-882190',
      emergencyContact: '+91 94432 11988 (Son - Rahul Sharma)',
      bloodGroup: 'B+',
      chronicConditions: ['Type 2 Diabetes', 'Mild Hypertension'],
      allergies: ['Penicillin', 'Sulfa Drugs'],
      voiceAssistance: true,
      easyMode: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const doctorProfile = {
      id: 'doc-1',
      doctorId: 'DOC-CARD-102',
      userId: doctorUser.id,
      name: 'Dr. Ananya Mukherjee',
      specialization: 'Cardiology & Internal Medicine',
      qualification: 'MD, DM (Cardiology), FACC',
      hospitalId: hospital.id,
      departmentId: 'dept-cardio',
      experienceYears: 14,
      consultationFee: 650.0,
      rating: 4.9,
      reviewCount: 128,
      isVerified: true,
      medicalCouncilRegNo: 'MCI-2018-94124',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const chwProfile = {
      id: 'chw-1',
      workerId: 'CHW-TN-402',
      userId: chwUser.id,
      name: 'Rajesh Kumar',
      assignedArea: 'Sector 4 & Keelakarai Block',
      assignedVillage: 'Ramanathapuram Rural',
      organization: 'National Health Mission / Community Health Care',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const pharmacyProfile = {
      id: 'pharm-1',
      pharmacyId: 'PHARM-TN-842',
      userId: pharmacyUser.id,
      pharmacyName: 'Apex Care Pharmacy & Surgical Dispensary',
      address: 'Shop 12, Apollo Hospital Complex, Sector 5',
      contactNumber: '+91 98410 99881',
      licenseNumber: 'TN-PH-84210',
      associatedHospital: hospital.name,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.patients = [patientProfile];
    this.doctors = [doctorProfile];
    this.communityWorkers = [chwProfile];
    this.pharmacies = [pharmacyProfile];

    // 4. Medicines
    this.medicines = [
      {
        id: 'med-1',
        medicineName: 'Metformin Hydrochloride',
        genericName: 'Metformin HCl',
        dosageForm: 'tablet',
        strength: '500 mg',
        description: 'First-line medication for the treatment of type 2 diabetes.',
        isActive: true,
      },
      {
        id: 'med-2',
        medicineName: 'Telmisartan',
        genericName: 'Telmisartan',
        dosageForm: 'tablet',
        strength: '40 mg',
        description: 'Angiotensin II receptor antagonist used to manage high blood pressure.',
        isActive: true,
      },
      {
        id: 'med-3',
        medicineName: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        dosageForm: 'tablet',
        strength: '10 mg',
        description: 'Statin medication used to prevent cardiovascular disease and lower cholesterol.',
        isActive: true,
      },
      {
        id: 'med-4',
        medicineName: 'Vitamin D3 & Calcium',
        genericName: 'Cholecalciferol + Calcium Citrate',
        dosageForm: 'tablet',
        strength: '60000 IU / 500 mg',
        description: 'Bone density and general metabolic support supplement.',
        isActive: true,
      },
    ];

    // 5. Prescriptions
    const prescription1 = {
      id: 'rx-1',
      prescriptionNumber: 'RX-2026-00891',
      patientId: patientProfile.id,
      doctorId: doctorProfile.id,
      pharmacyId: pharmacyProfile.id,
      diagnosis: 'Type 2 Diabetes Mellitus & Mild Essential Hypertension',
      instructions: 'Take medications strictly on time. Avoid excess sodium and sugary foods.',
      startDate: new Date().toISOString().split('T')[0],
      followUpDate: '2026-09-15',
      status: 'ACTIVE',
      pharmacyStatus: 'PREPARING',
      vitals: {
        bloodPressure: '128/82 mmHg',
        pulse: '74 bpm',
        temperature: '98.4 F',
        weight: '64 kg',
        spo2: '99%',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.prescriptions = [prescription1];

    // 6. Prescription Items & Medicine Schedules
    const item1 = {
      id: 'rx-item-1',
      prescriptionId: prescription1.id,
      medicineName: 'Metformin Hydrochloride',
      dosage: '500 mg',
      dosageForm: 'tablet',
      frequency: '1-0-1 (Twice daily)',
      times: ['08:30', '20:30'],
      mealTiming: 'after_food',
      quantity: 60,
      durationDays: 30,
      specialInstructions: 'Take with half glass water immediately after breakfast and dinner.',
      createdAt: new Date().toISOString(),
    };

    const item2 = {
      id: 'rx-item-2',
      prescriptionId: prescription1.id,
      medicineName: 'Telmisartan',
      dosage: '40 mg',
      dosageForm: 'tablet',
      frequency: '1-0-0 (Once daily morning)',
      times: ['08:30'],
      mealTiming: 'after_food',
      quantity: 30,
      durationDays: 30,
      specialInstructions: 'Take every morning after breakfast to maintain stable blood pressure.',
      createdAt: new Date().toISOString(),
    };

    const item3 = {
      id: 'rx-item-3',
      prescriptionId: prescription1.id,
      medicineName: 'Atorvastatin',
      dosage: '10 mg',
      dosageForm: 'tablet',
      frequency: '0-0-1 (Once daily at bedtime)',
      times: ['21:30'],
      mealTiming: 'after_food',
      quantity: 30,
      durationDays: 30,
      specialInstructions: 'Take 1 tablet before sleeping.',
      createdAt: new Date().toISOString(),
    };

    this.prescriptionItems = [item1, item2, item3];

    // Schedules
    const todayStr = new Date().toISOString().split('T')[0];
    const schedule1 = {
      id: 'sch-1',
      patientId: patientProfile.id,
      prescriptionId: prescription1.id,
      prescriptionItemId: item1.id,
      medicineName: 'Metformin Hydrochloride',
      dosage: '500 mg',
      dosageForm: 'tablet',
      mealTiming: 'after_food',
      scheduledTime: '08:30',
      startDate: todayStr,
      endDate: '2026-09-30',
      isActive: true,
      totalPrescribedDoses: 60,
      remainingDoses: 52,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const schedule2 = {
      id: 'sch-2',
      patientId: patientProfile.id,
      prescriptionId: prescription1.id,
      prescriptionItemId: item2.id,
      medicineName: 'Telmisartan',
      dosage: '40 mg',
      dosageForm: 'tablet',
      mealTiming: 'after_food',
      scheduledTime: '08:30',
      startDate: todayStr,
      endDate: '2026-09-30',
      isActive: true,
      totalPrescribedDoses: 30,
      remainingDoses: 26,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const schedule3 = {
      id: 'sch-3',
      patientId: patientProfile.id,
      prescriptionId: prescription1.id,
      prescriptionItemId: item3.id,
      medicineName: 'Atorvastatin',
      dosage: '10 mg',
      dosageForm: 'tablet',
      mealTiming: 'after_food',
      scheduledTime: '21:30',
      startDate: todayStr,
      endDate: '2026-09-30',
      isActive: true,
      totalPrescribedDoses: 30,
      remainingDoses: 28,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.medicineSchedules = [schedule1, schedule2, schedule3];

    // Today's Reminders
    this.medicineReminders = [
      {
        id: 'rem-1',
        patientId: patientProfile.id,
        scheduleId: schedule1.id,
        scheduledDate: todayStr,
        scheduledTime: '08:30',
        scheduledAt: `${todayStr}T08:30:00Z`,
        status: 'TAKEN' as ReminderStatus,
        notified5Min: true,
        notified2Min: true,
        notifiedExact: true,
        voicePlayed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rem-2',
        patientId: patientProfile.id,
        scheduleId: schedule2.id,
        scheduledDate: todayStr,
        scheduledTime: '08:30',
        scheduledAt: `${todayStr}T08:30:00Z`,
        status: 'TAKEN' as ReminderStatus,
        notified5Min: true,
        notified2Min: true,
        notifiedExact: true,
        voicePlayed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rem-3',
        patientId: patientProfile.id,
        scheduleId: schedule1.id,
        scheduledDate: todayStr,
        scheduledTime: '20:30',
        scheduledAt: `${todayStr}T20:30:00Z`,
        status: 'SCHEDULED' as ReminderStatus,
        notified5Min: false,
        notified2Min: false,
        notifiedExact: false,
        voicePlayed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rem-4',
        patientId: patientProfile.id,
        scheduleId: schedule3.id,
        scheduledDate: todayStr,
        scheduledTime: '21:30',
        scheduledAt: `${todayStr}T21:30:00Z`,
        status: 'SCHEDULED' as ReminderStatus,
        notified5Min: false,
        notified2Min: false,
        notifiedExact: false,
        voicePlayed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Intakes
    this.medicineIntakes = [
      {
        id: 'int-1',
        patientId: patientProfile.id,
        scheduleId: schedule1.id,
        medicineReminderId: 'rem-1',
        scheduledAt: `${todayStr}T08:30:00Z`,
        takenAt: new Date().toISOString(),
        status: 'TAKEN',
        notes: 'Taken with warm milk after breakfast',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'int-2',
        patientId: patientProfile.id,
        scheduleId: schedule2.id,
        medicineReminderId: 'rem-2',
        scheduledAt: `${todayStr}T08:30:00Z`,
        takenAt: new Date().toISOString(),
        status: 'TAKEN',
        notes: 'Taken with water',
        createdAt: new Date().toISOString(),
      },
    ];

    // 7. EHR Records
    this.ehrRecords = [
      {
        id: 'ehr-1',
        patientId: patientProfile.id,
        createdById: doctorProfile.id,
        prescriptionId: prescription1.id,
        type: 'PRESCRIPTION' as EHRRecordType,
        title: 'Clinical Consultation & Prescription',
        summary: 'Diagnosis: Type 2 Diabetes Mellitus & Mild Hypertension. Prescribed Metformin 500mg, Telmisartan 40mg, Atorvastatin 10mg.',
        doctorName: 'Dr. Ananya Mukherjee',
        hospitalName: 'Apollo City Hospital & Care Center',
        date: new Date().toISOString().split('T')[0],
        metadata: {
          vitals: prescription1.vitals,
          prescriptionNumber: prescription1.prescriptionNumber,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ehr-2',
        patientId: patientProfile.id,
        createdById: doctorProfile.id,
        type: 'LAB_REPORT' as EHRRecordType,
        title: 'Comprehensive Metabolic Panel & HbA1c Report',
        summary: 'Fasting Blood Glucose: 132 mg/dL, HbA1c: 6.8% (Good control), Serum Creatinine: 0.9 mg/dL (Normal).',
        doctorName: 'Dr. Ananya Mukherjee',
        hospitalName: 'Apollo Diagnostics Laboratory',
        date: '2026-08-10',
        metadata: {
          testCategory: 'Biochemistry',
          labTechnician: 'K. Senthil, MLT',
          values: [
            { test: 'HbA1c Glycated Hemoglobin', value: '6.8%', refRange: '< 5.7%' },
            { test: 'Fasting Plasma Glucose', value: '132 mg/dL', refRange: '70 - 100 mg/dL' },
            { test: 'Total Cholesterol', value: '184 mg/dL', refRange: '< 200 mg/dL' },
            { test: 'LDL Cholesterol', value: '108 mg/dL', refRange: '< 100 mg/dL' },
            { test: 'Serum Creatinine', value: '0.9 mg/dL', refRange: '0.6 - 1.2 mg/dL' },
          ],
        },
        createdAt: '2026-08-10T10:30:00Z',
        updatedAt: '2026-08-10T10:30:00Z',
      },
    ];

    // 8. Appointments & Live OP Queues
    const apt1 = {
      id: 'apt-1',
      appointmentRef: 'APT-2026-8942',
      patientId: patientProfile.id,
      doctorId: doctorProfile.id,
      hospitalId: hospital.id,
      department: 'Cardiology & Internal Medicine',
      appointmentDate: todayStr,
      appointmentTime: '11:15 AM',
      status: 'CONFIRMED' as AppointmentStatus,
      type: 'In-Person Consultation',
      opNumber: 24,
      reason: 'Routine quarterly diabetes & blood pressure check-up',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.appointments = [apt1];

    this.opQueues = [
      {
        id: 'op-1',
        appointmentId: apt1.id,
        hospitalId: hospital.id,
        doctorId: doctorProfile.id,
        patientId: patientProfile.id,
        tokenNumber: 24,
        currentToken: 18,
        status: 'WAITING' as QueueStatus,
        estimatedWaitMinutes: 18,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 9. AI Voice Call Reminder
    this.voiceCallReminders = [
      {
        id: 'vcr-1',
        appointmentId: apt1.id,
        patientId: patientProfile.id,
        scheduledAt: `${todayStr}T09:00:00Z`,
        language: 'en',
        callStatus: 'COMPLETED' as CallStatus,
        providerCallId: 'CALL-SIM-98421',
        transcript: 'Hello Priya Sharma. This is Curevia AI Assistant calling on behalf of Apollo City Hospital. Your scheduled consultation with Dr. Ananya Mukherjee is today at 11:15 AM (Token #24). Please remember to bring your fasting glucose log.',
        audioUrl: '/audio/reminder-call-1.mp3',
        attemptedAt: `${todayStr}T09:00:05Z`,
        completedAt: `${todayStr}T09:01:12Z`,
        createdAt: new Date().toISOString(),
      },
    ];

    // 10. Medicine Refills
    this.medicineRefills = [
      {
        id: 'refill-1',
        patientId: patientProfile.id,
        prescriptionId: prescription1.id,
        pharmacyId: pharmacyProfile.id,
        medicineName: 'Metformin Hydrochloride (500mg)',
        prescribedQty: 60,
        dispensedQty: 60,
        remainingQty: 6, // Low supply trigger!
        estimatedFinishDate: '2026-08-23',
        isAlertSent: true,
        status: 'NEEDS_REFILL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 11. Family Access
    const famGroup = {
      id: 'fg-1',
      name: 'Sharma Family Health Circle',
      primaryUserId: patientUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.familyGroups = [famGroup];

    this.familyMembers = [
      {
        id: 'fm-1',
        familyGroupId: famGroup.id,
        patientId: patientProfile.id,
        name: 'Rahul Sharma',
        relation: 'Son',
        phoneNumber: '+91 94432 11988',
        permissions: ['VIEW_BASIC_PROFILE', 'VIEW_PRESCRIPTIONS', 'VIEW_APPOINTMENTS', 'VIEW_MEDICINES'],
        status: 'ACCEPTED' as AccessStatus,
        grantedAt: new Date().toISOString(),
      },
      {
        id: 'fm-2',
        familyGroupId: famGroup.id,
        patientId: patientProfile.id,
        name: 'Dr. Arvind Sharma',
        relation: 'Brother',
        phoneNumber: '+91 98840 22331',
        permissions: ['VIEW_BASIC_PROFILE', 'VIEW_MEDICAL_RECORDS', 'VIEW_PRESCRIPTIONS'],
        status: 'PENDING' as AccessStatus,
        grantedAt: new Date().toISOString(),
      },
    ];

    // 12. Notifications
    this.notifications = [
      {
        id: 'notif-1',
        userId: patientUser.id,
        type: 'MEDICINE_DUE' as NotificationType,
        title: 'Morning Medicine Due (08:30 AM)',
        message: 'Please take Metformin (500mg) and Telmisartan (40mg) after your breakfast.',
        language: 'en',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        userId: patientUser.id,
        type: 'OP_QUEUE_UPDATE' as NotificationType,
        title: 'OP Consultation Alert (Token #24)',
        message: 'Doctor is currently consulting Token #18. Estimated wait time is 18 minutes.',
        language: 'en',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-3',
        userId: patientUser.id,
        type: 'MEDICINE_REFILL' as NotificationType,
        title: 'Medicine Refill Reminder (3 Days Remaining)',
        message: 'Your supply of Metformin Hydrochloride has 6 doses remaining. Click to request a refill from Apex Care Pharmacy.',
        language: 'en',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];

    // 13. Audit Log
    this.auditLogs = [
      {
        id: 'log-1',
        userId: patientUser.id,
        actorRole: 'PATIENT',
        action: 'LOGIN',
        resource: 'User',
        resourceId: patientUser.id,
        ipAddress: '127.0.0.1',
        metadata: { method: 'OTP_VERIFICATION' },
        timestamp: new Date().toISOString(),
      },
      {
        id: 'log-2',
        userId: doctorUser.id,
        actorRole: 'DOCTOR',
        action: 'PRESCRIPTION_CREATE',
        resource: 'Prescription',
        resourceId: prescription1.id,
        ipAddress: '127.0.0.1',
        metadata: { patientId: patientProfile.id, prescriptionNumber: prescription1.prescriptionNumber },
        timestamp: new Date().toISOString(),
      },
    ];

    // 14. Additional Patients, Doctors, CHWs, Pharmacies & Hospitals for Comprehensive Dataset
    const extraPatients = [
      {
        id: 'pat-2',
        patientId: 'CRV-2026-9012',
        userId: 'usr-patient-2',
        medicalRecordNumber: 'MRN-882191',
        name: 'Arumugam Pillai',
        mobileNumber: '+919876543211',
        email: 'arumugam.pillai@example.com',
        dateOfBirth: '1958-11-20',
        gender: 'MALE',
        bloodGroup: 'O+',
        emergencyContact: '+91 94432 22110 (Daughter - Valli)',
        chronicConditions: ['Hypertension', 'Osteoarthritis'],
        allergies: ['Aspirin'],
        preferredLanguage: 'ta',
        voiceAssistance: true,
        easyMode: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pat-3',
        patientId: 'CRV-2026-9013',
        userId: 'usr-patient-3',
        medicalRecordNumber: 'MRN-882192',
        name: 'Lakshmi Narayanan',
        mobileNumber: '+919876543212',
        email: 'lakshmi.n@example.com',
        dateOfBirth: '1965-06-15',
        gender: 'FEMALE',
        bloodGroup: 'A+',
        emergencyContact: '+91 98410 33445 (Husband - Narayanan)',
        chronicConditions: ['Type 2 Diabetes', 'Hypothyroidism'],
        allergies: [],
        preferredLanguage: 'en',
        voiceAssistance: true,
        easyMode: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pat-4',
        patientId: 'CRV-2026-9014',
        userId: 'usr-patient-4',
        medicalRecordNumber: 'MRN-882193',
        name: 'Rajeshwari Sundaram',
        mobileNumber: '+919876543213',
        email: 'rajeshwari.s@example.com',
        dateOfBirth: '1982-03-08',
        gender: 'FEMALE',
        bloodGroup: 'AB+',
        emergencyContact: '+91 97890 55667 (Sister - Revathi)',
        chronicConditions: ['Asthma'],
        allergies: ['Dust', 'Pollen'],
        preferredLanguage: 'ta',
        voiceAssistance: false,
        easyMode: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pat-5',
        patientId: 'CRV-2026-9015',
        userId: 'usr-patient-5',
        medicalRecordNumber: 'MRN-882194',
        name: 'Velu Murugan',
        mobileNumber: '+919876543214',
        email: 'velu.murugan@example.com',
        dateOfBirth: '1972-09-25',
        gender: 'MALE',
        bloodGroup: 'B-',
        emergencyContact: '+91 94444 88776 (Wife - Radha)',
        chronicConditions: ['Chronic Kidney Disease Stage 2', 'Hypertension'],
        allergies: ['Ibuprofen'],
        preferredLanguage: 'ta',
        voiceAssistance: true,
        easyMode: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    for (const ep of extraPatients) {
      this.users.push({
        id: ep.userId,
        role: 'PATIENT',
        mobileNumber: ep.mobileNumber,
        email: ep.email,
        name: ep.name,
        dateOfBirth: ep.dateOfBirth,
        gender: ep.gender,
        preferredLanguage: ep.preferredLanguage,
        timezone: 'Asia/Kolkata',
        accessibilityMode: ep.easyMode,
        easyMode: ep.easyMode,
        isActive: true,
        createdAt: ep.createdAt,
        updatedAt: ep.updatedAt,
      });

      this.patients.push({
        id: ep.id,
        patientId: ep.patientId,
        userId: ep.userId,
        medicalRecordNumber: ep.medicalRecordNumber,
        emergencyContact: ep.emergencyContact,
        bloodGroup: ep.bloodGroup,
        chronicConditions: ep.chronicConditions,
        allergies: ep.allergies,
        voiceAssistance: ep.voiceAssistance,
        easyMode: ep.easyMode,
        createdAt: ep.createdAt,
        updatedAt: ep.updatedAt,
      });
    }

    const doc2 = {
      id: 'doc-2',
      doctorId: 'DOC-ENDO-204',
      userId: 'usr-doctor-2',
      name: 'Dr. Vignesh Karthik',
      specialization: 'Endocrinology & Diabetology',
      qualification: 'MD, DM (Endocrinology)',
      hospitalId: hospital.id,
      departmentId: 'dept-endo',
      experienceYears: 11,
      consultationFee: 600.0,
      rating: 4.85,
      reviewCount: 94,
      isVerified: true,
      medicalCouncilRegNo: 'MCI-2019-88122',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const doc3 = {
      id: 'doc-3',
      doctorId: 'DOC-GEN-305',
      userId: 'usr-doctor-3',
      name: 'Dr. Meenakshi Sundaram',
      specialization: 'General Medicine & Geriatrics',
      qualification: 'MD (Gen Med), DNB',
      hospitalId: 'hosp-gov-2',
      departmentId: 'dept-gen',
      experienceYears: 18,
      consultationFee: 400.0,
      rating: 4.95,
      reviewCount: 210,
      isVerified: true,
      medicalCouncilRegNo: 'MCI-2012-44109',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(
      {
        id: doc2.userId,
        role: 'DOCTOR' as UserRole,
        mobileNumber: '+919876500004',
        email: 'dr.vignesh@apollocity.com',
        name: doc2.name,
        dateOfBirth: '1986-04-10',
        gender: 'MALE',
        preferredLanguage: 'en',
        timezone: 'Asia/Kolkata',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: doc3.userId,
        role: 'DOCTOR' as UserRole,
        mobileNumber: '+919876500005',
        email: 'dr.meenakshi@govhealth.in',
        name: doc3.name,
        dateOfBirth: '1976-12-05',
        gender: 'FEMALE',
        preferredLanguage: 'ta',
        timezone: 'Asia/Kolkata',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    this.doctors.push(doc2, doc3);

    const chw2 = {
      id: 'chw-2',
      workerId: 'CHW-TN-403',
      userId: 'usr-chw-2',
      name: 'Selvi Murugesan',
      assignedArea: 'Keelakarai Block & Coastal Zone',
      assignedVillage: 'Keelakarai Rural',
      organization: 'National Health Mission / Community Health Care',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push({
      id: chw2.userId,
      role: 'COMMUNITY_WORKER' as UserRole,
      mobileNumber: '+919876500006',
      email: 'selvi.chw@nhm.gov.in',
      name: chw2.name,
      dateOfBirth: '1992-07-18',
      gender: 'FEMALE',
      preferredLanguage: 'ta',
      timezone: 'Asia/Kolkata',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.communityWorkers.push(chw2);

    const pharm2 = {
      id: 'pharm-2',
      pharmacyId: 'PHARM-TN-843',
      userId: 'usr-pharmacy-2',
      pharmacyName: 'Ramnad Central Jan Aushadhi Pharmacy',
      address: 'Near GH Bus Stand, Collectorate Main Road',
      contactNumber: '+91 94421 88990',
      licenseNumber: 'TN-PH-84211',
      associatedHospital: 'District Government Headquarter Hospital',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push({
      id: pharm2.userId,
      role: 'PHARMACY' as UserRole,
      mobileNumber: '+919876500007',
      email: 'janaushadhi.ramnad@gov.in',
      name: pharm2.pharmacyName,
      preferredLanguage: 'ta',
      timezone: 'Asia/Kolkata',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.pharmacies.push(pharm2);

    this.hospitals.push({
      id: 'hosp-phc-3',
      name: 'Ramanathapuram Community Primary Health Centre (PHC)',
      address: 'East Coast Road, Uchipuli Junction',
      city: 'Ramanathapuram',
      state: 'Tamil Nadu',
      postalCode: '623534',
      latitude: 9.3245,
      longitude: 78.9123,
      phone: '+91 4567 240101',
      emergency: '108',
      rating: 4.6,
      isOpen24x7: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.medicines.push(
      {
        id: 'med-5',
        medicineName: 'Amlodipine Besylate',
        genericName: 'Amlodipine',
        dosageForm: 'tablet',
        strength: '5 mg',
        description: 'Calcium channel blocker for hypertension and angina.',
        isActive: true,
      },
      {
        id: 'med-6',
        medicineName: 'Paracetamol',
        genericName: 'Acetaminophen',
        dosageForm: 'tablet',
        strength: '650 mg',
        description: 'Analgesic and antipyretic medication for fever and mild to moderate pain.',
        isActive: true,
      },
      {
        id: 'med-7',
        medicineName: 'Amoxicillin & Clavulanate Potassium',
        genericName: 'Amoxicillin + Clavulanic Acid',
        dosageForm: 'tablet',
        strength: '625 mg',
        description: 'Broad-spectrum penicillin antibiotic.',
        isActive: true,
      },
      {
        id: 'med-8',
        medicineName: 'Omeprazole Gastro-resistant',
        genericName: 'Omeprazole',
        dosageForm: 'capsule',
        strength: '20 mg',
        description: 'Proton pump inhibitor reducing stomach acid for acid reflux and ulcers.',
        isActive: true,
      },
      {
        id: 'med-9',
        medicineName: 'Glimepiride',
        genericName: 'Glimepiride',
        dosageForm: 'tablet',
        strength: '2 mg',
        description: 'Sulfonylurea antidiabetic medicine for glycemic control.',
        isActive: true,
      },
      {
        id: 'med-10',
        medicineName: 'Losartan Potassium',
        genericName: 'Losartan',
        dosageForm: 'tablet',
        strength: '50 mg',
        description: 'ARB medication used to treat hypertension and diabetic nephropathy.',
        isActive: true,
      },
      {
        id: 'med-11',
        medicineName: 'Metoprolol Succinate',
        genericName: 'Metoprolol Tartrate / Succinate ER',
        dosageForm: 'tablet',
        strength: '25 mg',
        description: 'Beta-1 selective adrenergic receptor blocker.',
        isActive: true,
      },
      {
        id: 'med-12',
        medicineName: 'Levothyroxine Sodium',
        genericName: 'Thyroxine Sodium',
        dosageForm: 'tablet',
        strength: '50 mcg',
        description: 'Synthetic thyroid hormone replacement for hypothyroidism.',
        isActive: true,
      }
    );
  }
}

export const db = new DatabaseStore();
