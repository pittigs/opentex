import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, AlertTriangle, CheckCircle, Copy, Check, Plus, Loader2 } from 'lucide-react';
import { fetchBibtexByDoi, fetchBibtexByArxiv, auditCitations, type CitationAuditResult } from '../../services/citationService';

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTexContent: string;
  bibContent: string;
  onInsertBibtex: (bibtexEntry: string) => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  isOpen,
  onClose,
  activeTexContent,
  bibContent,
  onInsertBibtex,
}) => {
  const [activeTab, setActiveTab] = useState<'fetch' | 'audit'>('fetch');
  const [query, setQuery] = useState<string>('');
  const [queryType, setQueryType] = useState<'doi' | 'arxiv'>('doi');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fetchedBibtex, setFetchedBibtex] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Run citation audit
  const auditResult: CitationAuditResult = useMemo(() => {
    return auditCitations(activeTexContent, bibContent);
  }, [activeTexContent, bibContent]);

  const handleFetch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setFetchedBibtex(null);

    try {
      let result = '';
      if (queryType === 'doi') {
        result = await fetchBibtexByDoi(query);
      } else {
        result = await fetchBibtexByArxiv(query);
      }
      setFetchedBibtex(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Fehler beim Abrufen der Zitation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!fetchedBibtex) return;
    await navigator.clipboard.writeText(fetchedBibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (fetchedBibtex) {
      onInsertBibtex(fetchedBibtex);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Literatur & Zitations-Manager</h2>
              <p className="text-xs text-slate-400">Automatisch BibTeX aus DOI/arXiv abrufen & Zitations-Audit durchführen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/20">
          <button
            onClick={() => setActiveTab('fetch')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'fetch'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" /> DOI & arXiv Import
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" /> Zitations-Auditor
            {auditResult.missingKeys.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {auditResult.missingKeys.length}
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'fetch' ? (
            <div className="space-y-5">
              {/* Type Switcher & Search Field */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setQueryType('doi')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    queryType === 'doi'
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  DOI Identifikator
                </button>
                <button
                  onClick={() => setQueryType('arxiv')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    queryType === 'arxiv'
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  arXiv Paper ID
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                  placeholder={
                    queryType === 'doi'
                      ? 'z. B. 10.1038/s41586-020-2649-2 oder https://doi.org/...'
                      : 'z. B. 1706.03762 oder arxiv:1706.03762'
                  }
                  className="flex-1 px-4 py-2.5 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleFetch}
                  disabled={isLoading || !query.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Abrufen
                </button>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              {fetchedBibtex && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Gefundener BibTeX-Eintrag</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Kopiert!' : 'Kopieren'}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-56">
                    {fetchedBibtex}
                  </pre>
                  <button
                    onClick={handleInsert}
                    className="flex items-center gap-2 w-full justify-center px-4 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Zu Literaturdatenbank hinzufügen
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Audit Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                  <div className="text-2xl font-bold text-slate-100">{auditResult.citedKeys.length}</div>
                  <div className="text-xs text-slate-400 mt-1">Im Text zitiert</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                  <div className="text-2xl font-bold text-slate-100">{auditResult.definedKeys.length}</div>
                  <div className="text-xs text-slate-400 mt-1">In .bib definiert</div>
                </div>
                <div className={`p-4 rounded-xl border text-center ${
                  auditResult.missingKeys.length > 0
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  <div className="text-2xl font-bold">
                    {auditResult.missingKeys.length === 0 ? '0' : auditResult.missingKeys.length}
                  </div>
                  <div className="text-xs mt-1">Fehlende Referenzen</div>
                </div>
              </div>

              {/* Missing References Alert */}
              {auditResult.missingKeys.length > 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4" /> Fehlende Einträge in der Bibliographie:
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {auditResult.missingKeys.map((key) => (
                      <span
                        key={key}
                        className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-mono"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 pt-1">
                    Diese Zitationsschlüssel werden im LaTeX-Dokument mit \cite verwendet, existieren aber noch in keiner geladenen .bib Datei.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>Alle im LaTeX-Text verwendeten Zitationen sind in der Bibliographie hinterlegt.</span>
                </div>
              )}

              {/* Unused References */}
              {auditResult.unusedKeys.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <div className="text-xs font-medium text-slate-400">
                    Definierte, aber ungenutzte Literatur-Einträge ({auditResult.unusedKeys.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {auditResult.unusedKeys.map((key) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 text-xs font-mono"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
