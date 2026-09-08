import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Copy, Check, Table as TableIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TableEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (latexCode: string) => void;
}

type Alignment = 'l' | 'c' | 'r';

export const TableEditorModal: React.FC<TableEditorModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [alignments, setAlignments] = useState<Alignment[]>(['l', 'c', 'c']);
  const [data, setData] = useState<string[][]>([
    ['Parameter', 'Wert', 'Einheit'],
    ['Temperatur', '293.15', 'K'],
    ['Druck', '1013.25', 'hPa'],
  ]);
  const [useBooktabs, setUseBooktabs] = useState<boolean>(true);
  const [hasVerticalBorders, setHasVerticalBorders] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>('Experimentelle Messwerte');
  const [label, setLabel] = useState<string>('tab:messwerte');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCellChange = (rIdx: number, cIdx: number, value: string) => {
    const newData = data.map((row, r) =>
      r === rIdx ? row.map((cell, c) => (c === cIdx ? value : cell)) : [...row]
    );
    setData(newData);
  };

  const addRow = () => {
    const newRow = Array(cols).fill('');
    setData([...data, newRow]);
    setRows(rows + 1);
  };

  const removeRow = (rIdx: number) => {
    if (data.length <= 1) return;
    setData(data.filter((_, i) => i !== rIdx));
    setRows(rows - 1);
  };

  const addCol = () => {
    setData(data.map((row) => [...row, '']));
    setAlignments([...alignments, 'c']);
    setCols(cols + 1);
  };

  const removeCol = (cIdx: number) => {
    if (cols <= 1) return;
    setData(data.map((row) => row.filter((_, i) => i !== cIdx)));
    setAlignments(alignments.filter((_, i) => i !== cIdx));
    setCols(cols - 1);
  };

  const setColAlign = (cIdx: number, align: Alignment) => {
    const updated = [...alignments];
    updated[cIdx] = align;
    setAlignments(updated);
  };

  const generatedLatex = useMemo(() => {
    let colSpec = alignments.join(hasVerticalBorders ? '|' : '');
    if (hasVerticalBorders) {
      colSpec = `|${colSpec}|`;
    }

    const lines: string[] = [];
    lines.push('\\begin{table}[htbp]');
    lines.push('  \\centering');
    if (caption) {
      lines.push(`  \\caption{${caption}}`);
    }
    if (label) {
      lines.push(`  \\label{${label}}`);
    }
    lines.push(`  \\begin{tabular}{${colSpec}}`);

    if (useBooktabs) {
      lines.push('    \\toprule');
    } else if (hasVerticalBorders) {
      lines.push('    \\hline');
    }

    data.forEach((row, idx) => {
      const rowStr = '    ' + row.map((cell) => cell.trim() || ' ').join(' & ') + ' \\\\';
      lines.push(rowStr);

      if (idx === 0) {
        if (useBooktabs) {
          lines.push('    \\midrule');
        } else {
          lines.push('    \\hline');
        }
      }
    });

    if (useBooktabs) {
      lines.push('    \\bottomrule');
    } else {
      lines.push('    \\hline');
    }

    lines.push('  \\end{tabular}');
    lines.push('\\end{table}');

    return lines.join('\n');
  }, [data, alignments, useBooktabs, hasVerticalBorders, caption, label]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLatex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    onInsert(generatedLatex);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <TableIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Visueller Tabellen-Editor</h2>
              <p className="text-xs text-slate-400">Tabellen visuell bearbeiten und sauberen LaTeX/Booktabs-Code generieren</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Zeile hinzufügen
              </button>
              <button
                onClick={addCol}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Spalte hinzufügen
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useBooktabs}
                  onChange={(e) => setUseBooktabs(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                />
                Booktabs Format (\\toprule, \\midrule)
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVerticalBorders}
                  onChange={(e) => setHasVerticalBorders(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900"
                />
                Vertikale Trennstriche
              </label>
            </div>
          </div>

          {/* Grid View */}
          <div className="border border-slate-700/70 rounded-xl overflow-x-auto bg-slate-950/30">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="p-2 w-10 text-center text-xs text-slate-500 font-normal">#</th>
                  {Array.from({ length: cols }).map((_, cIdx) => (
                    <th key={cIdx} className="p-2 border-l border-slate-800">
                      <div className="flex items-center justify-between gap-1 text-xs">
                        <span className="text-slate-400 font-mono">Spalte {cIdx + 1}</span>
                        <div className="flex items-center gap-0.5">
                          <button
                            title="Linksbündig"
                            onClick={() => setColAlign(cIdx, 'l')}
                            className={`p-1 rounded ${alignments[cIdx] === 'l' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                          >
                            <AlignLeft className="w-3 h-3" />
                          </button>
                          <button
                            title="Zentriert"
                            onClick={() => setColAlign(cIdx, 'c')}
                            className={`p-1 rounded ${alignments[cIdx] === 'c' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                          >
                            <AlignCenter className="w-3 h-3" />
                          </button>
                          <button
                            title="Rechtsbündig"
                            onClick={() => setColAlign(cIdx, 'r')}
                            className={`p-1 rounded ${alignments[cIdx] === 'r' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                          >
                            <AlignRight className="w-3 h-3" />
                          </button>
                          {cols > 1 && (
                            <button
                              title="Spalte löschen"
                              onClick={() => removeCol(cIdx)}
                              className="p-1 text-red-400 hover:bg-red-500/20 rounded ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-800/80 hover:bg-slate-800/20">
                    <td className="p-2 text-center text-xs text-slate-500">
                      {data.length > 1 ? (
                        <button
                          onClick={() => removeRow(rIdx)}
                          title="Zeile löschen"
                          className="text-slate-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      ) : (
                        rIdx + 1
                      )}
                    </td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1.5 border-l border-slate-800/80">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          placeholder={rIdx === 0 ? 'Kopfzeile...' : 'Daten...'}
                          className={`w-full px-2.5 py-1 text-sm bg-slate-900 border border-slate-700/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 ${
                            alignments[cIdx] === 'c'
                              ? 'text-center'
                              : alignments[cIdx] === 'r'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Caption & Label Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tabellenbeschriftung (Caption)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="z. B. Experimentelle Messwerte"
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Referenz-Label (\\ref)</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="z. B. tab:messwerte"
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Code Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Generierter LaTeX-Code</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Kopiert!' : 'Code kopieren'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-44">
              {generatedLatex}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleInsert}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-colors"
          >
            In Dokument einfügen
          </button>
        </div>
      </div>
    </div>
  );
};
