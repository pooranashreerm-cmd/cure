import React from 'react';
import { Home, Pill, Calendar, FileText, Users, PlusCircle, Activity, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
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
  } = useApp();

  if (currentRole === 'patient') {
    const items = [
      { key: 'home', label: 'Home', icon: Home },
      { key: 'medicines', label: 'Medicines', icon: Pill },
      { key: 'appointments', label: 'Visits', icon: Calendar },
      { key: 'records', label: 'EHR', icon: FileText },
      { key: 'family', label: 'Family', icon: Users },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex justify-around items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activePatientTab === item.key;
          return (
            <button
              key={item.key}
              id={`mobile-nav-${item.key}`}
              onClick={() => setActivePatientTab(item.key)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  if (currentRole === 'doctor') {
    const items = [
      { key: 'dashboard', label: 'Dashboard', icon: Activity },
      { key: 'patients', label: 'Patients', icon: Users },
      { key: 'prescription', label: '+ Rx Prescribe', icon: PlusCircle },
      { key: 'records', label: 'EHR Records', icon: FileText },
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex justify-around items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeDoctorTab === item.key;
          return (
            <button
              key={item.key}
              id={`mobile-nav-doc-${item.key}`}
              onClick={() => setActiveDoctorTab(item.key)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition min-w-[56px] min-h-[48px] ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return null;
};
