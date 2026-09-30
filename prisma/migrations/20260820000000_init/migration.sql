-- PostgreSQL Relational Database Schema for Curevia
-- Smart Medicine Reminder & EHR Companion for Community Workers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Enum Types
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'DOCTOR', 'COMMUNITY_WORKER', 'PHARMACY', 'ADMIN');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
CREATE TYPE "ReminderStatus" AS ENUM ('SCHEDULED', 'NOTIFIED', 'TAKEN', 'SNOOZED', 'SKIPPED', 'MISSED', 'CANCELLED');
CREATE TYPE "AppointmentStatus" AS ENUM ('BOOKED', 'CONFIRMED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'MISSED', 'RESCHEDULED');
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED');
CREATE TYPE "NotificationType" AS ENUM (
    'MEDICINE_REMINDER', 'MEDICINE_5_MIN', 'MEDICINE_2_MIN', 'MEDICINE_DUE', 'MEDICINE_MISSED',
    'APPOINTMENT', 'APPOINTMENT_10_DAYS', 'APPOINTMENT_5_DAYS', 'APPOINTMENT_1_DAY', 'APPOINTMENT_TODAY',
    'PRESCRIPTION', 'REFILL', 'FAMILY_ACCESS', 'FAMILY_ACCESS_ACCEPTED', 'OP_QUEUE', 'SYSTEM', 'AI_CALL'
);
CREATE TYPE "CallStatus" AS ENUM ('SCHEDULED', 'CALLING', 'COMPLETED', 'FAILED', 'MISSED', 'CANCELLED');
CREATE TYPE "AccessStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED', 'EXPIRED');
CREATE TYPE "PrescriptionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPENSED');
CREATE TYPE "PharmacyOrderStatus" AS ENUM ('NEW', 'PENDING', 'PREPARING', 'READY', 'DISPENSED', 'CANCELLED');
CREATE TYPE "EHRRecordType" AS ENUM (
    'CONSULTATION', 'PRESCRIPTION', 'DIAGNOSIS', 'LAB_REPORT', 'BLOOD_REPORT',
    'XRAY', 'SCAN', 'MEDICAL_CERTIFICATE', 'FOLLOW_UP', 'DOCTOR_NOTES', 'OTHER'
);

-- 1. Languages Table
CREATE TABLE "languages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(10) NOT NULL UNIQUE,
    "name" VARCHAR(100) NOT NULL,
    "native_name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "mobile_number" VARCHAR(30) NOT NULL UNIQUE,
    "email" VARCHAR(255) UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "date_of_birth" DATE,
    "gender" "Gender" DEFAULT 'PREFER_NOT_TO_SAY',
    "profile_image" TEXT,
    "preferred_language_id" UUID REFERENCES "languages"("id") ON DELETE SET NULL,
    "timezone" VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
    "easy_mode_enabled" BOOLEAN NOT NULL DEFAULT false,
    "voice_assistance_enabled" BOOLEAN NOT NULL DEFAULT true,
    "accessibility_settings" JSONB,
    "notification_settings" JSONB,
    "is_verified" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
CREATE INDEX "idx_users_mobile" ON "users"("mobile_number");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_pref_lang" ON "users"("preferred_language_id");

-- 3. Hospitals Table
CREATE TABLE "hospitals" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "registration_number" VARCHAR(100) NOT NULL UNIQUE,
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL DEFAULT 'India',
    "postal_code" VARCHAR(20) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "emergency_available" BOOLEAN NOT NULL DEFAULT true,
    "opening_time" VARCHAR(10) NOT NULL DEFAULT '00:00',
    "closing_time" VARCHAR(10) NOT NULL DEFAULT '23:59',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_hospitals_city" ON "hospitals"("city");
CREATE INDEX "idx_hospitals_state" ON "hospitals"("state");
CREATE INDEX "idx_hospitals_location" ON "hospitals"("latitude", "longitude");

-- 4. Departments Table
CREATE TABLE "departments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "hospital_id" UUID NOT NULL REFERENCES "hospitals"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_departments_hospital" ON "departments"("hospital_id");

-- 5. Patients Table
CREATE TABLE "patients" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "patient_id" VARCHAR(50) NOT NULL UNIQUE,
    "medical_record_number" VARCHAR(100) NOT NULL UNIQUE,
    "emergency_contact_name" VARCHAR(255),
    "emergency_contact_number" VARCHAR(50),
    "blood_group" VARCHAR(10),
    "preferred_language_id" UUID REFERENCES "languages"("id") ON DELETE SET NULL,
    "chronic_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
CREATE INDEX "idx_patients_patient_id" ON "patients"("patient_id");
CREATE INDEX "idx_patients_mrn" ON "patients"("medical_record_number");

-- 6. Doctors Table
CREATE TABLE "doctors" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "doctor_id" VARCHAR(50) NOT NULL UNIQUE,
    "specialization" VARCHAR(255) NOT NULL,
    "qualification" VARCHAR(255) NOT NULL,
    "experience_years" INT NOT NULL DEFAULT 5 CHECK ("experience_years" >= 0),
    "hospital_id" UUID REFERENCES "hospitals"("id") ON DELETE SET NULL,
    "department_id" UUID REFERENCES "departments"("id") ON DELETE SET NULL,
    "consultation_fee" NUMERIC(10, 2) NOT NULL DEFAULT 500.00 CHECK ("consultation_fee" >= 0),
    "verification_status" BOOLEAN NOT NULL DEFAULT true,
    "average_rating" NUMERIC(3, 2) NOT NULL DEFAULT 4.90 CHECK ("average_rating" >= 0 AND "average_rating" <= 5.0),
    "review_count" INT NOT NULL DEFAULT 0 CHECK ("review_count" >= 0),
    "medical_council_reg_no" VARCHAR(100) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_doctors_doctor_id" ON "doctors"("doctor_id");
CREATE INDEX "idx_doctors_specialization" ON "doctors"("specialization");
CREATE INDEX "idx_doctors_hospital" ON "doctors"("hospital_id");

-- 7. Doctor Availability Table
CREATE TABLE "doctor_availability" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "doctor_id" UUID NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE,
    "day_of_week" INT NOT NULL CHECK ("day_of_week" >= 0 AND "day_of_week" <= 6),
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "slot_duration" INT NOT NULL DEFAULT 15 CHECK ("slot_duration" > 0),
    "max_patients" INT NOT NULL DEFAULT 30 CHECK ("max_patients" > 0),
    "is_active" BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX "idx_doctor_avail_doc_day" ON "doctor_availability"("doctor_id", "day_of_week");

-- 8. Community Workers Table
CREATE TABLE "community_workers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "worker_id" VARCHAR(50) NOT NULL UNIQUE,
    "organization" VARCHAR(255) NOT NULL DEFAULT 'National Health Mission',
    "assigned_area" VARCHAR(255) NOT NULL,
    "assigned_village" VARCHAR(255),
    "verification_status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_chw_worker_id" ON "community_workers"("worker_id");
CREATE INDEX "idx_chw_area" ON "community_workers"("assigned_area");

-- 9. Community Worker - Patient Mapping Table
CREATE TABLE "community_worker_patients" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "community_worker_id" UUID NOT NULL REFERENCES "community_workers"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_chw_patient" UNIQUE ("community_worker_id", "patient_id")
);

