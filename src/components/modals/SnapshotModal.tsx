import React, { useState, useMemo } from 'react';
import { 
  X, 
  History, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Clock, 
  GitCommit, 
  FileCode, 
  Check
} from 'lucide-react';
import { 
  getProjectSnapshots, 
  createProjectSnapshot, 
  deleteProjectSnapshot, 
  computeLineDiff 
} from '../../services/snapshotService';
import type { ProjectFile, ProjectSnapshot, DiffLine } from '../../types';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentFiles: ProjectFile[];
  activeFileId: string;
  onRestoreSnapshot: (snapshotFiles: ProjectFile[]) => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <SnapshotModalContent {...props} />;
};

const SnapshotModalContent: React.FC<SnapshotModalProps> = ({
  onClose,
  projectId,
  currentFiles,
  activeFileId,
  onRestoreSnapshot
}) => {
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>(() => getProjectSnapshots(projectId));
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(() => {
    const list = getProjectSnapshots(projectId);
    return list.length > 0 ? list[0].id : null;
  });
  const [selectedDiffFileId, setSelectedDiffFileId] = useState<string>(activeFileId);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [newSnapshotDesc, setNewSnapshotDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotName.trim()) return;

    const created = createProjectSnapshot(projectId, newSnapshotName.trim(), currentFiles, newSnapshotDesc.trim());
    setSnapshots(prev => [created, ...prev]);
    setSelectedSnapshotId(created.id);
    setNewSnapshotName('');
    setNewSnapshotDesc('');
    setIsCreating(false);
    showToast(`Snapshot "${created.name}" erfolgreich erstellt.`);
  };

  const handleDeleteSnapshot = (id: string, name: string) => {
    if (window.confirm(`Snapshot "${name}" wirklich löschen?`)) {
      const updated = deleteProjectSnapshot(projectId, id);
      setSnapshots(updated);
      if (selectedSnapshotId === id) {
        setSelectedSnapshotId(updated.length > 0 ? updated[0].id : null);
      }
      showToast('Snapshot gelöscht.');
    }
  };

  const handleRestore = () => {
    if (!selectedSnapshot) return;
    onRestoreSnapshot(selectedSnapshot.files);
    setConfirmRestore(false);
    showToast(`Snapshot "${selectedSnapshot.name}" wiederhergestellt.`);
  };

  // Compute diff for selected file
  const diffLines: DiffLine[] = useMemo(() => {
    if (!selectedSnapshot) return [];

    const snapshotFile = selectedSnapshot.files.find(f => f.id === selectedDiffFileId) || selectedSnapshot.files[0];
    const currentFile = currentFiles.find(f => f.id === selectedDiffFileId) || currentFiles[0];

    if (!snapshotFile || !currentFile) return [];

    // Snapshot is "old" (base), Current files is "new"
    return computeLineDiff(snapshotFile.content || '', currentFile.content || '');
  }, [selectedSnapshot, selectedDiffFileId, currentFiles]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[85vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Versionsverlauf & Diff-Viewer</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                  Snapshots
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Vergleiche frühere Revisionen zeilenweise und stelle Stände mit einem Klick wieder her
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

        {/* Toast */}
        {successToast && (
          <div className="mx-6 mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Body Layout: Left Snapshots List, Right Diff Viewer */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar: Snapshots Timeline */}
          <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/40 shrink-0">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Gespeicherte Versionen ({snapshots.length})
              </span>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="px-2 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neu</span>
              </button>
            </div>

            {/* Create Snapshot Form */}
            {isCreating && (
              <form onSubmit={handleCreateSnapshot} className="p-3 bg-slate-900 border-b border-slate-800 space-y-2">
                <input
                  type="text"
                  placeholder="Snapshot-Name (z.B. Vor Review)"
                  value={newSnapshotName}
                  onChange={e => setNewSnapshotName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  autoFocus
                  required
                />
                <input
                  type="text"
                  placeholder="Optionale Notiz..."
                  value={newSnapshotDesc}
                  onChange={e => setNewSnapshotDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow"
                  >
                    Erstellen
                  </button>
                </div>
              </form>
            )}

            {/* Snapshots List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {snapshots.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                  Noch keine Snapshots gespeichert. Klicke auf "+ Neu", um den aktuellen Projektstand zu sichern.
                </div>
              ) : (
                snapshots.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSnapshotId(s.id)}
                    className={`p-2.5 rounded-xl cursor-pointer transition border text-left ${
                      selectedSnapshotId === s.id
                        ? 'bg-purple-500/10 border-purple-500/40 text-white'
                        : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-1.5">
                        <GitCommit className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="text-xs font-bold truncate max-w-[170px]">{s.name}</span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteSnapshot(s.id, s.name);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Snapshot löschen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {s.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{s.description}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                      <span>{s.timestamp}</span>
                      <span>{s.files.length} Dateien</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Diff Viewer Stage */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/80">
            {selectedSnapshot ? (
              <>
                {/* Diff Header Bar */}
                <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-slate-400">Datei im Diff:</span>
                    <select
                      value={selectedDiffFileId}
                      onChange={e => setSelectedDiffFileId(e.target.value)}
                      className="px-2 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded text-xs focus:outline-none"
                    >
                      {currentFiles.filter(f => !f.isFolder).map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="flex items-center space-x-1 text-emerald-400 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span>+{diffLines.filter(d => d.type === 'added').length}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-rose-400 font-mono">
                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                        <span>-{diffLines.filter(d => d.type === 'removed').length}</span>
                      </span>
                    </div>
                  </div>

                  {/* Restore Action */}
                  <div className="flex items-center space-x-2">
                    {confirmRestore ? (
                      <div className="flex items-center space-x-1.5 animate-in fade-in">
                        <span className="text-xs text-amber-300 font-medium">Wirklich überschreiben?</span>
                        <button
                          onClick={handleRestore}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition shadow"
                        >
                          Ja, Wiederherstellen
                        </button>
                        <button
                          onClick={() => setConfirmRestore(false)}
                          className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRestore(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                        title="Gesamtes Projekt auf diesen Snapshot zurücksetzen"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Diesen Snapshot wiederherstellen</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Diff Code View */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed select-text space-y-0.5">
                  {diffLines.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      Keine Textunterschiede in dieser Datei zwischen Snapshot und aktuellem Stand.
                    </div>
                  ) : (
                    diffLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={`flex px-2 py-0.5 rounded transition ${
                          line.type === 'added'
                            ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                            : line.type === 'removed'
                            ? 'bg-rose-950/40 text-rose-300 line-through border-l-2 border-rose-500 opacity-70'
                            : 'text-slate-400'
                        }`}
                      >
                        <span className="w-10 select-none text-slate-600 text-right pr-3 font-mono text-[10px]">
                          {line.newLineNumber || line.oldLineNumber || ''}
                        </span>
                        <span className="w-4 select-none font-bold text-center">
                          {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                        </span>
                        <span className="whitespace-pre-wrap flex-1">{line.text || ' '}</span>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                <div className="text-center">
                  <FileCode className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                  <p>Wähle links einen Snapshot aus, um den Diff-Vergleich anzuzeigen.</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
