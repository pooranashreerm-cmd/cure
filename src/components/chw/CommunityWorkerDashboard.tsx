import React, { useState } from 'react';
import {
  Users,
  Pill,
  Activity,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  Search,
  Plus,
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VoiceButton } from '../common/VoiceButton';

export const CommunityWorkerDashboard: React.FC = () => {
  const { currentUser, activeChwTab, setActiveChwTab, communityPatients, updateCommunityPatient, t, speak } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<any | null>(null);
  const [visitNotes, setVisitNotes] = useState('');

  const filteredPatients = communityPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.villageOrZone || p.village || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogVisit = (patientId: string) => {
    updateCommunityPatient(patientId, { adherenceRate: 96, notes: visitNotes || 'Routine field visit conducted.' });
    setSelectedPatientForVisit(null);
    setVisitNotes('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* CHW Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 rounded-3xl text-white shadow-xl space-y-2 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-white/20 text-[10px] font-bold uppercase tracking-wider rounded-md">
                Community Health Companion
              </span>
              <span className="text-xs text-emerald-100 font-mono">ID: CHW-TN-402</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-1">
              {currentUser.name || 'Rajesh Kumar'}
            </h1>
            <p className="text-xs text-emerald-100">
              Assigned Field Sector: Ramanathapuram & Keelakarai Rural Blocks (42 Active Households)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                speak(
                  'Community health worker sync active. You have 3 home visits scheduled today for elderly medicine adherence.'
                )
              }
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-bold flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Voice Briefing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Monitored Patients</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {communityPatients.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">100% rural block coverage</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Average Adherence</span>
          <div className="text-3xl font-extrabold text-emerald-600 font-display">
            91.8%
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">+4.2% since voice reminders</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Pending Field Visits</span>
          <div className="text-3xl font-extrabold text-amber-500 font-display">
            3
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Scheduled for this afternoon</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">High Risk Alerts</span>
          <div className="text-3xl font-extrabold text-rose-500 font-display">
            1
          </div>
          <span className="text-[11px] text-rose-500 font-medium">Missed BP dose (Meenakshi)</span>
        </div>
      </div>

      {/* Search & Patient Roster */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Assigned Community Patient Roster
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, village, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((p) => (
            <div
              key={p.id}
              className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h4>
                    <span className="text-xs text-slate-400">({p.age} yrs • {p.gender})</span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{p.villageOrZone || p.village || 'Ramanathapuram Rural'}, {p.address}</span>
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    p.adherenceRate >= 90
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {p.adherenceRate}% Adherence
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Conditions:</span>
                  <span className="font-semibold">{p.conditions ? p.conditions.join(', ') : p.chronicCondition || 'Diabetes & Hypertension'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Prescriptions:</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    {p.activeMedicines ? p.activeMedicines.join(', ') : `${p.activePrescriptionsCount || 3} Active Rx`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Next Scheduled Visit:</span>
                  <span>{p.nextAppointmentDate || p.nextVisitDate || '2026-08-25'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href={`tel:${p.phone}`}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Patient</span>
                </a>

                <button
                  onClick={() => setSelectedPatientForVisit(p)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Log Field Visit & Pill Check</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Field Visit Modal */}
      {selectedPatientForVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              Log Home Visit: {selectedPatientForVisit.name}
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs space-y-1">
              <div>Village: <strong>{selectedPatientForVisit.village}</strong></div>
              <div>Medicines: {selectedPatientForVisit.activeMedicines.join(', ')}</div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold">Field Observation Notes</label>
              <textarea
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Inspected physical medicine strips, verified morning dose taken, demonstrated voice reminder."
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPatientForVisit(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleLogVisit(selectedPatientForVisit.id)}
                className="px-6 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Confirm Visit Logged
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