-- 10. Pharmacies Table
CREATE TABLE "pharmacies" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "pharmacy_id" VARCHAR(50) NOT NULL UNIQUE,
    "pharmacy_name" VARCHAR(255) NOT NULL,
    "license_number" VARCHAR(100) NOT NULL UNIQUE,
    "phone_number" VARCHAR(50) NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "associated_hospital" VARCHAR(255),
    "verification_status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_pharmacies_pharmacy_id" ON "pharmacies"("pharmacy_id");
CREATE INDEX "idx_pharmacies_license" ON "pharmacies"("license_number");

-- 11. Medicines Table
CREATE TABLE "medicines" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "generic_name" VARCHAR(255) NOT NULL,
    "strength" VARCHAR(100) NOT NULL,
    "dosage_form" VARCHAR(50) NOT NULL DEFAULT 'tablet',
    "manufacturer" VARCHAR(255),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_medicines_name" ON "medicines"("name");
CREATE INDEX "idx_medicines_generic_name" ON "medicines"("generic_name");

-- 12. Appointments Table
CREATE TABLE "appointments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "appointment_number" VARCHAR(50) NOT NULL UNIQUE,
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "doctor_id" UUID NOT NULL REFERENCES "doctors"("id") ON DELETE RESTRICT,
    "hospital_id" UUID NOT NULL REFERENCES "hospitals"("id") ON DELETE RESTRICT,
    "department_id" UUID REFERENCES "departments"("id") ON DELETE SET NULL,
    "department_name" VARCHAR(255),
    "appointment_date" DATE NOT NULL,
    "appointment_time" VARCHAR(20) NOT NULL,
    "reason" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'BOOKED',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMPTZ
);
CREATE INDEX "idx_appointments_pat_date" ON "appointments"("patient_id", "appointment_date");
CREATE INDEX "idx_appointments_doc_date" ON "appointments"("doctor_id", "appointment_date");
CREATE INDEX "idx_appointments_hospital" ON "appointments"("hospital_id");

