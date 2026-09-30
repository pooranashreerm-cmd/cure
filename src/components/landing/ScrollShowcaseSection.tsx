import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Pill,
  FileText,
  ShieldCheck,
  Stethoscope,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import { TOTAL_FRAMES, getFrameUrl } from '../common/ScrollBackgroundAnimation';
import { useApp } from '../../context/AppContext';

interface ScrollShowcaseSectionProps {
  onExplore: (role?: any) => void;
}

const MILESTONES = [
  {
    phase: 'Phase 01',
    range: [1, 6],
    title: 'Smart Health Ingestion',
    icon: Activity,
    color: 'sky',
    description: 'Vitals, medication regimens, and patient schedules are cataloged with instant optical clarity.',
  },
  {
    phase: 'Phase 02',
    range: [7, 13],
    title: 'Autonomous Alert Engine',
    icon: Pill,
    color: 'indigo',
    description: '5-minute & 2-minute progressive audio chimes, visual flashing alarms, and voice synthesized alerts.',
  },
  {
    phase: 'Phase 03',
    range: [14, 19],
    title: 'Clinical & Pharmacy Synergy',
    icon: Stethoscope,
    color: 'emerald',
    description: 'Direct prescription dispatch from doctor consultations to licensed pharmacy fulfillment.',
  },
  {
    phase: 'Phase 04',
    range: [20, 25],
    title: 'Zero-Knowledge Encrypted EHR',
    icon: ShieldCheck,
    color: 'amber',
    description: 'Blood work, diagnostic scans, and medical histories securely synchronized across global facilities.',
  },
];

export const ScrollShowcaseSection: React.FC<ScrollShowcaseSectionProps> = ({ onExplore }) => {
  const { theme } = useApp();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number>(0);

  const targetFrameRef = useRef<number>(1);
  const currentFloatRef = useRef<number>(1);
  const animFrameRef = useRef<number | null>(null);

  // Preload frames for the canvas showcase
  useEffect(() => {
    let count = 0;
    const loaded: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        count++;
        if (count === TOTAL_FRAMES) setIsLoaded(true);
      };
      img.onerror = () => {
        count++;
        if (count === TOTAL_FRAMES) setIsLoaded(true);
      };
      loaded.push(img);
    }
    imagesRef.current = loaded;
  }, []);

  // Draw frame on canvas
  const drawFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const idx = Math.min(Math.max(1, Math.round(frameIdx)), TOTAL_FRAMES) - 1;
    const img = imagesRef.current[idx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Letterbox / cover calculation
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;

    let dw: number, dh: number, ox = 0, oy = 0;
    if (canvasRatio > imgRatio) {
      dw = w;
      dh = w / imgRatio;
      oy = (h - dh) / 2;
    } else {
      dh = h;
      dw = h * imgRatio;
      ox = (w - dw) / 2;
    }

    ctx.drawImage(img, ox, oy, dw, dh);
  }, []);

  // Canvas resize with high-DPI
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      drawFrame(currentFloatRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  // Smooth lerp loop
  useEffect(() => {
    const loop = () => {
      const diff = targetFrameRef.current - currentFloatRef.current;
      if (Math.abs(diff) > 0.01) {
        currentFloatRef.current += diff * 0.22;
        drawFrame(currentFloatRef.current);
        const rounded = Math.round(currentFloatRef.current);
        setCurrentFrame(rounded);

        // Update active milestone
        const mIdx = MILESTONES.findIndex(
          (m) => rounded >= m.range[0] && rounded <= m.range[1]
        );
        if (mIdx !== -1) setActiveMilestoneIndex(mIdx);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawFrame]);

  // Scroll listener tracking section visibility and scroll progress
  useEffect(() => {
    if (isPlaying) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const windowH = window.innerHeight;

      // When container enters viewport until it leaves
      const startY = rect.top;
      const totalDist = rect.height - windowH;
      if (totalDist <= 0) {
        // Simple visibility mapping
        const visibleRatio = (windowH - rect.top) / (windowH + rect.height);
        const clamped = Math.min(Math.max(0, visibleRatio), 1);
        targetFrameRef.current = 1 + clamped * (TOTAL_FRAMES - 1);
        return;
      }

      const progress = Math.min(Math.max(0, -startY / totalDist), 1);
      targetFrameRef.current = 1 + progress * (TOTAL_FRAMES - 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPlaying]);

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying) return;

    let dir = 1;
    const interval = setInterval(() => {
      targetFrameRef.current += dir * 1;
      if (targetFrameRef.current >= TOTAL_FRAMES) {
        targetFrameRef.current = TOTAL_FRAMES;
        dir = -1;
      } else if (targetFrameRef.current <= 1) {
        targetFrameRef.current = 1;
        dir = 1;
      }
    }, 90);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeMilestone = MILESTONES[activeMilestoneIndex] || MILESTONES[0];
  const MilestoneIcon = activeMilestone.icon;

  return (
    <section
      ref={containerRef}
      id="motion-experience"
      className="relative py-20 lg:py-28 overflow-hidden bg-transparent border-y border-slate-200/50 dark:border-slate-800/50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Interactive Visual Experience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight leading-[1.15]">
            Scroll to Animate the Care Workflow
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            As you scroll through the Curevia ecosystem, watch the dynamic healthcare sequence synchronize across real-time medicine schedules, clinical consults, and encrypted health records.
          </p>
        </div>

        {/* Cinematic Animation Viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Visual Display */}
          <div className="lg:col-span-8 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-300/80 dark:border-slate-700/80 bg-slate-900 aspect-video group">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover transition-transform duration-500 transform-gpu"
              />

              {/* High-tech HUD Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/75 backdrop-blur-md border border-white/10 text-white text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Interactive Frame Engine</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-900/75 backdrop-blur-md border border-white/10 text-white text-xs font-mono font-bold">
                  Frame {String(currentFrame).padStart(2, '0')} / {TOTAL_FRAMES}
                </div>
              </div>

              {/* Bottom Scrubber & Quick Actions Bar */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-sky-600 hover:bg-sky-500 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    title={isPlaying ? 'Pause animation' : 'Auto-play sequence'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      targetFrameRef.current = 1;
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs transition cursor-pointer shrink-0"
                    title="Reset to frame 1"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300 pl-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                    <span>Scroll to scrub</span>
                  </div>
                </div>

                {/* Progress Bar Scrubber */}
                <div className="w-full sm:w-1/2 flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max={TOTAL_FRAMES}
                    value={currentFrame}
                    onChange={(e) => {
                      setIsPlaying(false);
                      targetFrameRef.current = Number(e.target.value);
                    }}
                    className="w-full accent-sky-400 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
                  />
                  <span className="text-[11px] font-mono text-slate-300 shrink-0">
                    {Math.round((currentFrame / TOTAL_FRAMES) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Active Synchronized Workflow Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-5 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <span className="text-xs uppercase tracking-wider font-bold text-sky-600 dark:text-sky-400">
                  {activeMilestone.phase}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Frames {activeMilestone.range[0]} – {activeMilestone.range[1]}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400">
                    <MilestoneIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    {activeMilestone.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {activeMilestone.description}
                </p>
              </div>

              {/* Milestone Phase Jump Buttons */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Workflow Stages
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MILESTONES.map((m, idx) => (
                    <button
                      key={m.phase}
                      onClick={() => {
                        setIsPlaying(false);
                        targetFrameRef.current = m.range[0];
                      }}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition cursor-pointer flex flex-col ${
                        activeMilestoneIndex === idx
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400">{m.phase}</span>
                      <span className="truncate">{m.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onExplore('patient')}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 text-sm transition cursor-pointer"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
