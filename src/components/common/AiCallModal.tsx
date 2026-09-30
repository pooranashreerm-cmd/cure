import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Sparkles, X, CheckCircle2, Volume2, Calendar, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speakText, stopSpeech } from '../../utils/speech';

export const AiCallModal: React.FC = () => {
  const { aiCallModalOpen, setAiCallModalOpen, activeCallAppointment, language, t, showToast } = useApp();
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'completed'>('incoming');
  const [duration, setDuration] = useState(0);

  const apt = activeCallAppointment;

  const scriptText = `Hello! This is Curevia AI Health Assistant. This is an automated voice reminder for your upcoming appointment with ${
    apt?.doctorName || 'your doctor'
  } at ${apt?.hospitalName || 'the clinic'} scheduled on ${apt?.date || 'tomorrow'} at ${
    apt?.time || '10:30 AM'
  }. Please remember to bring your previous prescriptions and electronic health records. Your token number is #${
    apt?.opNumber || '24'
  }. Have a healthy day!`;

  useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  if (!aiCallModalOpen || !apt) return null;

  const handleAnswer = () => {
    setCallState('connected');
    speakText(scriptText, language, () => {
      setTimeout(() => {
        setCallState('completed');
      }, 1000);
    });
  };

  const handleEndCall = () => {
    stopSpeech();
    setCallState('completed');
    setTimeout(() => {
      setAiCallModalOpen(false);
      setCallState('incoming');
      setDuration(0);
      showToast('AI Health Call completed.');
    }, 1200);
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-800 relative">
          <button
            onClick={() => {
              stopSpeech();
              setAiCallModalOpen(false);
            }}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Health Call Service
          </div>

          <h3 className="text-xl font-bold font-display">Curevia Automated Voice</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {callState === 'incoming'
              ? 'Incoming appointment alert...'
              : callState === 'connected'
              ? `In Call • ${formatDuration(duration)}`
              : 'Call Ended • Reminders Synced'}
          </p>
        </div>

        {/* Call Animation / Visualizer */}
        <div className="p-8 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-xl ${
                callState === 'connected' ? 'animate-gentle-pulse ring-8 ring-sky-500/30' : ''
              }`}
            >
              <Phone className="w-12 h-12 text-white" />
            </div>

            {callState === 'connected' && (
              <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-full ring-4 ring-slate-900">
                <Mic className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Waveform indicator */}
          {callState === 'connected' && (
            <div className="flex items-center gap-1.5 h-8">
              {[40, 70, 90, 60, 100, 75, 45, 85, 95, 60, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-sky-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Appointment Quick Info */}
          <div className="w-full bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                {apt.date} • {apt.time}
              </span>
              <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 font-bold rounded-md">
                OP #{apt.opNumber}
              </span>
            </div>
            <p className="text-sm font-semibold text-white">{apt.doctorName}</p>
            <p className="text-xs text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              {apt.hospitalName}
            </p>
          </div>

          {/* Spoken Transcript Preview */}
          <div className="w-full bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 text-left max-h-24 overflow-y-auto">
            <span className="text-sky-400 font-medium">Transcript: </span>
            <span>"{scriptText}"</span>
          </div>

          {/* Action buttons */}
          <div className="w-full flex items-center justify-center gap-6 pt-2">
            {callState === 'incoming' && (
              <>
                <button
                  onClick={handleAnswer}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  Answer Call
                </button>
                <button
                  onClick={() => setAiCallModalOpen(false)}
                  className="py-3.5 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <PhoneOff className="w-5 h-5" />
                  Decline
                </button>
              </>
            )}

            {callState === 'connected' && (
              <button
                onClick={handleEndCall}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                End Call
              </button>
            )}

            {callState === 'completed' && (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Reminder Acknowledged & Logged
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