-- 13. OP Queue Table
CREATE TABLE "op_queue" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "appointment_id" UUID NOT NULL UNIQUE REFERENCES "appointments"("id") ON DELETE CASCADE,
    "doctor_id" UUID NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "hospital_id" UUID NOT NULL REFERENCES "hospitals"("id") ON DELETE CASCADE,
    "queue_number" INT NOT NULL CHECK ("queue_number" > 0),
    "queue_date" DATE NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "estimated_wait_minutes" INT NOT NULL DEFAULT 15 CHECK ("estimated_wait_minutes" >= 0),
    "called_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_op_queue_slot" UNIQUE ("doctor_id", "hospital_id", "queue_date", "queue_number")
);
CREATE INDEX "idx_op_queue_lookup" ON "op_queue"("doctor_id", "queue_date", "status");

-- 14. Prescriptions Table
CREATE TABLE "prescriptions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "prescription_number" VARCHAR(50) NOT NULL UNIQUE,
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE RESTRICT,
    "doctor_id" UUID NOT NULL REFERENCES "doctors"("id") ON DELETE RESTRICT,
    "hospital_id" UUID REFERENCES "hospitals"("id") ON DELETE SET NULL,
    "appointment_id" UUID REFERENCES "appointments"("id") ON DELETE SET NULL,
    "pharmacy_id" UUID REFERENCES "pharmacies"("id") ON DELETE SET NULL,
    "diagnosis" TEXT NOT NULL,
    "general_instructions" TEXT,
    "start_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "end_date" DATE,
    "follow_up_date" DATE,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "pharmacy_status" "PharmacyOrderStatus" NOT NULL DEFAULT 'NEW',
    "vitals" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_prescriptions_patient" ON "prescriptions"("patient_id");
CREATE INDEX "idx_prescriptions_doctor" ON "prescriptions"("doctor_id");
CREATE INDEX "idx_prescriptions_hospital" ON "prescriptions"("hospital_id");

-- 15. Prescription Items Table
CREATE TABLE "prescription_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "prescription_id" UUID NOT NULL REFERENCES "prescriptions"("id") ON DELETE CASCADE,
    "medicine_id" UUID REFERENCES "medicines"("id") ON DELETE SET NULL,
    "medicine_name_snapshot" VARCHAR(255) NOT NULL,
    "dosage" VARCHAR(100) NOT NULL,
    "dosage_form" VARCHAR(50) NOT NULL DEFAULT 'tablet',
    "frequency" VARCHAR(100) NOT NULL,
    "quantity" INT NOT NULL DEFAULT 14 CHECK ("quantity" > 0),
    "duration_days" INT NOT NULL DEFAULT 7 CHECK ("duration_days" > 0),
    "before_after_food" VARCHAR(50) NOT NULL DEFAULT 'after_food',
    "instructions" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_prescription_items_rx" ON "prescription_items"("prescription_id");

