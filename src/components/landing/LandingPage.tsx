import React from 'react';
import {
  HeartPulse,
  Pill,
  Calendar,
  FileText,
  Users,
  ShieldCheck,
  Globe,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Store,
  Volume2,
  Bell,
  Clock,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { UserRole } from '../../types';
import { ScrollBackgroundAnimation } from '../common/ScrollBackgroundAnimation';
import { ScrollShowcaseSection } from './ScrollShowcaseSection';

interface LandingPageProps {
  onEnterApp: (role?: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { setAuthModalOpen, t, language, theme, toggleTheme } = useApp();

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-white transition-colors overflow-x-hidden relative">
      {/* Global Visible Background Animation */}
      <ScrollBackgroundAnimation
        isGlobalBackground={true}
        defaultOpacity={0.92}
        initialMode="loop"
        showFloatingControls={true}
      />

      {/* Landing Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight font-display bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                Curevia
              </span>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Global Healthcare & EHR
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#motion-experience" className="hover:text-sky-600 dark:hover:text-sky-400 transition flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Motion Journey</span>
            </a>
            <a href="#features" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              Features
            </a>
            <a href="#ecosystem" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              Ecosystem
            </a>
            <a href="#multilingual" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              Global Access
            </a>
            <a href="#ehr" className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              Digital EHR
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-landing-theme-toggle"
              onClick={toggleTheme}
              className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 hover:text-slate-900 transition" />
              )}
            </button>
            <LanguageSelector />
            <button
              onClick={() => onEnterApp('patient')}
              className="hidden sm:inline-flex px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-sky-600 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => onEnterApp('patient')}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-sky-500/25 hover:shadow-lg transition cursor-pointer"
            >
              {t('getStarted')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Next-Generation Healthcare Companion</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] font-display">
                {t('heroTitle')}
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
                {t('heroSubtitle')}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  id="hero-get-started"
                  onClick={() => onEnterApp('patient')}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-base font-bold rounded-2xl shadow-xl shadow-sky-500/25 hover:scale-[1.02] active:scale-98 transition flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>{t('getStarted')}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  id="hero-explore-demo"
                  onClick={() => onEnterApp('patient')}
                  className="w-full sm:w-auto px-7 py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-base font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t('exploreCurevia')}</span>
                </button>
              </div>

              {/* Ecosystem Role Quick Selectors */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Explore Role-Based Interfaces
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { role: 'patient' as UserRole, label: 'Patient View', icon: Users, color: 'sky' },
                    { role: 'doctor' as UserRole, label: 'Doctor Clinical', icon: Stethoscope, color: 'indigo' },
                    { role: 'community_worker' as UserRole, label: 'Community Worker', icon: HeartPulse, color: 'emerald' },
                    { role: 'pharmacy' as UserRole, label: 'Pharmacy', icon: Store, color: 'amber' },
                  ].map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.role}
                        onClick={() => onEnterApp(r.role)}
                        className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition text-left cursor-pointer group"
                      >
                        <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400 mb-1 group-hover:scale-110 transition" />
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {r.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Animated Healthcare Ecosystem Visual & Floating Cards */}
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[460px]">
              {/* Animated Central Node: Patient -> Doctor -> Community Worker -> Pharmacy */}
              <div className="relative z-10 w-64 h-64 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-sky-200/80 dark:border-sky-800/80 shadow-2xl p-6 flex flex-col items-center justify-between text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                  <HeartPulse className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    Curevia Unified Care
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Seamless synchronization across healthcare stakeholders
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Real-time Sync Active
                </div>
              </div>

              {/* Floating Card 1: Medicine Reminder (Top Left) */}
              <div className="absolute -top-4 -left-4 sm:left-0 z-20 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-sky-100 dark:border-slate-700 flex items-center gap-3 animate-gentle-pulse">
                <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('medicineReminder')}
                  </div>
                  <div className="text-[10px] text-slate-500">Paracetamol 500mg • 08:00 AM</div>
                </div>
              </div>

              {/* Floating Card 2: Doctor Prescription (Top Right) */}
              <div className="absolute top-2 -right-4 sm:right-2 z-20 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-indigo-100 dark:border-slate-700 flex items-center gap-3 hover:scale-105 transition">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('doctorPrescription')}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-semibold">Auto-Synced to Schedule</div>
                </div>
              </div>

              {/* Floating Card 3: Appointment Reminder (Bottom Left) */}
              <div className="absolute bottom-4 -left-6 sm:left-4 z-20 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-emerald-100 dark:border-slate-700 flex items-center gap-3 hover:scale-105 transition">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('appointmentReminder')}
                  </div>
                  <div className="text-[10px] text-slate-500">OP #24 • Dr. Ananya Mukherjee</div>
                </div>
              </div>

              {/* Floating Card 4: EHR Record (Bottom Right) */}
              <div className="absolute -bottom-4 right-0 sm:right-4 z-20 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-amber-100 dark:border-slate-700 flex items-center gap-3 animate-gentle-pulse">
                <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('ehrRecord')}
                  </div>
                  <div className="text-[10px] text-slate-500">Blood Panel & X-Ray Encrypted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Care Workflow Motion & Scroll Animation Showcase */}
      <ScrollShowcaseSection onExplore={onEnterApp} />

      {/* Interactive Core Pillars */}
      <section id="features" className="py-16 bg-white/75 dark:bg-slate-950/75 backdrop-blur-md border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest font-bold text-sky-600 dark:text-sky-400">
              Complete Healthcare Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
              Designed for Global Accessibility
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Connecting community health workers, hospitals, pharmacies, and patients in a single unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Smart Medicine Alarm',
                desc: '5-minute & 2-minute alerts with realistic alarms, voice guidance, and low-literacy mode.',
                icon: Pill,
                color: 'sky',
              },
              {
                title: 'Auto-Prescription Sync',
                desc: 'Doctors generate digital prescriptions which automatically generate reminder schedules.',
                icon: FileText,
                color: 'indigo',
              },
              {
                title: 'AI Health Voice Calls',
                desc: 'Automated simulated voice calls remind patients of upcoming hospital appointments.',
                icon: Volume2,
                color: 'emerald',
              },
              {
                title: 'Secure EHR & Family',
                desc: 'Digitize X-rays, blood reports, and lab documents with granular consent control.',
                icon: ShieldCheck,
                color: 'amber',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-700/80 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-xl transition space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="py-12 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold font-display">Curevia</span>
              <p className="text-xs text-slate-400">Your Health. Your Records. Your Reminder.</p>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 Curevia Healthcare Systems. Multilingual EHR Companion for Global Communities.
          </div>

          <button
            onClick={() => onEnterApp('patient')}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition shadow-md"
          >
            Launch Curevia Web App →
          </button>
        </div>
      </footer>
    </div>
  );
};
