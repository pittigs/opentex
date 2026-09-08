import React, { useState } from 'react';
import { 
  X, 
  User, 
  GitBranch, 
  Cpu, 
  HardDrive, 
  Check, 
  Key, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles,
  Save,
  Globe
} from 'lucide-react';
import type { UserProfile } from '../../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

type TabType = 'profile' | 'git' | 'ai' | 'storage';

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const percentageUsed = Math.min(100, Math.round((formData.storageUsedMb / formData.storageLimitMb) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
              {formData.avatar || 'MM'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {formData.name}
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {formData.plan}
                </span>
              </h2>
              <p className="text-xs text-slate-400">{formData.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Identität</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('git')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition ${
              activeTab === 'git'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Git & GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition ${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>KI-Dienste & Keys</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition ${
              activeTab === 'storage'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Plan & Speicher</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Vollständiger Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Akademische E-Mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Institution / Universität</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.affiliation}
                      onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                      placeholder="z.B. Ruhr-Universität Bochum"
                    />
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rolle / Position</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="z.B. PhD Candidate / Student"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ORCID ID (Kennung für wissenschaftliche Publikationen)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.orcid || ''}
                    onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition font-mono"
                    placeholder="0000-0002-xxxx-xxxx"
                  />
                  <Globe className="w-4 h-4 text-emerald-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Forschungsinteressen / Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition resize-none"
                  placeholder="Kurze Beschreibung deiner akademischen Schwerpunkte..."
                />
              </div>
            </div>
          )}

          {activeTab === 'git' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">GitHub & GitLab Integration</span>
                  <p className="mt-0.5 leading-relaxed">
                    Hinterlege deine Git-Konfiguration, um Commits mit deiner Identität zu signieren und mit Repositories wie <code className="text-indigo-300 font-mono">pittigs/opentex</code> zu synchronisieren.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub / GitLab Username</label>
                  <input
                    type="text"
                    value={formData.gitUsername || ''}
                    onChange={(e) => setFormData({ ...formData, gitUsername: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="pittigs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Git Commit E-Mail</label>
                  <input
                    type="email"
                    value={formData.gitEmail || ''}
                    onChange={(e) => setFormData({ ...formData, gitEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="deine-email@beispiel.de"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Access Token (PAT)</label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.gitToken || ''}
                    onChange={(e) => setFormData({ ...formData, gitToken: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition font-mono"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  />
                  <Key className="w-4 h-4 text-amber-400 absolute left-2.5 top-2.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Wird verschlüsselt im lokalen Browser-Speicher abgelegt.</p>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-indigo-200">Wissenschaftlicher KI-Assistent</span>
                  <p className="mt-0.5 text-slate-300 leading-relaxed">
                    Ermöglicht automatische LaTeX-Formelgenerierung, wissenschaftliches Korrekturlesen und DOI-BibTeX-Konvertierung.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={formData.aiKeys?.gemini || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    aiKeys: { ...formData.aiKeys, gemini: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition font-mono"
                  placeholder="AIzaSy..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OpenAI API Key (GPT-4o)</label>
                <input
                  type="password"
                  value={formData.aiKeys?.openai || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    aiKeys: { ...formData.aiKeys, openai: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition font-mono"
                  placeholder="sk-proj-..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lokales Ollama / vLLM Endpoint</label>
                <input
                  type="text"
                  value={formData.aiKeys?.ollamaEndpoint || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    aiKeys: { ...formData.aiKeys, ollamaEndpoint: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition font-mono"
                  placeholder="http://localhost:11434"
                />
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  100% Offline & Datenschutzkonform
                </span>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">Speicherplatzverbrauch</span>
                  <span className="text-slate-400">{formData.storageUsedMb} MB von {formData.storageLimitMb} MB ({percentageUsed}%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentageUsed}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="block font-bold text-white text-sm">3</span>
                    <span>Projekte aktiv</span>
                  </div>
                  <div>
                    <span className="block font-bold text-white text-sm">18</span>
                    <span>Kompilierungen</span>
                  </div>
                  <div>
                    <span className="block font-bold text-white text-sm">2</span>
                    <span>Mitautoren</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Aktiver Tarif</span>
                    <h3 className="text-base font-bold text-white mt-0.5">OpenTeX Academic Pro</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Kostenlos & Open-Source für Studierende, Dozenten und Forscher.
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                    Aktiv
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Abbrechen
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center space-x-2"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Gespeichert!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Änderungen speichern</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
