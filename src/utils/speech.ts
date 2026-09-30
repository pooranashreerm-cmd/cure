import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from './translations';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a rich synthesized audio alert using Web Audio API
 */
export function playSynthesizedAlarm(soundType: 'gentle-chime' | 'pulse-beep' | 'zen-bell' | 'marimba' = 'gentle-chime') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (soundType === 'pulse-beep') {
      // 3 rhythmic medical alert beeps
      [0, 0.25, 0.5, 0.9, 1.15, 1.4].forEach((timeOffset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(i % 3 === 2 ? 880 : 660, now + timeOffset);
        
        gain.gain.setValueAtTime(0, now + timeOffset);
        gain.gain.linearRampToValueAtTime(0.3, now + timeOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.2);
      });
    } else if (soundType === 'zen-bell') {
      // Warm meditative chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(432, now);
      
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.5);
    } else if (soundType === 'marimba') {
      // Cheerful multi-tone arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.45);
      });
    } else {
      // Gentle Hospital Chime (Default)
      const frequencies = [587.33, 880, 1174.66]; // D5, A5, D6
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        gain.gain.setValueAtTime(0, now + idx * 0.18);
        gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.18 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.75);
      });
    }
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
}

/**
 * Text-to-Speech narration in the target language
 */
export function speakText(text: string, languageCode: LanguageCode = 'en', onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this environment');
    playSynthesizedAlarm('gentle-chime');
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending speech

  const utterance = new SpeechSynthesisUtterance(text);
  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === languageCode);
  utterance.lang = langObj?.speechCode || 'en-US';
  utterance.rate = 0.95; // Slightly clear and gentle pace for elderly/patients
  utterance.pitch = 1.0;

  // Attempt to select the best matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(languageCode) || v.lang.includes(langObj?.speechCode || ''));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
