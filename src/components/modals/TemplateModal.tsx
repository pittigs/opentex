import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  GraduationCap, 
  Presentation, 
  UserCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { LaTeXTemplate } from '../../types';
import { ALL_TEMPLATES } from '../../templates/latexTemplates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: LaTeXTemplate) => void;
  currentTemplateId?: string;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Paper', 'Thesis', 'Slides', 'Resume'];

  const filteredTemplates = selectedCat === 'All' 
    ? ALL_TEMPLATES 
    : ALL_TEMPLATES.filter(t => t.category === selectedCat);

  const getTemplateIcon = (icon: string) => {
    switch (icon) {
      case 'GraduationCap': return <GraduationCap className="w-6 h-6 text-emerald-400" />;
      case 'Presentation': return <Presentation className="w-6 h-6 text-purple-400" />;
      case 'UserCheck': return <UserCheck className="w-6 h-6 text-cyan-400" />;
      default: return <FileText className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">LaTeX Vorlagen-Bibliothek</h2>
              <p className="text-xs text-slate-400">Wähle ein professionelles Grundgerüst für dein Dokument</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                selectedCat === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'All' ? 'Alle Vorlagen' : cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {filteredTemplates.map((template) => {
            const isCurrent = template.id === currentTemplateId;

            return (
              <div
                key={template.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between group cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-950/30 border-indigo-500/60'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/80">
                      {getTemplateIcon(template.icon)}
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {template.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                    {template.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{template.files.length} Dateien</span>
                  <div className="flex items-center space-x-1 text-xs text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Vorlage laden</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
