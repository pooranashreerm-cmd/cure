import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speakText, stopSpeech } from '../../utils/speech';

interface VoiceButtonProps {
  textToSpeak: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  textToSpeak,
  label = 'Listen',
  size = 'md',
  className = '',
  variant = 'secondary',
}) => {
  const { language } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(textToSpeak, language, () => {
        setIsPlaying(false);
      });
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2.5 text-base gap-2 font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-sky-600 hover:bg-sky-700 text-white shadow-sm hover:shadow active:scale-95',
    secondary:
      'bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:hover:bg-sky-900 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
    ghost:
      'text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800/80',
    icon:
      'text-sky-600 dark:text-sky-400 hover:bg-sky-100/60 dark:hover:bg-slate-800 rounded-full p-2',
  };

  return (
    <button
      type="button"
      id={`voice-btn-${textToSpeak.slice(0, 10).replace(/\s+/g, '-').toLowerCase()}`}
      onClick={handleSpeak}
      title={isPlaying ? 'Stop speaking' : `Read aloud: "${textToSpeak}"`}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        isPlaying ? 'ring-2 ring-sky-400 animate-gentle-pulse' : ''
      } ${className}`}
      aria-label="Voice assistance audio button"
    >
      {isPlaying ? (
        <VolumeX className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
      ) : (
        <Volume2 className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
      )}
      {variant !== 'icon' && (
        <span className="truncate">{isPlaying ? 'Playing...' : label}</span>
      )}
    </button>
  );
};
