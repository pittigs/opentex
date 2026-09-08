import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Unlock, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { exportEncryptedProject } from '../../services/exportService';
import { decryptProjectFiles } from '../../services/encryptionService';
import type { ProjectFile } from '../../types';

interface EncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: ProjectFile[];
  projectName: string;
  onImportDecryptedFiles: (files: ProjectFile[], name: string) => void;
}

export const EncryptionModal: React.FC<EncryptionModalProps> = ({
  isOpen,
  onClose,
  files,
  projectName,
  onImportDecryptedFiles,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  
  // Export states
  const [exportPassword, setExportPassword] = useState('');
  const [exportConfirm, setExportConfirm] = useState('');
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // Import states
  const [importPassword, setImportPassword] = useState('');
  const [importFileContent, setImportFileContent] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setExportStatus(null);

    if (exportPassword.length < 4) {
      setErrorMessage('Das Passwort muss mindestens 4 Zeichen lang sein.');
      return;
    }
    if (exportPassword !== exportConfirm) {
      setErrorMessage('Die Passwörter stimmen nicht überein.');
      return;
    }

    try {
      await exportEncryptedProject(files, projectName, exportPassword);
      setExportStatus('Projekt erfolgreich mit AES-256-GCM verschlüsselt und heruntergeladen!');
      setExportPassword('');
      setExportConfirm('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Fehler beim Verschlüsseln.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setImportFileContent(evt.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setImportStatus(null);

    if (!importFileContent) {
      setErrorMessage('Bitte zuerst eine verschlüsselte .otex.enc Datei auswählen.');
      return;
    }
    if (!importPassword) {
      setErrorMessage('Bitte das Entschlüsselungspasswort eingeben.');
      return;
    }

    try {
      const decrypted = await decryptProjectFiles(importFileContent, importPassword);
      const cleanName = importFileName.replace(/\.otex\.enc$/, '').replace(/_/g, ' ');
      onImportDecryptedFiles(decrypted, cleanName);
      setImportStatus('Erfolgreich entschlüsselt! Projektdateien wurden geladen.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Entschlüsselung fehlgeschlagen.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Ende-zu-Ende-Verschlüsselung</h2>
              <p className="text-xs text-slate-400">AES-256-GCM Verschlüsselung für sensible wissenschaftliche Daten</p>
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
            onClick={() => { setActiveTab('export'); setErrorMessage(null); }}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'export'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" /> Verschlüsselt exportieren
          </button>
          <button
            onClick={() => { setActiveTab('import'); setErrorMessage(null); }}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Unlock className="w-4 h-4" /> Entschlüsseln & Importieren
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {activeTab === 'export' ? (
            <form onSubmit={handleExport} className="space-y-4">
              <p className="text-xs text-slate-300">
                Verschlüsselt alle Projektdateien (<span className="font-semibold text-slate-100">{files.length} Dateien</span>) lokal in deinem Browser. 
                Ohne das Passwort kann niemand, auch nicht der Server, auf den Quellcode zugreifen.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Passwort vergeben</label>
                <input
                  type="password"
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                  placeholder="Mindestens 4 Zeichen..."
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Passwort bestätigen</label>
                <input
                  type="password"
                  value={exportConfirm}
                  onChange={(e) => setExportConfirm(e.target.value)}
                  placeholder="Passwort wiederholen..."
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {exportStatus && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {exportStatus}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-amber-500/20 transition-colors"
              >
                <Download className="w-4 h-4" /> Als .otex.enc verschlüsselt speichern
              </button>
            </form>
          ) : (
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Verschlüsselte Datei (.otex.enc)</label>
                <input
                  type="file"
                  accept=".enc,.json,.otex"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Passwort eingeben</label>
                <input
                  type="password"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  placeholder="Dein Verschlüsselungspasswort..."
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {importStatus && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {importStatus}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-amber-500/20 transition-colors"
              >
                <Upload className="w-4 h-4" /> Entschlüsseln & Laden
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