-- 16. Medicine Schedules Table
CREATE TABLE "medicine_schedules" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "prescription_id" UUID REFERENCES "prescriptions"("id") ON DELETE CASCADE,
    "prescription_item_id" UUID REFERENCES "prescription_items"("id") ON DELETE CASCADE,
    "medicine_id" UUID REFERENCES "medicines"("id") ON DELETE SET NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "dosage" VARCHAR(100) NOT NULL,
    "dosage_form" VARCHAR(50) NOT NULL DEFAULT 'tablet',
    "frequency" VARCHAR(100) NOT NULL,
    "timezone" VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
    "before_after_food" VARCHAR(50) NOT NULL DEFAULT 'after_food',
    "instructions" TEXT,
    "total_prescribed_doses" INT NOT NULL DEFAULT 14 CHECK ("total_prescribed_doses" >= 0),
    "remaining_doses" INT NOT NULL DEFAULT 14 CHECK ("remaining_doses" >= 0),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_medicine_schedules_patient_active" ON "medicine_schedules"("patient_id", "is_active");

-- 17. Medicine Schedule Times Table
CREATE TABLE "medicine_schedule_times" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "medicine_schedule_id" UUID NOT NULL REFERENCES "medicine_schedules"("id") ON DELETE CASCADE,
    "scheduled_time" VARCHAR(20) NOT NULL,
    "label" VARCHAR(50)
);
CREATE INDEX "idx_schedule_times_schedule" ON "medicine_schedule_times"("medicine_schedule_id");

-- 18. Medicine Reminders Table
CREATE TABLE "medicine_reminders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "medicine_schedule_id" UUID NOT NULL REFERENCES "medicine_schedules"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "reminder_5_min_at" TIMESTAMPTZ,
    "reminder_2_min_at" TIMESTAMPTZ,
    "alarm_at" TIMESTAMPTZ NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "notified_5_min" BOOLEAN NOT NULL DEFAULT false,
    "notified_2_min" BOOLEAN NOT NULL DEFAULT false,
    "notified_exact" BOOLEAN NOT NULL DEFAULT false,
    "voice_played" BOOLEAN NOT NULL DEFAULT false,
    "snoozed_until" TIMESTAMPTZ,
    "snooze_count" INT NOT NULL DEFAULT 0 CHECK ("snooze_count" >= 0),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_schedule_time_reminder" UNIQUE ("medicine_schedule_id", "scheduled_at")
);
CREATE INDEX "idx_reminders_patient_time" ON "medicine_reminders"("patient_id", "scheduled_at");
CREATE INDEX "idx_reminders_status" ON "medicine_reminders"("status");

-- 19. Medicine Intakes Table
CREATE TABLE "medicine_intakes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "reminder_id" UUID REFERENCES "medicine_reminders"("id") ON DELETE SET NULL,
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "medicine_schedule_id" UUID REFERENCES "medicine_schedules"("id") ON DELETE SET NULL,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "taken_at" TIMESTAMPTZ,
    "status" "ReminderStatus" NOT NULL DEFAULT 'TAKEN',
    "snoozed_until" TIMESTAMPTZ,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_intakes_patient_taken" ON "medicine_intakes"("patient_id", "taken_at");

-- 20. EHR Records Table
CREATE TABLE "ehr_records" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "doctor_id" UUID REFERENCES "doctors"("id") ON DELETE SET NULL,
    "hospital_id" UUID REFERENCES "hospitals"("id") ON DELETE SET NULL,
    "appointment_id" UUID REFERENCES "appointments"("id") ON DELETE SET NULL,
    "prescription_id" UUID REFERENCES "prescriptions"("id") ON DELETE SET NULL,
    "record_type" "EHRRecordType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "record_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "created_by" VARCHAR(255) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
CREATE INDEX "idx_ehr_records_pat_date" ON "ehr_records"("patient_id", "record_date");
CREATE INDEX "idx_ehr_records_type" ON "ehr_records"("record_type");

