import React, { useState, useEffect } from 'react';
import {
  Pill,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Volume2,
  Utensils,
  ChevronRight,
  ShieldCheck,
  Building2,
  Users,
  Star,
  Activity,
  PhoneCall,
  Search,
  Filter,
  FileText,
  Trash2,
  UserCheck,
  UserX,
  Lock,
  Eye,
  MapPin,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VoiceButton } from '../common/VoiceButton';
import { MedicineScheduleItem, MealTiming, MedicineForm } from '../../types';

export const PatientDashboard: React.FC = () => {
  const {
    currentUser,
    medicines,
    addMedicine,
    markMedicineTaken,
    snoozeMedicine,
    deleteMedicine,
    appointments,
    bookAppointment,
    cancelAppointment,
    ehrRecords,
    addEHRRecord,
    familyMembers,
    inviteFamilyMember,
    updateFamilyAccess,
    revokeFamilyAccess,
    hospitals,
    doctorReviews,
    addDoctorReview,
    triggerMedicineAlarm,
    startAiCall,
    activePatientTab,
    setActivePatientTab,
    easyMode,
    setEasyMode,
    t,
    speak,
  } = useApp();

  // Sub-modals states
  const [addMedModalOpen, setAddMedModalOpen] = useState(false);
  const [bookAptModalOpen, setBookAptModalOpen] = useState(false);
  const [addEhrModalOpen, setAddEhrModalOpen] = useState(false);
  const [inviteFamModalOpen, setInviteFamModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [patientIdAccessModalOpen, setPatientIdAccessModalOpen] = useState(false);
  const [viewRecordDetail, setViewRecordDetail] = useState<any | null>(null);

  // Form states for Add Medicine
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('500 mg');
  const [newMedForm, setNewMedForm] = useState<MedicineForm>('tablet');
  const [newMedMealTiming, setNewMedMealTiming] = useState<MealTiming>('after_food');
  const [newMedTimes, setNewMedTimes] = useState<string[]>(['08:00', '20:00']);
  const [newMedDuration, setNewMedDuration] = useState('7');
  const [newMedInstructions, setNewMedInstructions] = useState('');

  // Form states for Book Appointment
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Ananya Mukherjee');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Internal Medicine & Cardiology');
  const [selectedHospital, setSelectedHospital] = useState('Apollo City Hospital & Care Center');
  const [aptDate, setAptDate] = useState('2026-08-30');
  const [aptTime, setAptTime] = useState('11:00 AM');
  const [aptDepartment, setAptDepartment] = useState('Cardiology');

  // Form states for EHR Upload
  const [ehrTitle, setEhrTitle] = useState('');
  const [ehrType, setEhrType] = useState<any>('lab_report');
  const [ehrDoctor, setEhrDoctor] = useState('Dr. Ananya Mukherjee');
  const [ehrHospital, setEhrHospital] = useState('Apollo City Hospital');
  const [ehrSummary, setEhrSummary] = useState('');

  // Form states for Family Member
  const [famName, setFamName] = useState('');
  const [famRel, setFamRel] = useState<any>('Child');
  const [famPhone, setFamPhone] = useState('');

  // Form states for Doctor Review
  const [revDoctor, setRevDoctor] = useState('Dr. Ananya Mukherjee');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');

  // Hospital Map Search Filter
  const [hospSearch, setHospSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Live countdown calculation for next medicine
  const nextMedicine = medicines.find((m) => m.status === 'active') || medicines[0];

  const handleAddMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const days = parseInt(newMedDuration, 10) || 7;
    const todayStr = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setDate(end.getDate() + days);

    addMedicine({
      name: newMedName,
      dosage: newMedDosage,
      form: newMedForm,
      quantity: 1,
      times: newMedTimes,
      mealTiming: newMedMealTiming,
      startDate: todayStr,
      endDate: end.toISOString().split('T')[0],
      durationDays: days,
      totalTablets: days * newMedTimes.length,
      remainingTablets: days * newMedTimes.length,
      reminderSound: 'gentle-chime',
      reminderLanguage: 'en',
      status: 'active',
      instructions: newMedInstructions || 'Take with water as advised.',
    });

    setAddMedModalOpen(false);
    setNewMedName('');
    setNewMedInstructions('');
  };

  const handleBookAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookAppointment({
      patientId: currentUser.patientId,
      patientName: currentUser.name,
      doctorId: 'usr_doc_101',
      doctorName: selectedDoctor,
      doctorSpecialty: selectedSpecialty,
      hospitalName: selectedHospital,
      hospitalAddress: '42 Healthway Boulevard, Sector 5, City Center',
      hospitalPhone: '+91 44 2829 0200',
      department: aptDepartment,
      date: aptDate,
      time: aptTime,
      fee: 500,
      notes: 'General check-up and EHR review.',
    });
    setBookAptModalOpen(false);
  };

  const handleAddEhrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ehrTitle.trim()) return;
    addEHRRecord({
      patientId: currentUser.patientId,
      title: ehrTitle,
      type: ehrType,
      date: new Date().toISOString().split('T')[0],
      doctorName: ehrDoctor,
      hospitalName: ehrHospital,
      department: 'General Medicine',
      summary: ehrSummary || 'Routine medical document digitized into Curevia EHR.',
      tags: ['Uploaded Document', ehrType],
      findings: ['Digitized & verified by patient'],
    });
    setAddEhrModalOpen(false);
    setEhrTitle('');
    setEhrSummary('');
  };

  const handleInviteFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!famName.trim()) return;
    inviteFamilyMember({
      name: famName,
      relationship: famRel,
      phone: famPhone || '+91 98000 11223',
      permissions: {
        viewPrescriptions: true,
        viewLabReports: false,
        receiveAlerts: true,
        emergencyContact: true,
      },
    });
    setInviteFamModalOpen(false);
    setFamName('');
    setFamPhone('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revComment.trim()) return;
    addDoctorReview({
      doctorId: 'usr_doc_101',
      doctorName: revDoctor,
      department: 'Cardiology & Internal Medicine',
      rating: revRating,
      comment: revComment,
      patientAlias: 'Verified Patient (Anonymous)',
    });
    setReviewModalOpen(false);
    setRevComment('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Patient Header Card */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 rounded-3xl text-white shadow-xl shadow-sky-500/15 relative overflow-hidden">
        {/* Background ambient pattern */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider rounded-md">
                Patient Portal
              </span>
              <span className="text-xs text-sky-100 font-mono">ID: {currentUser.patientId}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Welcome back, {currentUser.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-sky-100">
              <span>Age: {currentUser.age || 48} yrs ({currentUser.gender || 'Female'})</span>
              <span>•</span>
              <span>Blood Group: {currentUser.bloodGroup || 'B+'}</span>
              <span>•</span>
              <span className="bg-rose-500/30 px-2 py-0.5 rounded text-rose-100 font-medium">
                Allergies: {currentUser.allergies?.join(', ') || 'Penicillin'}
              </span>
            </div>
          </div>

          {/* Quick Voice Audio Guidance & Easy Mode Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                speak(
                  `Hello ${currentUser.name}. You have ${medicines.length} medicines scheduled today. Your next medicine is ${nextMedicine?.name} at 2:00 PM.`
                )
              }
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen Day Plan</span>
            </button>

            <button
              onClick={() => setAddMedModalOpen(true)}
              className="px-4 py-2.5 bg-white text-sky-700 hover:bg-sky-50 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addMedicine')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LOW-LITERACY / EASY MODE VIEW */}
      {easyMode && (
        <div className="p-6 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 rounded-3xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 text-white rounded-2xl">
                <Pill className="w-8 h-8 -rotate-45" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-amber-950 dark:text-amber-100 font-display">
                  EASY MODE (Low Literacy & Elderly View)
                </h2>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Large icons, minimum text, one-tap voice instructions, high contrast.
                </p>
              </div>
            </div>
            <button
              onClick={() => setEasyMode(false)}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-bold text-sm rounded-xl border border-amber-300 shadow-sm"
            >
              Exit Easy Mode
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {medicines.map((med) => (
              <div
                key={med.id}
                className="p-6 bg-white dark:bg-slate-900 rounded-3xl border-3 border-amber-300 dark:border-amber-700 shadow-lg space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-sky-100 dark:bg-sky-950/80 rounded-3xl flex items-center justify-center text-sky-600 dark:text-sky-400 border-2 border-sky-300">
                      <Pill className="w-12 h-12 -rotate-45" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {med.name}
                      </h3>
                      <p className="text-xl font-bold text-sky-600 dark:text-sky-400">
                        {med.dosage}
                      </p>
                      <p className="text-base font-semibold text-amber-800 dark:text-amber-400 mt-1">
                        ⏰ {med.times.join(' & ')} • {med.mealTiming === 'after_food' ? '🍽️ After Food' : '🍽️ Before Food'}
                      </p>
                    </div>
                  </div>
                  <VoiceButton
                    textToSpeak={`Take ${med.name} ${med.dosage}. ${
                      med.mealTiming === 'after_food' ? 'After eating food.' : 'Before eating food.'
                    }`}
                    label="🔊 Listen"
                    size="lg"
                    variant="primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => markMedicineTaken(med.id)}
                    className="py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xl rounded-2xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-7 h-7" />
                    TAKEN
                  </button>
                  <button
                    onClick={() => snoozeMedicine(med.id)}
                    className="py-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 active:scale-95 text-slate-800 dark:text-slate-200 font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Clock className="w-6 h-6" />
                    REMIND ME
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN TAB CONTENT */}

      {/* TAB 1: HOME */}
      {activePatientTab === 'home' && (
        <div className="space-y-6">
          {/* Next Medicine Countdown Card & Alarm Trigger Preview */}
          {nextMedicine && (
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 animate-gentle-pulse">
                    <Pill className="w-9 h-9 -rotate-45" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-sky-600 dark:text-sky-400">
                      {t('nextMedicine')}
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                      {nextMedicine.name} ({nextMedicine.dosage})
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Scheduled today at 02:00 PM • {nextMedicine.mealTiming === 'after_food' ? t('afterFood') : t('beforeFood')}
                    </p>
                  </div>
                </div>

                {/* Remaining Countdown Badge & Alarm Tester */}
                <div className="flex flex-col sm:items-end gap-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-2xl border border-sky-200 dark:border-sky-800 font-mono font-bold text-base">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>01h 24m remaining</span>
                  </div>

                  <button
                    onClick={() => triggerMedicineAlarm(nextMedicine)}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>🔔 Test Live Medicine Alarm Ring</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions for Next Medicine */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => markMedicineTaken(nextMedicine.id)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Take Medicine</span>
                </button>

                <VoiceButton
                  textToSpeak={`Next medicine is ${nextMedicine.name} ${nextMedicine.dosage} at 2:00 PM ${
                    nextMedicine.mealTiming === 'after_food' ? 'after food' : 'before food'
                  }.`}
                  label="Listen Instruction"
                />

                <button
                  onClick={() => snoozeMedicine(nextMedicine.id)}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer"
                >
                  Snooze 10m
                </button>
              </div>
            </div>
          )}

          {/* Quick Metrics Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{t('adherenceRate')}</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                92%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[92%]" />
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">
                7-day continuous streak! Great adherence.
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Active Prescriptions</span>
                <FileText className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                {medicines.length}
              </div>
              <p className="text-[11px] text-slate-500">
                All auto-synced with doctor & pharmacy
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Upcoming Doctor Visit</span>
                <Calendar className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {appointments[0]?.date || 'Aug 28'}
              </div>
              <p className="text-[11px] text-sky-600 font-medium">
                OP #{appointments[0]?.opNumber || 24} • Dr. Ananya Mukherjee
              </p>
            </div>
          </div>

          {/* Today's Medicines Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                {t('todayMedicines')}
              </h3>
              <button
                onClick={() => setAddMedModalOpen(true)}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicines.map((med) => {
                const isTaken = med.history.some((h) => h.date === new Date().toISOString().split('T')[0] && h.status === 'taken');
                return (
                  <div
                    key={med.id}
                    className={`p-5 rounded-3xl border transition duration-150 space-y-4 ${
                      isTaken
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            isTaken
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600'
                              : 'bg-sky-100 dark:bg-sky-950 text-sky-600'
                          }`}
                        >
                          <Pill className="w-6 h-6 -rotate-45" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {med.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                              {med.dosage}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Utensils className="w-3 h-3" />
                              {med.mealTiming === 'after_food'
                                ? t('afterFood')
                                : med.mealTiming === 'before_food'
                                ? t('beforeFood')
                                : t('withFood')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isTaken ? (
                        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Taken
                        </span>
                      ) : (
                        <button
                          onClick={() => triggerMedicineAlarm(med)}
                          className="p-2 text-slate-400 hover:text-sky-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Trigger Alarm"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Times: {med.times.join(' • ')}
                        </span>
                        <span className="text-slate-400">
                          {med.remainingTablets} tablets remaining
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{med.instructions}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <VoiceButton
                        textToSpeak={`Take ${med.name} ${med.dosage} ${
                          med.mealTiming === 'after_food' ? 'after food' : 'before food'
                        }.`}
                        size="sm"
                      />

                      <div className="flex items-center gap-2">
                        {!isTaken && (
                          <button
                            onClick={() => markMedicineTaken(med.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark Taken</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteMedicine(med.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remove medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDICINES & ALARM SYSTEM */}
      {activePatientTab === 'medicines' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Medicine Reminder & Alarm System
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Automated 5-minute, 2-minute, and scheduled alarm alerts with voice synthesizer.
              </p>
            </div>
            <button
              onClick={() => setAddMedModalOpen(true)}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addMedicine')}</span>
            </button>
          </div>

          {/* Alarm System Live Simulator Testing Panel */}
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-slate-800 dark:to-slate-850 rounded-3xl border border-indigo-100 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Alarm Stages & Notification Testing</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Experience the automated alarm workflow (5 min before, 2 min before, and exact scheduled time alarm popup with voice).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  alert(t('reminder5Min'));
                  speak(t('reminder5Min'));
                }}
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-sky-50 transition cursor-pointer text-left"
              >
                <div className="text-sky-600 font-bold">5 Minutes Before Alert</div>
                <div className="text-[11px] text-slate-400">"Your medicine reminder is coming in 5 minutes."</div>
              </button>

              <button
                onClick={() => {
                  alert(t('reminder2Min'));
                  speak(t('reminder2Min'));
                }}
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-sky-50 transition cursor-pointer text-left"
              >
                <div className="text-amber-600 font-bold">2 Minutes Before Alert</div>
                <div className="text-[11px] text-slate-400">"Your medicine reminder is coming in 2 minutes."</div>
              </button>

              <button
                onClick={() => triggerMedicineAlarm(medicines[0])}
                className="p-3 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-2xl text-xs font-bold hover:opacity-90 shadow-md transition cursor-pointer text-left"
              >
                <div className="font-extrabold flex items-center gap-1">
                  <span>🔔 Trigger Exact Time Alarm</span>
                </div>
                <div className="text-[11px] text-sky-100">Full screen alert + Chime sound + Voice</div>
              </button>
            </div>
          </div>

          {/* List of all medicines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((med) => (
              <div
                key={med.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold rounded-full">
                    {med.form.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {med.remainingTablets} doses left
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{med.name}</h3>
                  <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">{med.dosage}</p>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Times:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {med.times.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Food Rule:</span>
                    <span className="font-medium">
                      {med.mealTiming === 'after_food'
                        ? t('afterFood')
                        : med.mealTiming === 'before_food'
                        ? t('beforeFood')
                        : t('withFood')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span>{med.durationDays} days</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <VoiceButton
                    textToSpeak={`Take ${med.name} ${med.dosage}. ${
                      med.mealTiming === 'after_food' ? 'After food.' : 'Before food.'
                    }`}
                    size="sm"
                  />
                  <button
                    onClick={() => markMedicineTaken(med.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    Mark Taken
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: APPOINTMENTS & OP QUEUE STATUS */}
      {activePatientTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Doctor Appointments & Live OP Queue
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Real-time queue tracking, AI Health Voice Call reminders, and instant booking.
              </p>
            </div>
            <button
              onClick={() => setBookAptModalOpen(true)}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('bookAppointment')}</span>
            </button>
          </div>

          {/* Live OP / Queue Status Tracker */}
          {appointments.length > 0 && (
            <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-sky-400">
                    {t('opQueueStatus')}
                  </span>
                  <h3 className="text-xl font-bold font-display">
                    {appointments[0].hospitalName}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {appointments[0].doctorName} • {appointments[0].department}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Queue Active
                </div>
              </div>

              {/* OP Queue Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/10 text-center">
                  <span className="text-xs text-slate-300">{t('currentOp')}</span>
                  <div className="text-3xl font-extrabold text-amber-400 mt-1 font-mono">
                    #{appointments[0].currentOpNumber}
                  </div>
                  <span className="text-[10px] text-slate-400">Now with doctor</span>
                </div>

                <div className="p-4 bg-sky-600/30 rounded-2xl backdrop-blur-xs border border-sky-400/40 text-center ring-2 ring-sky-400/30">
                  <span className="text-xs text-sky-200 font-bold">{t('yourOp')}</span>
                  <div className="text-3xl font-extrabold text-white mt-1 font-mono">
                    #{appointments[0].opNumber}
                  </div>
                  <span className="text-[10px] text-sky-200">Your token number</span>
                </div>

                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/10 text-center">
                  <span className="text-xs text-slate-300">{t('patientsAhead')}</span>
                  <div className="text-3xl font-extrabold text-white mt-1 font-mono">
                    {appointments[0].opNumber - appointments[0].currentOpNumber}
                  </div>
                  <span className="text-[10px] text-emerald-300 font-medium">
                    Est. wait: {appointments[0].estimatedWaitMinutes} mins
                  </span>
                </div>
              </div>

              {/* Live progress indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{t('turnApproaching')}</span>
                  <span>75% to consultation</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full w-3/4 animate-pulse" />
                </div>
              </div>

              {/* AI Health Call Launcher */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-sky-200">
                  <PhoneCall className="w-4 h-4 text-sky-400 animate-bounce" />
                  <span>AI Voice Reminder Call Scheduled 1 Day Before</span>
                </div>
                <button
                  onClick={() => startAiCall(appointments[0])}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Simulate AI Voice Call</span>
                </button>
              </div>
            </div>
          )}

          {/* Appointment list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold rounded-full">
                      OP #{apt.opNumber}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                      {apt.doctorName}
                    </h3>
                    <p className="text-xs text-slate-500">{apt.doctorSpecialty}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg capitalize">
                    {apt.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    <span className="font-semibold">{apt.date} • {apt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{apt.hospitalName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span className="text-slate-400">{apt.hospitalAddress}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => startAiCall(apt)}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>AI Voice Call</span>
                  </button>

                  <button
                    onClick={() => cancelAppointment(apt.id)}
                    className="text-xs text-rose-500 hover:underline font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ELECTRONIC HEALTH RECORDS (EHR) */}
      {activePatientTab === 'records' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                {t('myHealthRecords')} (EHR)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Digitized medical records: Prescriptions, X-Rays, Scans, Blood Panels, and Lab reports.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPatientIdAccessModalOpen(true)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Patient ID Access</span>
              </button>
              <button
                onClick={() => setAddEhrModalOpen(true)}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Upload Document</span>
              </button>
            </div>
          </div>

          {/* Timeline View */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
              <span>Medical History Timeline (2026)</span>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {ehrRecords.map((rec) => (
                <div key={rec.id} className="relative pl-12">
                  <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-sky-500 ring-4 ring-white dark:ring-slate-950" />
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="px-2.5 py-0.5 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[11px] font-bold uppercase rounded-md">
                          {rec.type.replace('_', ' ')}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {rec.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {rec.doctorName} • {rec.hospitalName} ({rec.date})
                        </p>
                      </div>

                      <button
                        onClick={() => setViewRecordDetail(rec)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 self-start"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rec.summary}
                    </p>

                    {/* Test values preview if available */}
                    {rec.values && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                        {rec.values.slice(0, 4).map((v, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700"
                          >
                            <span className="text-[10px] text-slate-400 truncate block">
                              {v.label}
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {v.value} {v.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MY FAMILY ACCESS CONTROL */}
      {activePatientTab === 'family' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                {t('myFamily')} & Privacy Access Control
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Family members only receive access after you explicitly review and grant consent.
              </p>
            </div>
            <button
              onClick={() => setInviteFamModalOpen(true)}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Invite Family Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {familyMembers.map((m) => (
              <div
                key={m.id}
                className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {m.name}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {m.relationship} • {m.phone}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                      m.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                {/* Permissions Matrix */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>View Prescriptions</span>
                    <span className="font-bold text-emerald-600">
                      {m.permissions.viewPrescriptions ? 'Granted' : 'Restricted'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>View Lab Reports</span>
                    <span className="font-bold text-emerald-600">
                      {m.permissions.viewLabReports ? 'Granted' : 'Restricted'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Receive Medicine SMS/Alarms</span>
                    <span className="font-bold text-emerald-600">
                      {m.permissions.receiveAlerts ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {m.status === 'pending' ? (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => updateFamilyAccess(m.id, 'active')}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Accept Access Request
                    </button>
                    <button
                      onClick={() => updateFamilyAccess(m.id, 'rejected')}
                      className="py-2.5 px-4 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => revokeFamilyAccess(m.id)}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                  >
                    Revoke Medical Access
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: NEARBY HOSPITALS & MAP */}
      {activePatientTab === 'hospitals' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {t('nearbyHospitals')} & Emergency Care
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Locate nearby healthcare clinics, view doctor availability, emergency department status, and book visits.
            </p>
          </div>

          {/* Search and filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by hospital name, department, or locality..."
                value={hospSearch}
                onChange={(e) => setHospSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-hidden"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {['All', 'Emergency 24/7', 'Cardiology', 'Pediatrics', 'Ophthalmology'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDeptFilter(dept)}
                  className={`px-3 py-2 text-xs rounded-xl whitespace-nowrap font-medium transition cursor-pointer ${
                    selectedDeptFilter === dept
                      ? 'bg-sky-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map Visualizer */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden h-64 flex flex-col justify-between border border-slate-800 shadow-inner">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold rounded-full">
                Interactive Hospital Navigator (GPS Active)
              </span>
              <span className="text-xs text-slate-400">4 Hospitals within 5 km radius</span>
            </div>

            {/* Pins */}
            <div className="relative z-10 flex items-center justify-around py-4">
              {hospitals.map((h, i) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setSelectedHospital(h.name);
                    setBookAptModalOpen(true);
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer group hover:scale-110 transition"
                >
                  <div className="p-2.5 bg-rose-500 text-white rounded-full shadow-lg ring-4 ring-rose-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700 shadow-xs">
                    {h.distance}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative z-10 text-center text-xs text-slate-400">
              Tap any medical center pin to view queue status and book an instant token.
            </div>
          </div>

          {/* Hospital Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals
              .filter((h) => {
                if (selectedDeptFilter !== 'All') {
                  if (selectedDeptFilter === 'Emergency 24/7' && !h.emergencyAvailable) return false;
                  if (selectedDeptFilter !== 'Emergency 24/7' && !h.departments.includes(selectedDeptFilter)) return false;
                }
                if (hospSearch && !h.name.toLowerCase().includes(hospSearch.toLowerCase())) return false;
                return true;
              })
              .map((h) => (
                <div
                  key={h.id}
                  className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-md">
                          Open Now
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{h.distance}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                        {h.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        {h.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-xl">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{h.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {h.departments.map((d, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] rounded-lg"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Doctors Available: <strong>{h.doctorsAvailable}</strong>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedHospital(h.name);
                        setBookAptModalOpen(true);
                      }}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 7: DOCTOR RATINGS & ANONYMOUS FEEDBACK */}
      {activePatientTab === 'feedback' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                {t('doctorRating')} & Patient Feedback
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Transparent and anonymous clinical feedback to maintain exceptional care standards.
              </p>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4" />
              <span>Write Feedback</span>
            </button>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left">
            <div>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-display">
                4.8 / 5.0
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500 my-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-500">Based on 1,420 verified patient visits</p>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div>Dr. Ananya Mukherjee: <strong>4.9 / 5</strong> (Cardiology & General Medicine)</div>
              <div>Dr. Rajesh Swaminathan: <strong>4.8 / 5</strong> (Ophthalmology)</div>
              <div>Apollo City Hospital Center: <strong>4.7 / 5</strong> (Facilities & Diagnostics)</div>
            </div>
          </div>

          {/* Feedback Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctorReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{rev.date}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{rev.doctorName}</span>
                  <span className="text-emerald-600 font-semibold">{rev.patientAlias}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD MEDICINE REMINDER */}
      {addMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {t('addMedicine')}
            </h3>

            <form onSubmit={handleAddMedicineSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Medicine Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol, Metformin, Vitamin C"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="e.g. 500 mg, 10 ml"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Form
                  </label>
                  <select
                    value={newMedForm}
                    onChange={(e) => setNewMedForm(e.target.value as MedicineForm)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                    <option value="drops">Drops</option>
                    <option value="inhaler">Inhaler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Meal Timing
                  </label>
                  <select
                    value={newMedMealTiming}
                    onChange={(e) => setNewMedMealTiming(e.target.value as MealTiming)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="after_food">{t('afterFood')}</option>
                    <option value="before_food">{t('beforeFood')}</option>
                    <option value="with_food">{t('withFood')}</option>
                    <option value="empty_stomach">{t('emptyStomach')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={newMedDuration}
                    onChange={(e) => setNewMedDuration(e.target.value)}
                    min="1"
                    max="90"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Doctor / Care Instructions
                </label>
                <textarea
                  value={newMedInstructions}
                  onChange={(e) => setNewMedInstructions(e.target.value)}
                  placeholder="e.g. Take with 1 glass of warm water after lunch."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddMedModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BOOK APPOINTMENT */}
      {bookAptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {t('bookAppointment')}
            </h3>

            <form onSubmit={handleBookAppointmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Hospital / Medical Center
                </label>
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.name}>
                      {h.name} ({h.distance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <select
                    value={aptDepartment}
                    onChange={(e) => setAptDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Doctor
                  </label>
                  <input
                    type="text"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Slot Time
                  </label>
                  <select
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:15 PM">02:15 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-sky-50 dark:bg-sky-950/60 rounded-2xl text-sky-800 dark:text-sky-300 text-xs">
                ✨ An OP Queue Token & AI Health Voice Call reminder will be generated automatically.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setBookAptModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW RECORD DETAIL */}
      {viewRecordDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold rounded-full">
                {viewRecordDetail.type.toUpperCase()}
              </span>
              <button
                onClick={() => setViewRecordDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {viewRecordDetail.title}
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div>Physician: <strong>{viewRecordDetail.doctorName}</strong></div>
              <div>Facility: <strong>{viewRecordDetail.hospitalName}</strong></div>
              <div>Date of Record: <strong>{viewRecordDetail.date}</strong></div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Clinical Findings & Summary
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {viewRecordDetail.summary}
              </p>
            </div>

            {viewRecordDetail.values && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Test Values Matrix
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {viewRecordDetail.values.map((v: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center"
                    >
                      <span className="text-xs text-slate-500">{v.label}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {v.value} {v.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setViewRecordDetail(null)}
                className="px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PATIENT ID RECORD ACCESS & VERIFICATION */}
      {patientIdAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-950 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                {t('patientIdAccess')}
              </h3>
              <p className="text-xs text-slate-500">
                Secure hospital credential & EHR verification
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">Your Verified Patient ID</span>
                <span className="text-sm font-mono font-bold text-sky-600 dark:text-sky-400">
                  {currentUser.patientId}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">Registered Mobile</span>
                <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                  {currentUser.phone}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs rounded-xl border border-amber-200 dark:border-amber-800">
              🔒 For security, access to medical records uses encrypted mobile OTP verification rather than relying solely on date of birth.
            </div>

            <button
              onClick={() => setPatientIdAccessModalOpen(false)}
              className="w-full py-3 bg-sky-600 text-white font-bold text-xs rounded-xl"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: INVITE FAMILY MEMBER */}
      {inviteFamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Invite Family Member
            </h3>

            <form onSubmit={handleInviteFamilySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Divya Sharma"
                  value={famName}
                  onChange={(e) => setFamName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Relationship</label>
                  <select
                    value={famRel}
                    onChange={(e) => setFamRel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 97910 88990"
                    value={famPhone}
                    onChange={(e) => setFamPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-sky-50 dark:bg-sky-950/60 rounded-xl text-sky-800 dark:text-sky-300 text-xs">
                They will receive an invite notification and only gain access after you approve their specific request.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setInviteFamModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: WRITE DOCTOR REVIEW */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Anonymous Doctor Feedback
            </h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={revDoctor}
                  onChange={(e) => setRevDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRevRating(star)}
                      className={`p-2 rounded-xl border text-base ${
                        revRating >= star
                          ? 'bg-amber-100 border-amber-400 text-amber-600'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Your Experience & Feedback</label>
                <textarea
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="Share details about consultation clarity, waiting time, and treatment..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="text-[11px] text-slate-400">
                🔒 Feedback is posted anonymously as "Verified Patient" without exposing your private medical info.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md"
                >
                  Submit Anonymous Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
