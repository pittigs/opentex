import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  FileText, 
  Upload, 
  BookOpen, 
  GraduationCap, 
  Presentation, 
  Award,
  Sparkles
} from 'lucide-react';
import { ALL_TEMPLATES } from '../../templates/latexTemplates';
import type { ProjectSummary } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEmpty: (name: string, description?: string) => ProjectSummary;
  onCreateFromTemplate: (templateId: string, customName?: string) => ProjectSummary;
  onProjectCreated: (project: ProjectSummary) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateEmpty,
  onCreateFromTemplate,
  onProjectCreated,
}) => {
  const [projectName, setProjectName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = projectName.trim() || 'Unbenanntes LaTeX Projekt';
    let newProj: ProjectSummary;

    if (selectedTemplateId === 'blank') {
      newProj = onCreateEmpty(finalName);
    } else {
      newProj = onCreateFromTemplate(selectedTemplateId, finalName);
    }

    onProjectCreated(newProj);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const proj = onCreateEmpty(file.name.replace(/\.tex$/i, '') || 'Importiertes Dokument');
      if (proj.files[0]) {
        proj.files[0].content = content;
      }
      onProjectCreated(proj);
      onClose();
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Neues LaTeX-Projekt erstellen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Projektname</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="z.B. Quantum Computing Paper 2026"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Vorlage auswählen</label>
            <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {/* Leeres Dokument */}
              <div
                onClick={() => setSelectedTemplateId('blank')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                  selectedTemplateId === 'blank'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                }`}
              >
                <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Leeres Dokument</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Minimale LaTeX-Präambel mit Einleitung</p>
                </div>
              </div>

              {/* Akademische Vorlagen */}
              {ALL_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                    selectedTemplateId === tmpl.id
                      ? 'border-indigo-500 bg-indigo-950/30 text-white'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {tmpl.category === 'Paper' && <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
                  {tmpl.category === 'Thesis' && <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                  {tmpl.category === 'CheatSheet' && <GraduationCap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                  {tmpl.category === 'Slides' && <Presentation className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />}
                  {tmpl.category === 'Resume' && <Award className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{tmpl.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{tmpl.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lokale Datei importieren */}
          <div className="pt-2 border-t border-slate-800">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".tex"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-950/50 hover:bg-slate-900 text-xs font-medium text-slate-300 hover:text-white transition flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Lokale .tex-Datei hochladen & importieren</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Abbrechen
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Projekt anlegen & öffnen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
