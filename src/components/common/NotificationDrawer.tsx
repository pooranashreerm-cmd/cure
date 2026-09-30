import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Pill,
  Calendar,
  PhoneCall,
  FileText,
  Building2,
  Users,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationType } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    triggerMedicineAlarm,
    medicines,
    startAiCall,
    appointments,
    setActivePatientTab,
    setCurrentRole,
    t,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (!isOpen) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'medicine_reminder':
        return <Pill className="w-4 h-4 text-sky-500" />;
      case 'appointment_reminder':
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      case 'ai_call':
        return <PhoneCall className="w-4 h-4 text-emerald-500" />;
      case 'new_prescription':
        return <FileText className="w-4 h-4 text-violet-500" />;
      case 'hospital_update':
        return <Building2 className="w-4 h-4 text-amber-500" />;
      case 'family_access':
        return <Users className="w-4 h-4 text-rose-500" />;
      case 'medicine_refill':
        return <RefreshCw className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-sky-500" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    return n.type === activeFilter;
  });

  const handleNotificationClick = (item: any) => {
    markNotificationRead(item.id);

    if (item.type === 'medicine_reminder' && item.metadata?.medicineName) {
      const match = medicines.find((m) => m.name.toLowerCase().includes(item.metadata.medicineName.toLowerCase()));
      if (match) {
        onClose();
        triggerMedicineAlarm(match);
      }
    } else if (item.type === 'appointment_reminder' || item.type === 'ai_call') {
      const apt = appointments[0];
      if (apt) {
        onClose();
        startAiCall(apt);
      }
    } else if (item.type === 'family_access') {
      onClose();
      setCurrentRole('patient');
      setActivePatientTab('family');
    } else if (item.type === 'new_prescription') {
      onClose();
      setCurrentRole('patient');
      setActivePatientTab('records');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  {t('notifications')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {notifications.filter((n) => !n.read).length} unread updates
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Ribbon & Filters */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
              <button
                onClick={clearNotifications}
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'medicine_reminder', label: '💊 Medicines' },
                { key: 'appointment_reminder', label: '📅 Visits' },
                { key: 'medicine_refill', label: '🔄 Refills' },
                { key: 'family_access', label: '👨‍👩‍👧 Family' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition cursor-pointer ${
                    activeFilter === f.key
                      ? 'bg-sky-600 text-white font-medium shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Bell className="w-10 h-10 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium">No notifications in this filter</p>
              </div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    !n.read
                      ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/80 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {n.title}
                        </h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {n.timestamp}
                        </span>
                        <span className="text-sky-600 dark:text-sky-400 font-medium hover:underline">
                          View details →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
