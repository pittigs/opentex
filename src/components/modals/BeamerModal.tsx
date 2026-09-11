import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  Presentation, 
  ListOrdered, 
  Sparkles,
  Layers
} from 'lucide-react';
import katex from 'katex';
import { parseBeamerSlides } from '../../services/beamerParser';
import type { BeamerSlide } from '../../types';

interface BeamerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTexContent: string;
}

export const BeamerModal: React.FC<BeamerModalProps> = ({
  isOpen,
  onClose,
  activeTexContent
}) => {
  const slides: BeamerSlide[] = useMemo(() => parseBeamerSlides(activeTexContent), [activeTexContent]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState<boolean>(false);

  // Presenter Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, onClose]);

  if (!isOpen) return null;

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMath = (mathCode: string) => {
    try {
      const clean = mathCode.replace(/^\$+|\$+$/g, '').replace(/^\\\[|\\\]$/g, '').trim();
      return {
        __html: katex.renderToString(clean, {
          throwOnError: false,
          displayMode: mathCode.startsWith('$$') || mathCode.startsWith('\\[')
        })
      };
    } catch {
      return { __html: mathCode };
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 ${isFullscreen ? 'p-0' : 'p-4 sm:p-6 backdrop-blur-md'}`}>
      <div className="relative flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Top Presenter Bar */}
        <div className="h-14 px-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">Beamer Präsentations-Modus</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  Slide {currentSlideIndex + 1} / {slides.length}
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Navigation via Pfeiltasten (← / →) oder Leertaste
              </span>
            </div>
          </div>

          {/* Center Presenter Stopwatch */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="font-mono font-bold text-slate-200">{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 rounded text-slate-400 hover:text-white transition"
              title={isTimerRunning ? 'Timer anhalten' : 'Timer starten'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="p-1 rounded text-slate-400 hover:text-white transition"
              title="Timer zurücksetzen"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsOverviewOpen(!isOverviewOpen)}
              className={`p-2 rounded-lg transition ${
                isOverviewOpen ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Folienübersicht ein-/ausblenden"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Vollbild umschalten"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Präsentation beenden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-800 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Presentation Stage */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Slide Overview Drawer */}
          {isOverviewOpen && (
            <div className="w-64 border-r border-slate-800 bg-slate-950/90 overflow-y-auto p-3 space-y-2 shrink-0 animate-in slide-in-from-left duration-200">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Alle Folien</span>
              </div>
              {slides.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setIsOverviewOpen(false);
                  }}
                  className={`p-2.5 rounded-xl cursor-pointer text-xs border transition ${
                    idx === currentSlideIndex
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-cyan-400">#{idx + 1}</span>
                    <span className="truncate">{s.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Slide Canvas */}
          <div className="flex-1 flex items-center justify-center p-8 sm:p-12 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="w-full max-w-4xl aspect-[16/10] bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 sm:p-14 shadow-2xl flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
              
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Header */}
              <div className="relative z-10 border-b border-slate-800/80 pb-5">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {currentSlide.title}
                </h1>
                {currentSlide.subtitle && (
                  <p className="text-sm sm:text-lg text-cyan-400 font-medium mt-1">
                    {currentSlide.subtitle}
                  </p>
                )}
              </div>

              {/* Slide Body */}
              <div className="relative z-10 flex-1 py-6 overflow-y-auto space-y-6">
                {/* Plain content or overview */}
                {currentSlide.content && currentSlide.bulletPoints.length === 0 && (
                  <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                    {currentSlide.content}
                  </p>
                )}

                {/* Bullet Points */}
                {currentSlide.bulletPoints.length > 0 && (
                  <ul className="space-y-4">
                    {currentSlide.bulletPoints.map((item, i) => (
                      <li key={i} className="flex items-start space-x-3 text-base sm:text-xl text-slate-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-sm shadow-cyan-500/50" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Rendered Math Equations */}
                {currentSlide.equations.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    {currentSlide.equations.map((eq, i) => (
                      <div
                        key={i}
                        className="text-lg sm:text-2xl text-center text-slate-100 py-1"
                        dangerouslySetInnerHTML={renderMath(eq)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Slide Footer */}
              <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>OpenTeX Beamer</span>
                </span>
                <span className="font-mono text-slate-400 font-semibold">
                  {currentSlideIndex + 1} / {slides.length}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Control Bar */}
        <div className="h-14 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0 select-none">
          <button
            onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
            disabled={currentSlideIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center space-x-2 transition shadow"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Vorherige Folie</span>
          </button>

          <div className="flex items-center space-x-1">
            {slides.slice(0, 15).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlideIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Zu Folie ${idx + 1}`}
              />
            ))}
            {slides.length > 15 && (
              <span className="text-[10px] text-slate-500 font-mono ml-1">+{slides.length - 15}</span>
            )}
          </div>

          <button
            onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlideIndex === slides.length - 1}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center space-x-2 transition shadow"
          >
            <span>Nächste Folie</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
