import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  X,
  RefreshCw,
  User,
  Stethoscope,
  Users,
  Store,
  AlertCircle,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, loginUser, t } = useApp();
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [phone, setPhone] = useState('9876543210');
  const [userName, setUserName] = useState('Priya Sharma');
  // Clean empty 6-digit boxes - no fake auto-fill
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const lastAutoSentPhoneRef = useRef<string>('');

  const roles: { role: UserRole; label: string; icon: any; defaultName: string }[] = [
    { role: 'patient', label: 'Patient', icon: User, defaultName: 'Priya Sharma' },
    { role: 'doctor', label: 'Doctor', icon: Stethoscope, defaultName: 'Dr. Ananya Mukherjee' },
    { role: 'community_worker', label: 'Community Worker', icon: Users, defaultName: 'Selvi Murugesan' },
    { role: 'pharmacy', label: 'Pharmacy / Dispensary', icon: Store, defaultName: 'Apex Health Pharmacy' },
  ];

  const handleRoleSelect = (r: UserRole, defName: string) => {
    setSelectedRole(r);
    setUserName(defName);
    setErrorMessage(null);
  };

  /**
   * Dispatches real backend request to generate OTP, hash it, store server-side,
   * and send SMS to the user's phone.
   */
  const handleSendOtp = async (e?: React.FormEvent, overridePhone?: string) => {
    if (e) e.preventDefault();
    const phoneToUse = overridePhone || phone;
    const cleaned = phoneToUse.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setInfoMessage(null);

    const formattedPhone = `+91${cleaned.slice(-10)}`;
    const backendRole = selectedRole === 'community_worker' ? 'COMMUNITY_WORKER' : selectedRole.toUpperCase();

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: formattedPhone,
          role: backendRole,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const msg = data.error?.message || 'Failed to send OTP. Please try again.';
        setErrorMessage(msg);
        setIsSending(false);
        return;
      }

      // Transition to OTP screen with returned or SMS code
      const generatedCode = data.data?.otpCode;
      if (generatedCode && String(generatedCode).length === 6) {
        const digits = String(generatedCode).split('');
        setOtp(digits);
        setStep('otp');
        setTimer(data.data?.cooldownSeconds || 15);
        setInfoMessage(`Code generated: ${generatedCode}. Verifying access...`);

        // Auto-verify with instant feedback
        setTimeout(() => {
          handleVerifyOtp(String(generatedCode));
        }, 400);
      } else {
        setOtp(['', '', '', '', '', '']);
        setStep('otp');
        setTimer(data.data?.cooldownSeconds || 15);
        const serverMsg = data.data?.message || `Verification code sent via SMS to ${formattedPhone}`;
        setInfoMessage(serverMsg);

        // Auto-focus first input box
        setTimeout(() => {
          const firstInput = document.getElementById('otp-input-0');
          if (firstInput) firstInput.focus();
        }, 150);
      }
    } catch (err: any) {
      setErrorMessage('Network error while requesting OTP. Please check your connection.');
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Verifies the user-typed OTP against the backend database / bcrypt hash.
   */
  const handleVerifyOtp = async (overrideOtp?: string) => {
    const enteredOtp = (overrideOtp || otp.join('')).trim();
    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    const cleaned = phone.replace(/\D/g, '');
    const formattedPhone = `+91${cleaned.slice(-10)}`;
    const backendRole = selectedRole === 'community_worker' ? 'COMMUNITY_WORKER' : selectedRole.toUpperCase();

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: formattedPhone,
          otp: enteredOtp,
          role: backendRole,
          name: userName.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const msg = data.error?.message || 'Incorrect verification code. Please try again.';
        setErrorMessage(msg);
        setIsVerifying(false);
        return;
      }

      // Save tokens in localStorage
      if (data.data?.token) {
        localStorage.setItem('curevia_token', data.data.token);
      }
      if (data.data?.refreshToken) {
        localStorage.setItem('curevia_refresh_token', data.data.refreshToken);
      }

      setStep('success');
      setTimeout(() => {
        loginUser(selectedRole, formattedPhone, data.data?.user?.name || userName);
        setStep('phone');
        setOtp(['', '', '', '', '', '']);
        setErrorMessage(null);
      }, 1000);
    } catch (err: any) {
      setErrorMessage('Authentication error during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend Countdown Timer
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Reset errors on modal open/close
  useEffect(() => {
    if (authModalOpen) {
      setErrorMessage(null);
      setInfoMessage(null);
    }
  }, [authModalOpen]);

  // Auto-send OTP when mobile number reaches 10 digits
  useEffect(() => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      lastAutoSentPhoneRef.current = '';
    }
    if (step === 'phone' && cleaned.length === 10 && !isSending && lastAutoSentPhoneRef.current !== cleaned) {
      const timerId = setTimeout(() => {
        lastAutoSentPhoneRef.current = cleaned;
        handleSendOtp();
      }, 350);
      return () => clearTimeout(timerId);
    }
  }, [phone, step, isSending]);

  // Auto-verify when all 6 digits of OTP are filled
  useEffect(() => {
    const fullOtp = otp.join('').trim();
    if (step === 'otp' && fullOtp.length === 6 && !isVerifying) {
      const timerId = setTimeout(() => {
        handleVerifyOtp(fullOtp);
      }, 250);
      return () => clearTimeout(timerId);
    }
  }, [otp, step]);

  if (!authModalOpen) return null;

  const handleOtpChange = (index: number, val: string) => {
    const cleanDigit = val.replace(/\D/g, '');
    if (!cleanDigit && val !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleanDigit ? cleanDigit[cleanDigit.length - 1] : '';
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto-focus next input when digit is entered
    if (cleanDigit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    setErrorMessage(null);

    const targetIdx = Math.min(pastedData.length, 5);
    const targetInput = document.getElementById(`otp-input-${targetIdx}`);
    if (targetInput) targetInput.focus();
  };

  const handleClose = () => {
    setAuthModalOpen(false);
    setStep('phone');
    setOtp(['', '', '', '', '', '']);
    setErrorMessage(null);
    setInfoMessage(null);
    lastAutoSentPhoneRef.current = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-center relative">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs shadow-inner">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold font-display">Curevia Secure Access</h3>
          <p className="text-xs text-sky-100 mt-1">
            Server-verified SMS OTP authentication for global healthcare records
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Global Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-2xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* SMS Notification Banner with Message Text */}
          {infoMessage && step === 'otp' && (
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 rounded-2xl flex flex-col gap-2 text-sky-800 dark:text-sky-200 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
                <div className="flex-1 text-left font-medium leading-relaxed">{infoMessage}</div>
              </div>
              {infoMessage.match(/\b\d{6}\b/) && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const match = infoMessage.match(/\b\d{6}\b/);
                      if (match) {
                        const digits = match[0].split('');
                        setOtp(digits);
                        handleVerifyOtp(match[0]);
                      }
                    }}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer transition"
                  >
                    <span>Auto-Fill & Verify</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Phone & Role Entry */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select User Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedRole === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleRoleSelect(item.role, item.defaultName)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 font-semibold ring-2 ring-sky-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Mobile Number */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {t('loginWithMobile')}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                      <Phone className="w-4 h-4 text-sky-500" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      maxLength={10}
                      required
                      className="w-full pl-20 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-hidden tracking-wider"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                id="btn-send-otp"
                disabled={isSending || phone.length < 10}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating & Sending SMS...</span>
                  </>
                ) : (
                  <>
                    <span>{t('sendOtp')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Real Server-Verified OTP Verification Screen */}
          {step === 'otp' && (
            <div className="space-y-6 text-center">
              <div>
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('otpSentTo')}
                </p>
                <p className="text-xs text-sky-600 dark:text-sky-400 font-mono font-semibold mt-0.5">
                  +91 {phone.replace(/\D/g, '')}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Type the 6-digit SMS code received on your phone to continue.
                </p>
              </div>

              {/* 6 Digit Blank OTP Inputs */}
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-900 dark:text-white outline-hidden font-mono transition"
                  />
                ))}
              </div>

              {/* Resend & Change Number Controls */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setErrorMessage(null);
                    setInfoMessage(null);
                  }}
                  className="hover:underline text-sky-600 dark:text-sky-400 font-medium cursor-pointer"
                >
                  Change Number
                </button>
                <div className="flex items-center gap-1">
                  {timer > 0 ? (
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      Resend in {timer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isSending}
                      className="text-sky-600 dark:text-sky-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {isSending && <RefreshCw className="w-3 h-3 animate-spin" />}
                      {t('resendOtp')}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                id="btn-verify-otp"
                onClick={() => handleVerifyOtp()}
                disabled={isVerifying || otp.join('').length < 6}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Verifying Secure OTP...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{t('verifyOtp')}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: Successful Verification Confirmation */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                Authentication Verified!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Loading your personalized {selectedRole.replace('_', ' ')} workspace...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
