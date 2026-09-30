import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RefreshCw, Eye, EyeOff, Film, Sparkles, Sliders, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TOTAL_FRAMES = 25;

export const getFrameUrl = (index: number): string => {
  const frameNumber = Math.min(Math.max(1, index), TOTAL_FRAMES);
  const pad = String(frameNumber).padStart(3, '0');
  return `/ezgif-4c836045c5bb5d2d-jpg/ezgif-frame-${pad}.jpg`;
};

interface ScrollBackgroundAnimationProps {
  /**
   * If true, renders a fixed background behind the whole viewport
   */
  isGlobalBackground?: boolean;
  /**
   * Initial animation mode: 'scroll' | 'loop' | 'manual'
   */
  initialMode?: 'scroll' | 'loop' | 'manual';
  /**
   * Initial visibility/opacity factor (0.1 to 1.0)
   */
  defaultOpacity?: number;
  /**
   * Whether to display the floating interactive HUD control
   */
  showFloatingControls?: boolean;
  /**
   * Optional custom className
   */
  className?: string;
}

export const ScrollBackgroundAnimation: React.FC<ScrollBackgroundAnimationProps> = ({
  isGlobalBackground = true,
  initialMode = 'loop',
  defaultOpacity = 0.92,
  showFloatingControls = true,
  className = '',
}) => {
  const { theme } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // State
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [mode, setMode] = useState<'scroll' | 'loop' | 'manual'>(initialMode);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [opacity, setOpacity] = useState<number>(defaultOpacity);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isHudOpen, setIsHudOpen] = useState<boolean>(false);

  // Animation refs
  const targetFrameRef = useRef<number>(1);
  const currentFrameFloatRef = useRef<number>(1);
  const animFrameIdRef = useRef<number | null>(null);
  const loopIntervalRef = useRef<any>(null);

  // Draw current frame on canvas with object-fit: cover
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgIndex = Math.min(Math.max(1, Math.round(frameIndex)), TOTAL_FRAMES) - 1;
    const img = imagesRef.current[imgIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate aspect-ratio cover
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  // Preload all 25 images
  useEffect(() => {
    let loaded = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (i === 1) {
          drawFrame(1);
        }
        if (loaded === TOTAL_FRAMES) {
          setIsLoaded(true);
          drawFrame(targetFrameRef.current);
        }
      };
      img.onerror = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === TOTAL_FRAMES) {
          setIsLoaded(true);
        }
      };
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;

    return () => {
      imagesRef.current = [];
    };
  }, [drawFrame]);

  // Responsive canvas resizing with high DPI support
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = (rect.width || window.innerWidth) * dpr;
      canvas.height = (rect.height || window.innerHeight) * dpr;

      drawFrame(currentFrameFloatRef.current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  // Smooth interpolation render loop
  useEffect(() => {
    const renderLoop = () => {
      // Lerp float frame towards target frame for smooth 60fps scrubbing
      const diff = targetFrameRef.current - currentFrameFloatRef.current;
      if (Math.abs(diff) > 0.01) {
        currentFrameFloatRef.current += diff * 0.18;
        drawFrame(currentFrameFloatRef.current);
        setCurrentFrame(Math.round(currentFrameFloatRef.current));
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [drawFrame]);

  // Scroll listener: maps scroll position to frame 1..TOTAL_FRAMES
  useEffect(() => {
    if (mode !== 'scroll') return;

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollProgress = Math.min(Math.max(0, window.scrollY / docHeight), 1);
      const calculatedFrame = 1 + scrollProgress * (TOTAL_FRAMES - 1);
      targetFrameRef.current = calculatedFrame;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode]);

  // Ambient Loop listener
  useEffect(() => {
    if (mode !== 'loop' || !isPlaying) {
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
      return;
    }

    let direction = 1;
    loopIntervalRef.current = setInterval(() => {
      targetFrameRef.current += direction * 0.85;

      if (targetFrameRef.current >= TOTAL_FRAMES) {
        targetFrameRef.current = TOTAL_FRAMES;
        direction = -1; // Ping-pong reversal
      } else if (targetFrameRef.current <= 1) {
        targetFrameRef.current = 1;
        direction = 1;
      }
    }, 85);

    return () => {
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
    };
  }, [mode, isPlaying]);

  // Manual scrubber handler
  const handleScrub = (val: number) => {
    setMode('manual');
    targetFrameRef.current = val;
    currentFrameFloatRef.current = val;
    drawFrame(val);
    setCurrentFrame(val);
  };

  const handleToggleMode = (newMode: 'scroll' | 'loop' | 'manual') => {
    setMode(newMode);
    if (newMode === 'loop') {
      setIsPlaying(true);
    }
  };

  return (
    <>
      {/* Background Canvas Layer */}
      <div
        className={`pointer-events-none transition-opacity duration-700 select-none ${
          isGlobalBackground
            ? 'fixed inset-0 z-0 overflow-hidden'
            : 'absolute inset-0 z-0 overflow-hidden'
        } ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
        style={{ opacity: isVisible ? opacity : 0 }}
        aria-hidden="true"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover transition-transform duration-300 transform-gpu filter"
          style={{
            filter:
              theme === 'dark'
                ? 'contrast(108%) brightness(92%) saturate(110%)'
                : 'contrast(102%) brightness(100%) saturate(102%)',
          }}
        />
      </div>

      {/* Floating Visual Motion & Background HUD Controller */}
      {showFloatingControls && (
        <aside
          aria-label="Curevia Visual Motion Controls"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 text-xs font-sans transition-all"
        >
          {/* Expanded Control Box */}
          {isHudOpen && (
            <div className="p-4 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-sky-200/80 dark:border-sky-800/80 space-y-3.5 text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400">
                  <Film className="w-4 h-4" />
                  <span>Visual Motion Engine</span>
                </div>
                <button
                  onClick={() => setIsHudOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                  title="Close panel"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Animation Mode
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => handleToggleMode('scroll')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      mode === 'scroll'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
                    }`}
                  >
                    Scroll
                  </button>
                  <button
                    onClick={() => handleToggleMode('loop')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      mode === 'loop'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
                    }`}
                  >
                    Auto Loop
                  </button>
                  <button
                    onClick={() => handleToggleMode('manual')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      mode === 'manual'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {/* Scrub Frame Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>Frame Scrub</span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">
                    {currentFrame} / {TOTAL_FRAMES}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={TOTAL_FRAMES}
                  value={currentFrame}
                  onChange={(e) => handleScrub(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                />
              </div>

              {/* Visibility / Intensity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>Background Visibility</span>
                  <span>{Math.round(opacity * 100)}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'Medium', val: 0.65 },
                    { label: 'Vivid', val: 0.85 },
                    { label: '100% Clear', val: 1.0 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setOpacity(preset.val);
                        setIsVisible(true);
                      }}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                        Math.abs(opacity - preset.val) < 0.05
                          ? 'bg-sky-100 dark:bg-sky-950 border-sky-400 text-sky-700 dark:text-sky-300'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Play/Pause and On/Off */}
              <div className="flex items-center gap-2 pt-1">
                {mode === 'loop' && (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isVisible
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{isVisible ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Collapsed Trigger Pill */}
          <button
            onClick={() => setIsHudOpen(!isHudOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-sky-300/70 dark:border-sky-700/70 text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:shadow-sky-500/20 transition cursor-pointer group"
            title="Toggle Visual Motion Controls"
          >
            <div className="relative">
              <Film className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition" />
              {mode === 'loop' && isPlaying && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 uppercase font-semibold leading-none">
                Motion
              </span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 leading-tight">
                {mode === 'scroll' ? 'Scroll Sync' : mode === 'loop' ? 'Auto Loop' : 'Manual'} (
                {currentFrame}/25)
              </span>
            </div>
            {isHudOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </button>
        </aside>
      )}
    </>
  );
};
