import React, { useState } from 'react';
import {
  HeartPulse,
  Bell,
  Sun,
  Moon,
  Accessibility,
  LogOut,
  User,
  Stethoscope,
  Users,
  Store,
  Sparkles,
  Volume2,
  Sliders,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    isLoggedIn,
    logoutUser,
    setAuthModalOpen,
    language,
    easyMode,
    setEasyMode,
    theme,
    setTheme,
    toggleTheme,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
    unreadNotificationsCount,
    setAiAssistantOpen,
    t,
  } = useApp();

  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: any }[] = [
    { role: 'patient', label: 'Patient View', icon: User },
    { role: 'doctor', label: 'Doctor Clinical', icon: Stethoscope },
    { role: 'community_worker', label: 'Community Worker', icon: Users },
    { role: 'pharmacy', label: 'Pharmacy / Dispensary', icon: Store },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => setCurrentRole(currentRole)}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
                  <HeartPulse className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent font-display">
                      Curevia
                    </span>
                    <span className="hidden md:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      Smart EHR
                    </span>
                  </div>
                  <p className="hidden lg:block text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                    {t('tagline')}
                  </p>
                </div>
              </div>

              {/* Role Switcher Pill */}
              <div className="relative">
                <button
                  id="nav-role-switcher"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-200 dark:border-slate-700"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="capitalize">{currentRole.replace('_', ' ')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setRoleDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Interface View
                      </div>
                      {roles.map((r) => {
                        const Icon = r.icon;
                        const isCurrent = currentRole === r.role;
                        return (
                          <button
                            key={r.role}
                            onClick={() => {
                              setCurrentRole(r.role);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition ${
                              isCurrent
                                ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{r.label}</span>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-sky-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Easy Mode Switcher Button (Low Literacy / Elderly Mode) */}
              <button
                id="btn-toggle-easy-mode"
                onClick={() => setEasyMode(!easyMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer ${
                  easyMode
                    ? 'bg-amber-500 text-white ring-2 ring-amber-400 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700'
                }`}
                title="Toggle Easy Mode for low-literacy & elderly patients"
              >
                <Accessibility className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {easyMode ? t('exitEasyMode') : t('easyMode')}
                </span>
              </button>

              {/* Multilingual Selector */}
              <LanguageSelector />

              {/* AI Assistant Quick Launcher */}
              <button
                onClick={() => setAiAssistantOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/10 to-sky-500/10 dark:from-indigo-950/50 dark:to-sky-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold hover:scale-105 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI Assistant</span>
              </button>

              {/* Notification Bell */}
              <button
                id="btn-notifications-drawer"
                onClick={() => setNotificationDrawerOpen(true)}
                className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* One-Click Theme Toggle Button */}
              <button
                id="btn-theme-toggle"
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

              {/* Accessibility & Theme Settings Popover */}
              <div className="relative">
                <button
                  onClick={() => setAccessibilityMenuOpen(!accessibilityMenuOpen)}
                  className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  title="Accessibility & Theme Settings"
                >
                  <Sliders className="w-5 h-5" />
                </button>

                {accessibilityMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setAccessibilityMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Display & Accessibility
                      </div>

                      {/* Dark / Light Mode */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Theme</span>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                          <button
                            onClick={() => setTheme('light')}
                            className={`p-1.5 rounded-lg ${
                              theme === 'light'
                                ? 'bg-white text-amber-500 shadow-xs'
                                : 'text-slate-400'
                            }`}
                          >
                            <Sun className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTheme('dark')}
                            className={`p-1.5 rounded-lg ${
                              theme === 'dark'
                                ? 'bg-slate-700 text-sky-400 shadow-xs'
                                : 'text-slate-400'
                            }`}
                          >
                            <Moon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Font Size Zoom */}
                      <div className="space-y-1.5">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Text Size
                        </span>
                        <div className="grid grid-cols-3 gap-1 text-xs text-center font-semibold">
                          {(['normal', 'large', 'extra-large'] as const).map((sz) => (
                            <button
                              key={sz}
                              onClick={() => setFontSize(sz)}
                              className={`py-1.5 rounded-lg border text-[11px] ${
                                fontSize === sz
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {sz === 'normal' ? 'Normal' : sz === 'large' ? 'Large' : 'XL'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* High Contrast */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">High Contrast</span>
                        <input
                          type="checkbox"
                          checked={highContrast}
                          onChange={(e) => setHighContrast(e.target.checked)}
                          className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Login / Profile */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentUser.patientId}
                    </span>
                  </div>
                  <button
                    onClick={logoutUser}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                    title="Logout session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Notification Center Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </>
  );
};
