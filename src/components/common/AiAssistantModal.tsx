import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Volume2, ShieldAlert, Pill, Calendar, FileText, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiAssistantModal: React.FC = () => {
  const { aiAssistantOpen, setAiAssistantOpen, speak, language, medicines, appointments, prescriptions, t } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello! I am Curevia AI Health Assistant. I can help explain your medicine schedules, summarize doctor appointments, provide voice instructions, and navigate your digital health records. How can I assist you today?`,
      timestamp: 'Just now',
    },
  ]);

  if (!aiAssistantOpen) return null;

  const quickPrompts = [
    'What medicines should I take today?',
    'When is my next doctor appointment?',
    'Explain why Paracetamol is taken after food',
    'How do I invite a family member?',
    'Show me how to switch to Easy Mode',
  ];

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Generate intelligent contextual response
    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('today') || lower.includes('medicine') || lower.includes('schedule')) {
        const medNames = medicines.map((m) => `${m.name} (${m.dosage}) at ${m.times.join(', ')} [${m.mealTiming.replace('_', ' ')}]`).join('; ');
        reply = `You currently have ${medicines.length} active medicines scheduled: ${medNames}. Please remember to record each as 'TAKEN' when you consume them!`;
      } else if (lower.includes('appointment') || lower.includes('doctor') || lower.includes('next')) {
        const nextApt = appointments[0];
        reply = nextApt
          ? `Your next appointment is with ${nextApt.doctorName} at ${nextApt.hospitalName} on ${nextApt.date} at ${nextApt.time}. Your OP Queue Token is #${nextApt.opNumber}.`
          : 'You currently have no pending hospital appointments scheduled.';
      } else if (lower.includes('paracetamol') || lower.includes('food')) {
        reply = `Paracetamol is recommended to be taken after food or with plenty of water to protect your stomach lining and prevent gastric irritation. Never exceed the dosage prescribed by your doctor.`;
      } else if (lower.includes('family') || lower.includes('invite')) {
        reply = `To invite a family member, go to the 'My Family' section in the menu. Tap '+ Add Family Member' and enter their details. They will only receive access after you explicitly review and approve their request!`;
      } else if (lower.includes('easy mode') || lower.includes('elderly') || lower.includes('large')) {
        reply = `You can toggle Easy Mode at any time using the 'Easy Mode' button on your dashboard header. It enlarges all buttons, uses high-contrast icons, and provides one-tap voice instructions for all medicines.`;
      } else {
        reply = `I am here to help you manage your reminders and records. For clinical questions or adjusting your dosage, please consult your doctor. Would you like me to read your current medicine schedule aloud?`;
      }

      const aiMsg: Message = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[700px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display">{t('aiAssistant')}</h3>
                <span className="px-2 py-0.5 bg-white/20 text-sky-100 text-[10px] uppercase font-bold tracking-wider rounded-md">
                  Non-Diagnostic
                </span>
              </div>
              <p className="text-xs text-sky-100">Smart medicine schedules, voice guidance & navigation</p>
            </div>
          </div>
          <button
            onClick={() => setAiAssistantOpen(false)}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Ribbon */}
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200/60 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Medical Disclaimer:</strong> Curevia AI provides assistance and reminders. Medical decisions should be made by qualified healthcare professionals.
          </span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  m.sender === 'user'
                    ? 'bg-sky-600'
                    : 'bg-gradient-to-tr from-indigo-600 to-sky-600 shadow-sm'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs rounded-tl-xs'
                }`}
              >
                <p>{m.text}</p>
                {m.sender === 'ai' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                    <button
                      onClick={() => speak(m.text)}
                      className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Listen
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 text-xs whitespace-nowrap bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything about medicines, reminders, appointments..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm border-0 focus:ring-2 focus:ring-sky-500 outline-hidden"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="p-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-xl shadow-md transition cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
