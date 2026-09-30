// Comprehensive Database Seed Script for Curevia
// Populates 35 models with production-grade healthcare data

import { db } from '../src/server/db';

export async function runSeed() {
  console.log('🌱 Starting Curevia Database Seed...');

  // Reset database
  db.seed();

  // Extend db with 5 patients, 3 doctors, 2 CHWs, 2 pharmacies, 3 hospitals, departments, 10+ medicines, etc.
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

  // Add extra users and patients
  for (const ep of extraPatients) {
    db.users.push({
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

    db.patients.push({
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

  // Extra Doctors
  const doc2 = {
    id: 'doc-2',
    doctorId: 'DOC-ENDO-204',
    userId: 'usr-doctor-2',
    name: 'Dr. Vignesh Karthik',
    specialization: 'Endocrinology & Diabetology',
    qualification: 'MD, DM (Endocrinology)',
    hospitalId: 'hosp-apollo-1',
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

  db.users.push(
    {
      id: doc2.userId,
      role: 'DOCTOR',
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
      role: 'DOCTOR',
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
  db.doctors.push(doc2, doc3);

  // Extra Community Worker
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
  db.users.push({
    id: chw2.userId,
    role: 'COMMUNITY_WORKER',
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
  db.communityWorkers.push(chw2);

  // Extra Pharmacy
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
  db.users.push({
    id: pharm2.userId,
    role: 'PHARMACY',
    mobileNumber: '+919876500007',
    email: 'janaushadhi.ramnad@gov.in',
    name: pharm2.pharmacyName,
    preferredLanguage: 'ta',
    timezone: 'Asia/Kolkata',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  db.pharmacies.push(pharm2);

  // 3rd Hospital
  db.hospitals.push({
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

  // Extra Medicines to total 12
  db.medicines.push(
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

  console.log(`✅ Seeded ${db.users.length} Users, ${db.patients.length} Patients, ${db.doctors.length} Doctors, ${db.communityWorkers.length} CHWs, ${db.pharmacies.length} Pharmacies, ${db.hospitals.length} Hospitals, and ${db.medicines.length} Medicines.`);
}

// Auto-execute if run directly
if (typeof require !== 'undefined' && require.main === module) {
  runSeed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
