import React from 'react';
import { 
  Play, 
  Sparkles, 
  Download, 
  FolderArchive, 
  Users, 
  LayoutTemplate, 
  Sigma, 
  Moon, 
  Sun, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Cloud,
  GitBranch,
  MessageSquare,
  Bot
} from 'lucide-react';
import type { Collaborator, LaTeXTemplate, GitConfig } from '../../types';

interface NavbarProps {
  projectName: string;
  setProjectName: (name: string) => void;
  isCompiling: boolean;
  onCompile: () => void;
  autoCompile: boolean;
  setAutoCompile: (val: boolean) => void;
  engine: 'wasm-browser' | 'cloud-texlive';
  setEngine: (eng: 'wasm-browser' | 'cloud-texlive') => void;
  lastCompileSuccess?: boolean;
  collaborators: Collaborator[];
  onOpenTemplates: () => void;
  onOpenCollab: () => void;
  onOpenMathPalette: () => void;
  isMathOpen: boolean;
  onExportZip: () => void;
  onDownloadPdf: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentTemplate?: LaTeXTemplate;
  // New Pro Props
  onOpenGit: () => void;
  gitConfig: GitConfig;
  onOpenReview: () => void;
  isReviewOpen: boolean;
  unresolvedCommentCount: number;
  onOpenAiAssistant: () => void;
  isAiOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  projectName,
  setProjectName,
  isCompiling,
  onCompile,
  autoCompile,
  setAutoCompile,
  engine,
  setEngine,
  lastCompileSuccess,
  collaborators,
  onOpenTemplates,
  onOpenCollab,
  onOpenMathPalette,
  isMathOpen,
  onExportZip,
  onDownloadPdf,
  isDarkMode,
  toggleDarkMode,
  onOpenGit,
  gitConfig,
  onOpenReview,
  isReviewOpen,
  unresolvedCommentCount,
  onOpenAiAssistant,
  isAiOpen
}) => {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-3 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Project Name */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <span className="font-extrabold text-sm text-white tracking-tight">TeX</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm tracking-tight text-white">OpenTeX</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Open Source
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* Editable Project Name */}
        <div className="flex items-center">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-800 text-slate-200 text-sm font-medium px-2 py-1 rounded transition border border-transparent focus:border-indigo-500/50 outline-none w-44 truncate"
            title="Projektname umbenennen"
          />
        </div>
      </div>

      {/* Center: Compile Controls & Engine Switch */}
      <div className="flex items-center space-x-2">
        {/* Engine Switcher */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setEngine('wasm-browser')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition font-medium ${
              engine === 'wasm-browser'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Client-Side WebAssembly: 0€ Serverkosten, sub-100ms Latenz"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>WASM</span>
          </button>
          <button
            onClick={() => setEngine('cloud-texlive')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition font-medium ${
              engine === 'cloud-texlive'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Cloud Server TeXLive Worker"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud</span>
          </button>
        </div>

        {/* Compile Button */}
        <button
          onClick={onCompile}
          disabled={isCompiling}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg font-medium text-xs transition shadow-md ${
            isCompiling
              ? 'bg-indigo-700/60 text-indigo-200 cursor-wait'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 active:scale-95'
          }`}
        >
          {isCompiling ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Kompiliere...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Kompilieren</span>
              <kbd className="hidden md:inline-block text-[10px] bg-emerald-700/80 px-1 py-0.2 rounded font-mono text-emerald-100">
                Strg+↵
              </kbd>
            </>
          )}
        </button>

        {/* Auto Compile Toggle */}
        <button
          onClick={() => setAutoCompile(!autoCompile)}
          className={`px-2 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1 transition ${
            autoCompile
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Automatische Kompilierung bei Änderungen ein/ausschalten"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Auto</span>
        </button>

        {/* Status Indicator */}
        {lastCompileSuccess !== undefined && (
          <div className="flex items-center text-xs px-2 py-1 rounded bg-slate-800/40 border border-slate-800">
            {lastCompileSuccess ? (
              <div className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Bereit</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[11px]">Fehler</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Pro Actions (Git, Review, AI, Templates) */}
      <div className="flex items-center space-x-1.5">
        {/* Generic Git Sync Button */}
        <button
          onClick={onOpenGit}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1.5 ${
            gitConfig.isConnected
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/50'
              : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
          }`}
          title="Freie Git-Synchronisation (GitHub, GitLab, Uni-Git, Gitea)"
        >
          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">Git</span>
          {gitConfig.unpushedCommits > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        {/* Review / Track Changes Button */}
        <button
          onClick={onOpenReview}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1.5 ${
            isReviewOpen
              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
          }`}
          title="Review & Track Changes öffnen"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">Review</span>
          {unresolvedCommentCount > 0 && (
            <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-full">
              {unresolvedCommentCount}
            </span>
          )}
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAiAssistant}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1.5 ${
            isAiOpen
              ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50'
              : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
          }`}
          title="KI-Schreibassistent & DOI-Fetcher"
        >
          <Bot className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">KI-Copilot</span>
        </button>

        {/* Math Palette */}
        <button
          onClick={onOpenMathPalette}
          className={`p-1.5 rounded-lg text-xs font-medium border transition flex items-center space-x-1 ${
            isMathOpen 
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
              : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
          }`}
          title="Formeln & Symbole"
        >
          <Sigma className="w-4 h-4 text-indigo-400" />
        </button>

        {/* Templates Modal */}
        <button
          onClick={onOpenTemplates}
          className="p-1.5 rounded-lg text-xs font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
          title="Vorlagen"
        >
          <LayoutTemplate className="w-4 h-4 text-blue-400" />
        </button>

        {/* Collaboration Avatars / Share */}
        <button
          onClick={onOpenCollab}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/50 text-indigo-300 text-xs font-medium transition"
          title="Teilen (Yjs CRDT)"
        >
          <Users className="w-3.5 h-3.5" />
          <div className="flex -space-x-1 ml-1">
            {collaborators.slice(0, 2).map((collab) => (
              <div
                key={collab.id}
                className="w-4 h-4 rounded-full border border-slate-900 text-[9px] flex items-center justify-center font-bold text-white shadow"
                style={{ backgroundColor: collab.color }}
              >
                {collab.avatar}
              </div>
            ))}
          </div>
        </button>

        {/* Download PDF */}
        <button
          onClick={onDownloadPdf}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
          title="PDF herunterladen"
        >
          <Download className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Export ZIP */}
        <button
          onClick={onExportZip}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
          title="Projekt als ZIP herunterladen"
        >
          <FolderArchive className="w-4 h-4 text-amber-400" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
          title={isDarkMode ? 'Heller Modus' : 'Dunkler Modus'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>
      </div>
    </header>
  );
};
