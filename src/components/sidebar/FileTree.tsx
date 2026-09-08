import React, { useState } from 'react';
import { 
  FileText, 
  Folder, 
  Plus, 
  Trash2, 
  Edit2, 
  BookOpen, 
  Image as ImageIcon, 
  Code2, 
  FileCode, 
  Check, 
  X 
} from 'lucide-react';
import type { ProjectFile, FileType } from '../../types';

interface FileTreeProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, isFolder: boolean) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  wordCount: number;
  charCount: number;
  equationCount: number;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  wordCount,
  charCount,
  equationCount
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const getFileIcon = (type: FileType, name: string) => {
    if (type === 'tex' || name.endsWith('.tex')) return <FileCode className="w-4 h-4 text-emerald-400" />;
    if (type === 'bib' || name.endsWith('.bib')) return <BookOpen className="w-4 h-4 text-amber-400" />;
    if (type === 'cls' || name.endsWith('.cls') || type === 'sty' || name.endsWith('.sty')) return <Code2 className="w-4 h-4 text-purple-400" />;
    if (type === 'image' || /\.(png|jpg|jpeg|svg|pdf)$/i.test(name)) return <ImageIcon className="w-4 h-4 text-cyan-400" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  const handleStartCreate = (isFolder: boolean) => {
    setIsNewFolder(isFolder);
    setNewFileName(isFolder ? 'neuer_ordner' : 'neue_datei.tex');
    setIsCreating(true);
  };

  const handleConfirmCreate = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim(), isNewFolder);
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const handleStartRename = (file: ProjectFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  const handleConfirmRename = () => {
    if (editingFileId && editingName.trim()) {
      onRenameFile(editingFileId, editingName.trim());
      setEditingFileId(null);
      setEditingName('');
    }
  };

  return (
    <aside className="w-60 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between h-full select-none">
      {/* Top Header */}
      <div>
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dateien</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleStartCreate(false)}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Neue .tex Datei anlegen"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleStartCreate(true)}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Neuen Ordner erstellen"
            >
              <Folder className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Create Input Field */}
        {isCreating && (
          <div className="p-2 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center space-x-1">
              <input
                type="text"
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmCreate();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
                className="flex-1 bg-slate-900 border border-indigo-500 text-xs px-2 py-1 rounded text-white outline-none"
                placeholder={isNewFolder ? 'Ordnername...' : 'dateiname.tex'}
              />
              <button
                onClick={handleConfirmCreate}
                className="p-1 text-emerald-400 hover:text-emerald-300"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 text-slate-400 hover:text-rose-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="py-2 overflow-y-auto max-h-[calc(100vh-280px)]">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const isEditing = editingFileId === file.id;

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center justify-between px-3 py-1.5 cursor-pointer text-xs transition ${
                  isActive
                    ? 'bg-indigo-950/60 text-indigo-200 font-medium border-l-2 border-indigo-500'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2 truncate flex-1">
                  {file.isFolder ? (
                    <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    getFileIcon(file.type, file.name)
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      value={editingName}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename();
                        if (e.key === 'Escape') setEditingFileId(null);
                      }}
                      onBlur={handleConfirmRename}
                      className="bg-slate-900 border border-indigo-500 text-xs px-1.5 py-0.5 rounded text-white outline-none w-full"
                    />
                  ) : (
                    <span className="truncate">{file.name}</span>
                  )}
                </div>

                {/* Actions */}
                {!isEditing && file.name !== 'main.tex' && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 shrink-0 ml-1">
                    <button
                      onClick={(e) => handleStartRename(file, e)}
                      className="p-0.5 hover:text-indigo-400 text-slate-400 transition"
                      title="Umbenennen"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.id);
                      }}
                      className="p-0.5 hover:text-rose-400 text-slate-400 transition"
                      title="Löschen"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Document Statistics */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 space-y-1.5">
        <div className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 mb-1">
          Statistiken
        </div>
        <div className="flex justify-between">
          <span>Wörter:</span>
          <span className="font-mono text-slate-200">{wordCount.toLocaleString('de-DE')}</span>
        </div>
        <div className="flex justify-between">
          <span>Zeichen:</span>
          <span className="font-mono text-slate-200">{charCount.toLocaleString('de-DE')}</span>
        </div>
        <div className="flex justify-between">
          <span>Formeln & Gleichungen:</span>
          <span className="font-mono text-indigo-300">{equationCount}</span>
        </div>
      </div>
    </aside>
  );
};