-- 21. EHR Documents Table
CREATE TABLE "ehr_documents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ehr_record_id" UUID NOT NULL REFERENCES "ehr_records"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "uploaded_by" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "file_size" INT NOT NULL CHECK ("file_size" > 0),
    "storage_provider" VARCHAR(100) NOT NULL DEFAULT 'SECURE_ENCRYPTED_VAULT',
    "storage_key" TEXT NOT NULL,
    "checksum" VARCHAR(128),
    "is_encrypted" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
CREATE INDEX "idx_ehr_docs_record" ON "ehr_documents"("ehr_record_id");
CREATE INDEX "idx_ehr_docs_patient" ON "ehr_documents"("patient_id");

-- 22. Family Groups Table
CREATE TABLE "family_groups" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "owner_patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "group_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 23. Family Members Table
CREATE TABLE "family_members" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "family_group_id" UUID NOT NULL REFERENCES "family_groups"("id") ON DELETE CASCADE,
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "relationship" VARCHAR(100) NOT NULL,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AccessStatus" NOT NULL DEFAULT 'ACCEPTED'
);
CREATE INDEX "idx_family_members_group" ON "family_members"("family_group_id");
CREATE INDEX "idx_family_members_patient" ON "family_members"("patient_id");

-- 24. Family Access Requests Table
CREATE TABLE "family_access_requests" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "requester_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "family_group_id" UUID REFERENCES "family_groups"("id") ON DELETE SET NULL,
    "target_phone" VARCHAR(50),
    "relation" VARCHAR(100),
    "requested_permissions" JSONB NOT NULL,
    "status" "AccessStatus" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ NOT NULL
);
CREATE INDEX "idx_family_req_patient" ON "family_access_requests"("patient_id");
CREATE INDEX "idx_family_req_requester" ON "family_access_requests"("requester_user_id");

-- 25. EHR Access Permissions Table
CREATE TABLE "ehr_access_permissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "granted_to_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "granted_by_patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "permissions" JSONB NOT NULL,
    "granted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ,
    "revoked_at" TIMESTAMPTZ,
    "status" "AccessStatus" NOT NULL DEFAULT 'ACCEPTED'
);
CREATE INDEX "idx_ehr_perms_patient_status" ON "ehr_access_permissions"("patient_id", "status");
CREATE INDEX "idx_ehr_perms_grantee" ON "ehr_access_permissions"("granted_to_user_id");

-- 26. Notifications Table
CREATE TABLE "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "language_code" VARCHAR(10) NOT NULL DEFAULT 'en',
    "metadata" JSONB,
    "scheduled_at" TIMESTAMPTZ,
    "sent_at" TIMESTAMPTZ,
    "read_at" TIMESTAMPTZ,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_notif_user_status" ON "notifications"("user_id", "status");
CREATE INDEX "idx_notif_type" ON "notifications"("type");

-- 27. Notification Deliveries Table
CREATE TABLE "notification_deliveries" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "notification_id" UUID NOT NULL REFERENCES "notifications"("id") ON DELETE CASCADE,
    "channel" VARCHAR(50) NOT NULL,
    "provider" VARCHAR(100),
    "provider_message_id" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    "attempted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMPTZ,
    "failure_reason" TEXT
);
CREATE INDEX "idx_notif_deliveries_parent" ON "notification_deliveries"("notification_id");

-- 28. Voice Call Reminders Table
CREATE TABLE "voice_call_reminders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "appointment_id" UUID REFERENCES "appointments"("id") ON DELETE CASCADE,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "language_code" VARCHAR(10) NOT NULL DEFAULT 'en',
    "message_template" TEXT,
    "provider" VARCHAR(100) NOT NULL DEFAULT 'CUREVIA_VOICE_AI',
    "provider_call_id" VARCHAR(255),
    "transcript" TEXT,
    "audio_url" TEXT,
    "status" "CallStatus" NOT NULL DEFAULT 'SCHEDULED',
    "attempted_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "failure_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_voice_calls_patient_time" ON "voice_call_reminders"("patient_id", "scheduled_at");
