import React, { useState, useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Wand2, 
  BookOpen, 
  Clock, 
  FileText, 
  Hash, 
  Sigma, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { 
  calculateDocumentStats, 
  analyzeLatexText, 
  autoFixQuotes, 
  autoFixTildes, 
  autoFixDuplicates 
} from '../../services/linterService';
import type { LinterIssue } from '../../types';

interface LinterStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTexContent: string;
  onUpdateContent: (newContent: string) => void;
  onJumpToLine?: (line: number) => void;
}

export const LinterStatsModal: React.FC<LinterStatsModalProps> = ({
  isOpen,
  onClose,
  activeTexContent,
  onUpdateContent,
  onJumpToLine
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'linter'>('stats');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stats = useMemo(() => calculateDocumentStats(activeTexContent), [activeTexContent]);
  const issues = useMemo(() => analyzeLatexText(activeTexContent), [activeTexContent]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredIssues = issues.filter(issue => {
    if (filterSeverity === 'all') return true;
    return issue.severity === filterSeverity;
  });

  const handleApplySingleFix = (issue: LinterIssue) => {
    if (!issue.fixSuggestion) return;
    const lines = activeTexContent.split('\n');
    const targetLineIdx = issue.line - 1;
    if (lines[targetLineIdx] && lines[targetLineIdx].includes(issue.fixSuggestion.targetText)) {
      lines[targetLineIdx] = lines[targetLineIdx].replace(
        issue.fixSuggestion.targetText,
        issue.fixSuggestion.replacementText
      );
      onUpdateContent(lines.join('\n'));
      showToast(`Korrektur in Zeile ${issue.line} angewendet.`);
    }
  };

  const handleFixAllQuotes = () => {
    const fixed = autoFixQuotes(activeTexContent);
    onUpdateContent(fixed);
    showToast('Typografische Anführungszeichen (``...\'\') überall korrigiert.');
  };

  const handleFixAllTildes = () => {
    const fixed = autoFixTildes(activeTexContent);
    onUpdateContent(fixed);
    showToast('Geschützte Leerzeichen (~) vor Zitationen & Referenzen eingefügt.');
  };

  const handleFixAllDuplicates = () => {
    const fixed = autoFixDuplicates(activeTexContent);
    onUpdateContent(fixed);
    showToast('Doppelte Wörter bereinigt.');
  };

  const getFleschColor = (score: number) => {
    if (score >= 60) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 40) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (score >= 20) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Text-Analyse & Stilprüfung</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                  Akademisch
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Wortzähler, Lesbarkeitsindex und automatische LaTeX-Stilprüfungen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'stats'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistiken & Metriken</span>
          </button>
          <button
            onClick={() => setActiveTab('linter')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'linter'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Stil- & Fehlerprüfung</span>
            {issues.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {issues.length}
              </span>
            )}
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'stats' ? (
            <div className="space-y-6">
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1 font-medium">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Wörter (Prosa)</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stats.wordCount.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Ohne LaTeX-Befehle</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1 font-medium">
                    <Hash className="w-4 h-4 text-cyan-400" />
                    <span>Zeichen</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stats.characterCount.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {stats.characterCountNoSpaces.toLocaleString()} ohne Leerzeichen
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1 font-medium">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Geschätzte Lesezeit</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stats.readingTimeMinutes} min</div>
                  <div className="text-[11px] text-slate-500 mt-1">Bei 200 Wörtern/Min.</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1 font-medium">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Zitationen</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stats.citationCount}</div>
                  <div className="text-[11px] text-slate-500 mt-1">\cite Quellen referenziert</div>
                </div>
              </div>

              {/* Secondary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                    <Sigma className="w-4 h-4 text-teal-400" />
                    <span>Formeln & Gleichungen</span>
                  </div>
                  <div className="text-xl font-bold text-slate-200">{stats.equationCount}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Inline & Display Math</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                    <span>Absätze</span>
                  </div>
                  <div className="text-xl font-bold text-slate-200">{stats.paragraphCount}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Strukturierte Textblöcke</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                    <span>Sätze</span>
                  </div>
                  <div className="text-xl font-bold text-slate-200">{stats.sentenceCount}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Ø {stats.sentenceCount > 0 ? Math.round(stats.wordCount / stats.sentenceCount) : 0} Wörter pro Satz
                  </div>
                </div>
              </div>

              {/* Readability & Grade Level */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Flesch Lesbarkeitsindex (Readability)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bewertet Satzlänge und Silbendichte nach wissenschaftlichem Standard
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${getFleschColor(stats.readabilityScore)}`}>
                    Score: {stats.readabilityScore} / 100 ({stats.gradeLevel})
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, stats.readabilityScore))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                  <span>0 (Extrem komplex)</span>
                  <span>40 (Wissenschaftlich)</span>
                  <span>70 (Gute Lesbarkeit)</span>
                  <span>100 (Kinderleicht)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 self-center mr-2">1-Klick Aktionen:</span>
                <button
                  onClick={handleFixAllQuotes}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center space-x-1.5"
                >
                  <span>Anführungszeichen korrigieren</span>
                </button>
                <button
                  onClick={handleFixAllTildes}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center space-x-1.5"
                >
                  <span>Geschützte Leerzeichen (~)</span>
                </button>
                <button
                  onClick={handleFixAllDuplicates}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center space-x-1.5"
                >
                  <span>Wortdopplungen bereinigen</span>
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Filter:</span>
                {(['all', 'error', 'warning', 'info'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                      filterSeverity === sev
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sev === 'all' ? `Alle (${issues.length})` : `${sev} (${issues.filter(i => i.severity === sev).length})`}
                  </button>
                ))}
              </div>

              {/* Issues List */}
              {filteredIssues.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-950/30 border border-slate-800/40 text-slate-400">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-white">Keine Beanstandungen gefunden!</p>
                  <p className="text-xs text-slate-500 mt-1">Dein LaTeX-Dokument entspricht den akademischen Richtlinien.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredIssues.map(issue => (
                    <div
                      key={issue.id}
                      className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition flex items-start justify-between space-x-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {issue.severity === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                          {issue.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          {issue.severity === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-200">{issue.message}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              Zeile {issue.line}
                            </span>
                          </div>
                          {issue.excerpt && (
                            <div className="mt-1 text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 max-w-xl truncate">
                              {issue.excerpt}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {onJumpToLine && (
                          <button
                            onClick={() => onJumpToLine(issue.line)}
                            className="p-1.5 text-xs rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                            title="Zu Zeile springen"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {issue.fixSuggestion && (
                          <button
                            onClick={() => handleApplySingleFix(issue)}
                            className="px-2.5 py-1 text-xs rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-medium transition flex items-center space-x-1"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>Fix</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
