import React, { useState } from 'react';
import {
  Stethoscope,
  Users,
  PlusCircle,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Activity,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronRight,
  Pill,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MealTiming, MedicineForm } from '../../types';

export const DoctorDashboard: React.FC = () => {
  const {
    currentUser,
    activeDoctorTab,
    setActiveDoctorTab,
    createPrescription,
    appointments,
    ehrRecords,
    t,
  } = useApp();

  // Create Prescription Form state
  const [patientId, setPatientId] = useState('CRV-2026-8942');
  const [patientName, setPatientName] = useState('Priya Sharma');
  const [patientAge, setPatientAge] = useState(48);
  const [patientGender, setPatientGender] = useState('Female');
  const [diagnosis, setDiagnosis] = useState('Type 2 Diabetes Mellitus & Mild Hypertension');
  const [notes, setNotes] = useState('Monitor fasting glucose weekly. Drink 2.5L water daily.');
  const [followUpDate, setFollowUpDate] = useState('2026-09-15');

  // Multi-medicine item entries
  const [medItems, setMedItems] = useState<
    Array<{
      name: string;
      dosage: string;
      form: MedicineForm;
      mealTiming: MealTiming;
      frequency: string;
      times: string[];
      durationDays: number;
      instructions: string;
    }>
  >([
    {
      name: 'Metformin Hydrochloride',
      dosage: '500 mg',
      form: 'tablet',
      mealTiming: 'after_food',
      frequency: '1-0-1 (Twice daily)',
      times: ['08:30', '20:30'],
      durationDays: 30,
      instructions: 'Take immediately after breakfast and dinner.',
    },
    {
      name: 'Atorvastatin',
      dosage: '10 mg',
      form: 'tablet',
      mealTiming: 'after_food',
      frequency: '0-0-1 (Once daily at bedtime)',
      times: ['21:30'],
      durationDays: 30,
      instructions: 'Take 1 tablet before sleeping.',
    },
  ]);

  // OP Live token manager for doctor
  const [currentOpToken, setCurrentOpToken] = useState(18);

  const handleAddMedItem = () => {
    setMedItems((prev) => [
      ...prev,
      {
        name: '',
        dosage: '500 mg',
        form: 'tablet',
        mealTiming: 'after_food',
        frequency: '1-0-1 (Twice daily)',
        times: ['08:00', '20:00'],
        durationDays: 14,
        instructions: 'Take with water after food.',
      },
    ]);
  };

  const handleRemoveMedItem = (index: number) => {
    setMedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || medItems.length === 0) return;

    createPrescription({
      doctorId: currentUser.id || 'doc-1',
      patientId,
      patientName,
      patientAge,
      patientGender,
      doctorName: currentUser.name || 'Dr. Ananya Mukherjee',
      doctorSpecialty: 'MD, Cardiology & Internal Medicine',
      hospitalName: 'Apollo City Hospital & Care Center',
      hospitalAddress: '42 Healthway Boulevard, Sector 5, City Center',
      diagnosis,
      medicines: medItems.map((m, idx) => ({
        id: `med_${idx}`,
        name: m.name,
        dosage: m.dosage,
        form: m.form,
        frequency: m.frequency,
        times: m.times,
        mealTiming: m.mealTiming,
        duration: `${m.durationDays || 5} days`,
        instructions: m.instructions,
      })),
      notes,
      followUpDate,
      vitals: {
        bp: '128/82 mmHg',
        pulse: '74 bpm',
        temperature: '98.4 F',
        weight: '64 kg',
      },
    });

    // Reset or navigate
    setActiveDoctorTab('dashboard');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Doctor Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-700 via-sky-600 to-indigo-800 rounded-3xl text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-white/20 text-[10px] font-bold uppercase tracking-wider rounded-md">
                Clinical Practitioner
              </span>
              <span className="text-xs text-sky-100 font-mono">Reg: MCI-2018-94124</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-1">
              {currentUser.name || 'Dr. Ananya Mukherjee'}
            </h1>
            <p className="text-xs text-sky-100 mt-0.5">
              Cardiology & Internal Medicine • Apollo City Hospital
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveDoctorTab('prescription')}
              className="px-5 py-2.5 bg-white text-indigo-800 hover:bg-sky-50 font-bold text-xs rounded-2xl shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Digital Prescription</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CLINICAL DASHBOARD */}
      {activeDoctorTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Today's Appointments</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                14
              </div>
              <span className="text-[11px] text-sky-600 font-medium">8 completed • 6 pending</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Current Live OP</span>
              <div className="text-3xl font-extrabold text-amber-500 font-display">
                #{currentOpToken}
              </div>
              <span className="text-[11px] text-amber-600 font-medium">In consultation room</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Prescriptions Issued</span>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-display">
                28
              </div>
              <span className="text-[11px] text-indigo-500 font-medium">Auto-synced to EHR & Pharmacy</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Average Patient Adherence</span>
              <div className="text-3xl font-extrabold text-emerald-600 font-display">
                91.4%
              </div>
              <span className="text-[11px] text-emerald-500 font-medium">Community monitoring active</span>
            </div>
          </div>

          {/* Live Queue Controller */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs uppercase font-bold text-sky-400">
                Hospital OPD Queue Controller
              </span>
              <h3 className="text-xl font-bold font-display">
                Currently Serving Token #{currentOpToken}
              </h3>
              <p className="text-xs text-slate-400">
                Calling next token will automatically broadcast push notifications & update patient app.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentOpToken((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Previous Token
              </button>
              <button
                onClick={() => setCurrentOpToken((prev) => prev + 1)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Call Next Token (#{currentOpToken + 1})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Today's Waiting List */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Upcoming Consultation Schedule
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center font-bold text-sm">
                      #{apt.opNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {apt.patientName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {apt.department} • Time: {apt.time} • Patient ID: {apt.patientId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDoctorTab('prescription')}
                      className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Write Rx</span>
                    </button>
                    <button
                      onClick={() => setActiveDoctorTab('records')}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                    >
                      View EHR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PATIENTS LIST */}
      {activeDoctorTab === 'patients' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Registered Patients
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Access medical history, chronic conditions, and medicine adherence records.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'CRV-2026-8942',
                name: 'Priya Sharma',
                age: 48,
                gender: 'Female',
                condition: 'Type 2 Diabetes & Mild Hypertension',
                adherence: '92%',
                lastVisit: '2026-08-15',
              },
              {
                id: 'CRV-2026-1033',
                name: 'Ramesh Sundaram',
                age: 62,
                gender: 'Male',
                condition: 'Coronary Artery Disease & Dyslipidemia',
                adherence: '88%',
                lastVisit: '2026-08-10',
              },
            ].map((p) => (
              <div
                key={p.id}
                className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
                    <p className="text-xs text-slate-500">
                      {p.age} yrs • {p.gender} • ID: {p.id}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                    {p.adherence} Adherence
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div>Diagnosis: <strong>{p.condition}</strong></div>
                  <div>Last Visit: {p.lastVisit}</div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setPatientName(p.name);
                      setPatientId(p.id);
                      setActiveDoctorTab('prescription');
                    }}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    + New Prescription
                  </button>
                  <button
                    onClick={() => setActiveDoctorTab('records')}
                    className="py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
                  >
                    EHR Records
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CREATE DIGITAL PRESCRIPTION GENERATOR */}
      {activeDoctorTab === 'prescription' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Digital Prescription Generator (Auto-Sync)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Submitting this prescription automatically converts medicines into patient alarms, creates an EHR entry, and alerts the pharmacy dispensary!
              </p>
            </div>
          </div>

          <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
            {/* Patient Credentials Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Patient Information & Vitals
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Patient ID / UHID</label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Clinical Diagnosis</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Medicine Items List */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Prescribed Medications ({medItems.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddMedItem}
                  className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Medicine</span>
                </button>
              </div>

              <div className="space-y-4">
                {medItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600">Medicine #{idx + 1}</span>
                      {medItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedItem(idx)}
                          className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-1">Medicine Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...medItems];
                            updated[idx].name = e.target.value;
                            setMedItems(updated);
                          }}
                          placeholder="e.g. Paracetamol, Metformin"
                          required
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 mb-1">Dosage</label>
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => {
                            const updated = [...medItems];
                            updated[idx].dosage = e.target.value;
                            setMedItems(updated);
                          }}
                          placeholder="500 mg / 10 ml"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 mb-1">Food Rule</label>
                        <select
                          value={item.mealTiming}
                          onChange={(e) => {
                            const updated = [...medItems];
                            updated[idx].mealTiming = e.target.value as MealTiming;
                            setMedItems(updated);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        >
                          <option value="after_food">After Food</option>
                          <option value="before_food">Before Food</option>
                          <option value="with_food">With Food</option>
                          <option value="empty_stomach">Empty Stomach</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 mb-1">Duration (Days)</label>
                        <input
                          type="number"
                          value={item.durationDays}
                          onChange={(e) => {
                            const updated = [...medItems];
                            updated[idx].durationDays = parseInt(e.target.value, 10) || 7;
                            setMedItems(updated);
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Advice & Follow-up */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Clinical Advice & Follow-up Date
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Dietary & Lifestyle Advice</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    An appointment reminder will be generated in the patient's portal.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-3xl border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>
                  Automatic integration: Auto-Generates Alarms + Records EHR + Sends to Pharmacy.
                </span>
              </div>

              <button
                type="submit"
                id="btn-issue-prescription"
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Issue & Synchronize Prescription</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PATIENT EHR RECORDS */}
      {activeDoctorTab === 'records' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              Clinical EHR Archive
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ehrRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold rounded-full">
                    {rec.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">{rec.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{rec.title}</h3>
                <p className="text-xs text-slate-500">
                  {rec.doctorName} • {rec.hospitalName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                  {rec.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