CREATE INDEX "idx_voice_calls_status" ON "voice_call_reminders"("status");

-- 29. Medicine Refills Table
CREATE TABLE "medicine_refills" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "medicine_schedule_id" UUID REFERENCES "medicine_schedules"("id") ON DELETE SET NULL,
    "prescription_id" UUID REFERENCES "prescriptions"("id") ON DELETE SET NULL,
    "pharmacy_id" UUID REFERENCES "pharmacies"("id") ON DELETE SET NULL,
    "medicine_name" VARCHAR(255) NOT NULL,
    "prescribed_quantity" INT NOT NULL CHECK ("prescribed_quantity" > 0),
    "dispensed_quantity" INT NOT NULL CHECK ("dispensed_quantity" >= 0),
    "remaining_quantity" INT NOT NULL CHECK ("remaining_quantity" >= 0),
    "estimated_finish_date" DATE NOT NULL,
    "reminder_date" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_refills_patient_status" ON "medicine_refills"("patient_id", "status");

-- 30. Pharmacy Prescription Access Table
CREATE TABLE "pharmacy_prescription_access" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "prescription_id" UUID NOT NULL REFERENCES "prescriptions"("id") ON DELETE CASCADE,
    "pharmacy_id" UUID NOT NULL REFERENCES "pharmacies"("id") ON DELETE CASCADE,
    "granted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessed_at" TIMESTAMPTZ,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "uq_pharm_rx_access" UNIQUE ("prescription_id", "pharmacy_id")
);

-- 31. Doctor Feedback Table
CREATE TABLE "doctor_feedback" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "doctor_id" UUID NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE,
    "appointment_id" UUID UNIQUE REFERENCES "appointments"("id") ON DELETE SET NULL,
    "rating" INT NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
    "feedback" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_feedback_doctor" ON "doctor_feedback"("doctor_id");
CREATE INDEX "idx_feedback_patient" ON "doctor_feedback"("patient_id");

-- 32. Translations Table
CREATE TABLE "translations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "language_id" UUID NOT NULL REFERENCES "languages"("id") ON DELETE CASCADE,
    "translation_key" VARCHAR(255) NOT NULL,
    "translated_text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "uq_lang_trans_key" UNIQUE ("language_id", "translation_key")
);

-- 33. OTP Verifications Table
CREATE TABLE "otp_verifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "mobile_number" VARCHAR(30) NOT NULL,
    "otp_hash" VARCHAR(255) NOT NULL,
    "purpose" VARCHAR(100) NOT NULL DEFAULT 'LOGIN_AUTHENTICATION',
    "expires_at" TIMESTAMPTZ NOT NULL,
    "attempts" INT NOT NULL DEFAULT 0 CHECK ("attempts" >= 0),
    "max_attempts" INT NOT NULL DEFAULT 3 CHECK ("max_attempts" > 0),
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_otp_mobile_expires" ON "otp_verifications"("mobile_number", "expires_at");

-- 34. Audit Logs Table
CREATE TABLE "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "actor_user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "actor_role" VARCHAR(50) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(100) NOT NULL,
    "resource_id" VARCHAR(255),
    "metadata" JSONB,
    "ip_address" VARCHAR(64),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_audit_actor_time" ON "audit_logs"("actor_user_id", "created_at");
CREATE INDEX "idx_audit_action" ON "audit_logs"("action");
CREATE INDEX "idx_audit_resource" ON "audit_logs"("resource_type", "resource_id");

-- 35. User Notification Preferences Table
CREATE TABLE "user_notification_preferences" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "medicine_notifications" BOOLEAN NOT NULL DEFAULT true,
    "appointment_notifications" BOOLEAN NOT NULL DEFAULT true,
    "refill_notifications" BOOLEAN NOT NULL DEFAULT true,
    "voice_calls_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT true,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_enabled" BOOLEAN NOT NULL DEFAULT false,
    "reminder_5_minutes" BOOLEAN NOT NULL DEFAULT true,
    "reminder_2_minutes" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
