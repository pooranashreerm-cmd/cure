import React from 'react';
import {
  Home,
  Pill,
  Calendar,
  FileText,
  Users,
  Building2,
  Star,
  PlusCircle,
  Stethoscope,
  Activity,
  ClipboardList,
  Store,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentRole,
    activePatientTab,
    setActivePatientTab,
    activeDoctorTab,
    setActiveDoctorTab,
    activeChwTab,
    setActiveChwTab,
    activePharmacyTab,
    setActivePharmacyTab,
    setAiAssistantOpen,
    t,
  } = useApp();

  const patientNav = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'medicines', label: 'Medicines', icon: Pill },
    { key: 'appointments', label: 'Appointments & Queue', icon: Calendar },
    { key: 'records', label: 'My Health Records (EHR)', icon: FileText },
    { key: 'family', label: 'My Family Access', icon: Users },
    { key: 'hospitals', label: 'Nearby Hospitals', icon: Building2 },
    { key: 'feedback', label: 'Doctor Feedback', icon: Star },
  ];

  const doctorNav = [
    { key: 'dashboard', label: 'Clinical Dashboard', icon: Activity },
    { key: 'patients', label: 'My Patients', icon: Users },
    { key: 'prescription', label: '+ Create Prescription', icon: PlusCircle },
    { key: 'records', label: 'Patient EHR Records', icon: FileText },
  ];

  const chwNav = [
    { key: 'dashboard', label: 'Community Dashboard', icon: Activity },
    { key: 'patients', label: 'Assigned Patients', icon: Users },
    { key: 'adherence', label: 'Medicine Adherence', icon: Pill },
    { key: 'tasks', label: 'Field Visit Tasks', icon: ClipboardList },
  ];

  const pharmacyNav = [
    { key: 'dashboard', label: 'Dispensary Orders', icon: Store },
    { key: 'prescriptions', label: 'Incoming Prescriptions', icon: FileText },
    { key: 'refills', label: 'Automated Refills', icon: RefreshCw },
  ];

  const renderNavItems = () => {
    if (currentRole === 'patient') {
      return patientNav.map((item) => {
        const Icon = item.icon;
        const isActive = activePatientTab === item.key;
        return (
          <button
            key={item.key}
            id={`side-nav-patient-${item.key}`}
            onClick={() => setActivePatientTab(item.key)}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${
              isActive
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">{item.label}</span>
          </button>
        );
      });
    }

    if (currentRole === 'doctor') {
      return doctorNav.map((item) => {
        const Icon = item.icon;
        const isActive = activeDoctorTab === item.key;
        return (
          <button
            key={item.key}
            id={`side-nav-doctor-${item.key}`}
            onClick={() => setActiveDoctorTab(item.key)}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${
              isActive
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">{item.label}</span>
          </button>
        );
      });
    }

    if (currentRole === 'community_worker') {
      return chwNav.map((item) => {
        const Icon = item.icon;
        const isActive = activeChwTab === item.key;
        return (
          <button
            key={item.key}
            id={`side-nav-chw-${item.key}`}
            onClick={() => setActiveChwTab(item.key)}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${
              isActive
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span className="truncate">{item.label}</span>
          </button>
        );
      });
    }

    return pharmacyNav.map((item) => {
      const Icon = item.icon;
      const isActive = activePharmacyTab === item.key;
      return (
        <button
          key={item.key}
          id={`side-nav-pharmacy-${item.key}`}
          onClick={() => setActivePharmacyTab(item.key)}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${
            isActive
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
          <span className="truncate">{item.label}</span>
        </button>
      );
    });
  };

  return (
    <aside className="hidden md:flex flex-col w-64 p-4 shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 space-y-6">
      <div className="space-y-1">{renderNavItems()}</div>

      {/* Curevia AI Promo Card */}
      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-sky-950/40 border border-indigo-100 dark:border-indigo-800/60 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Curevia AI Assistant</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Need help understanding medicine dosage or hospital appointments?
        </p>
        <button
          id="btn-sidebar-ask-ai"
          onClick={() => setAiAssistantOpen(true)}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Ask Assistant</span>
        </button>
      </div>

      {/* Privacy badge */}
      <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>End-to-End EHR Encrypted</span>
      </div>
    </aside>
  );
};
