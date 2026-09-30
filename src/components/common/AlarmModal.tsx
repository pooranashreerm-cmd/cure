import React, { useEffect } from 'react';
import { Bell, Pill, Check, Clock, Utensils, X, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { stopSpeech } from '../../utils/speech';

export const AlarmModal: React.FC = () => {
  const {
    alarmModalOpen,
    activeAlarmMedicine,
    dismissAlarm,
    markMedicineTaken,
    snoozeMedicine,
    language,
    speak,
    t,
  } = useApp();

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  if (!alarmModalOpen || !activeAlarmMedicine) return null;

  const med = activeAlarmMedicine;
  const voiceMessage = `${t('timeToTake')}! ${t('takeMedicineNow', { name: med.name, dosage: med.dosage })}. ${
    med.mealTiming === 'after_food' ? t('afterFood') : t('beforeFood')
  }.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-slate-900 border-2 border-sky-500 rounded-3xl shadow-2xl">
        {/* Header Alert Ribbon */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full animate-alarm">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sky-100">
                {t('medicineReminder')}
              </span>
              <h3 className="text-lg font-bold font-display">{t('timeToTake')}</h3>
            </div>
          </div>
          <button
            onClick={dismissAlarm}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 text-center">
          {/* Pulsing Visual Medicine Graphic */}
          <div className="mx-auto w-24 h-24 bg-sky-100 dark:bg-sky-950/80 rounded-3xl flex items-center justify-center border-2 border-sky-300 dark:border-sky-700 shadow-inner animate-gentle-pulse">
            <Pill className="w-12 h-12 text-sky-600 dark:text-sky-400 -rotate-45" />
          </div>

          {/* Medicine Details */}
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {med.name}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-bold rounded-full text-base">
                {med.dosage}
              </span>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium rounded-full text-sm flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" />
                {med.mealTiming === 'after_food'
                  ? t('afterFood')
                  : med.mealTiming === 'before_food'
                  ? t('beforeFood')
                  : t('withFood')}
              </span>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left flex items-start gap-3">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-xs shrink-0">
              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex-1 text-sm text-slate-700 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">
                Scheduled at {med.times[0] || '08:00 AM'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {med.instructions || 'Take 1 tablet with fresh drinking water.'}
              </p>
            </div>
            <button
              onClick={() => speak(voiceMessage)}
              className="p-2 bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/60 dark:hover:bg-sky-800 text-sky-700 dark:text-sky-300 rounded-xl transition cursor-pointer"
              title="Read instructions aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              id="alarm-btn-taken"
              type="button"
              onClick={() => markMedicineTaken(med.id)}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-lg font-bold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              {t('taken')}
            </button>

            <button
              id="alarm-btn-snooze"
              type="button"
              onClick={() => snoozeMedicine(med.id)}
              className="w-full py-4 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-base font-semibold rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Clock className="w-5 h-5" />
              {t('remindLater')}
            </button>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Recorded in your patient adherence profile & EHR tracker.
          </p>
        </div>
      </div>
    </div>
  );
};
