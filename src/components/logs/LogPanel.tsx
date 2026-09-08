import React, { useState } from 'react';
import { 
  Terminal, 
  AlertTriangle, 
  XCircle, 
  Info, 
  ChevronUp, 
  ChevronDown, 
  Clock 
} from 'lucide-react';
import type { CompilerLogEntry } from '../../types';

interface LogPanelProps {
  logs: CompilerLogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  onJumpToLine?: (line: number) => void;
  durationMs?: number;
  engineUsed?: 'wasm-browser' | 'cloud-texlive';
}

export const LogPanel: React.FC<LogPanelProps> = ({
  logs,
  isOpen,
  onToggle,
  onJumpToLine,
  durationMs,
  engineUsed
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'errors' | 'warnings'>('all');

  const errors = logs.filter((l) => l.type === 'error');
  const warnings = logs.filter((l) => l.type === 'warning');

  const filteredLogs = activeTab === 'errors' 
    ? errors 
    : activeTab === 'warnings' 
    ? warnings 
    : logs;

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 flex flex-col z-20 select-none shadow-2xl transition-all duration-200">
      {/* Drawer Bar */}
      <div 
        onClick={onToggle}
        className="h-8 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-850 text-xs text-slate-400"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-slate-200 font-medium">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kompilierungsprotokoll</span>
          </div>

          {/* Error & Warning Badges */}
          <div className="flex items-center space-x-2">
            <span className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              errors.length > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              <XCircle className="w-3 h-3" />
              <span>{errors.length} Fehler</span>
            </span>

            <span className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              warnings.length > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              <AlertTriangle className="w-3 h-3" />
              <span>{warnings.length} Warnungen</span>
            </span>
          </div>
        </div>

        {/* Right Info & Toggle */}
        <div className="flex items-center space-x-3 text-[11px]">
          {durationMs !== undefined && (
            <div className="flex items-center space-x-1 text-slate-400 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{durationMs}ms</span>
              {engineUsed && (
                <span className="text-indigo-400 ml-1 font-sans font-medium">
                  ({engineUsed === 'wasm-browser' ? 'WASM' : 'Cloud'})
                </span>
              )}
            </div>
          )}
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Logs Body */}
      {isOpen && (
        <div className="h-44 flex flex-col bg-slate-950 font-mono text-xs">
          {/* Sub Tabs */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-slate-900/60 border-b border-slate-800/80 text-[11px]">
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab('all'); }}
              className={`px-2 py-0.5 rounded transition ${activeTab === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Alle Ausgaben ({logs.length})
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab('errors'); }}
              className={`px-2 py-0.5 rounded transition ${activeTab === 'errors' ? 'bg-rose-950 text-rose-200' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Fehler ({errors.length})
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab('warnings'); }}
              className={`px-2 py-0.5 rounded transition ${activeTab === 'warnings' ? 'bg-amber-950 text-amber-200' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Warnungen ({warnings.length})
            </button>
          </div>

          {/* Log Lines */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 select-text">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 italic py-2">Keine Protokolleinträge in dieser Ansicht.</div>
            ) : (
              filteredLogs.map((log, idx) => (
                <div
                  key={idx}
                  onClick={() => log.line && onJumpToLine?.(log.line)}
                  className={`flex items-start space-x-2 py-1 px-2 rounded cursor-pointer transition ${
                    log.type === 'error'
                      ? 'bg-rose-950/40 text-rose-300 border border-rose-900/50 hover:bg-rose-900/40'
                      : log.type === 'warning'
                      ? 'bg-amber-950/30 text-amber-300 border border-amber-900/40 hover:bg-amber-900/30'
                      : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <span className="shrink-0 mt-0.5">
                    {log.type === 'error' ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    ) : log.type === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </span>

                  {log.line && (
                    <span className="shrink-0 px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-bold text-indigo-300">
                      Z.{log.line}
                    </span>
                  )}

                  <div className="flex-1">
                    <div className="text-[11px] font-sans">{log.message}</div>
                    {log.raw && (
                      <div className="text-[10px] opacity-70 font-mono mt-0.5 text-slate-400">
                        {log.raw}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
