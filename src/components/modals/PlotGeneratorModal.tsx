import React, { useState, useMemo } from 'react';
import { X, LineChart, Copy, Check, BarChart3, ScatterChart } from 'lucide-react';

interface PlotGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (tikzCode: string) => void;
}

type PlotType = 'line' | 'scatter' | 'bar';

const PRESET_DATA = {
  line: `x,y
0,0.0
1,1.5
2,3.8
3,6.2
4,8.9
5,12.5
6,17.1`,
  scatter: `x,y
1.2,2.3
2.1,3.9
2.8,4.1
3.7,6.8
4.4,7.5
5.1,9.8
6.0,11.2`,
  bar: `x,y
1,45
2,78
3,62
4,91
5,84`,
};

export const PlotGeneratorModal: React.FC<PlotGeneratorModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [plotType, setPlotType] = useState<PlotType>('line');
  const [csvData, setCsvData] = useState<string>(PRESET_DATA.line);
  const [title, setTitle] = useState<string>('Messwerte & Analyse');
  const [xlabel, setXlabel] = useState<string>('Zeit $t$ (s)');
  const [ylabel, setYlabel] = useState<string>('Amplitude $A$ (V)');
  const [legend, setLegend] = useState<string>('Signalverlauf');
  const [colorScheme, setColorScheme] = useState<string>('blue!70!black');
  const [hasGrid, setHasGrid] = useState<boolean>(true);
  const [isSmooth, setIsSmooth] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const handleTypeChange = (type: PlotType) => {
    setPlotType(type);
    setCsvData(PRESET_DATA[type]);
    if (type === 'bar') {
      setIsSmooth(false);
    }
  };

  const generatedTikz = useMemo(() => {
    // Parse CSV lines
    const lines = csvData
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const coordinates: string[] = [];
    lines.forEach((line, idx) => {
      // Skip header if non-numeric
      if (idx === 0 && (line.toLowerCase().includes('x') || line.toLowerCase().includes('y'))) {
        return;
      }
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length >= 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
        coordinates.push(`(${parts[0]}, ${parts[1]})`);
      }
    });

    const axisOptions: string[] = [
      'width=10cm',
      'height=6.5cm',
      `xlabel={${xlabel}}`,
      `ylabel={${ylabel}}`,
    ];

    if (title) axisOptions.push(`title={${title}}`);
    if (hasGrid) axisOptions.push('grid=major');
    if (plotType === 'bar') {
      axisOptions.push('ybar', 'bar width=14pt', 'enlargelimits=0.15');
    }

    let plotOptions = `color=${colorScheme}, thick`;
    if (plotType === 'line' && isSmooth) {
      plotOptions += ', smooth';
    }
    if (plotType === 'scatter') {
      plotOptions = `only marks, mark=*, mark size=2.5pt, color=${colorScheme}`;
    }

    return `\\begin{figure}[htbp]
  \\centering
  \\begin{tikzpicture}
    \\begin{axis}[
      ${axisOptions.join(',\n      ')}
    ]
      \\addplot[
        ${plotOptions}
      ] coordinates {
        ${coordinates.join('\n        ')}
      };
      \\addlegendentry{${legend}}
    \\end{axis}
  \\end{tikzpicture}
  \\caption{${title || 'Visualisierung'}}
  \\label{fig:plot_${plotType}}
\\end{figure}`;
  }, [csvData, plotType, title, xlabel, ylabel, legend, colorScheme, hasGrid, isSmooth]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedTikz);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    onInsert(generatedTikz);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">CSV-zu-PGFPlots Generator</h2>
              <p className="text-xs text-slate-400">Rohdaten eingeben und gestochen scharfe TikZ/PGFPlots-Vektordiagramme erzeugen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Plot Type Switcher */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleTypeChange('line')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${
                plotType === 'line'
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/50'
                  : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              <LineChart className="w-4 h-4" /> Liniendiagramm
            </button>
            <button
              onClick={() => handleTypeChange('scatter')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${
                plotType === 'scatter'
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/50'
                  : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              <ScatterChart className="w-4 h-4" /> Punktwolke (Scatter)
            </button>
            <button
              onClick={() => handleTypeChange('bar')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${
                plotType === 'bar'
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/50'
                  : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Balkendiagramm
            </button>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: CSV Input */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                CSV / Messdaten (Spalten getrennt durch Komma, Semikolon oder Tab)
              </label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows={9}
                className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500"
                placeholder="x,y&#10;1,10&#10;2,25&#10;3,40"
              />
            </div>

            {/* Right: Axis & Styling Options */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Diagramm-Titel</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Legende</label>
                  <input
                    type="text"
                    value={legend}
                    onChange={(e) => setLegend(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">X-Achsenbeschriftung</label>
                  <input
                    type="text"
                    value={xlabel}
                    onChange={(e) => setXlabel(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Y-Achsenbeschriftung</label>
                  <input
                    type="text"
                    value={ylabel}
                    onChange={(e) => setYlabel(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Farbschema</label>
                  <select
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 focus:border-teal-500"
                  >
                    <option value="blue!70!black">Klassisches Blau</option>
                    <option value="teal!80!black">Akademisches Teal</option>
                    <option value="purple!70!black">Wissenschaftliches Violett</option>
                    <option value="orange!90!black">Sunset Bernstein</option>
                    <option value="red!70!black">Karminrot</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasGrid}
                      onChange={(e) => setHasGrid(e.target.checked)}
                      className="rounded border-slate-700 text-teal-600 bg-slate-900"
                    />
                    Gitterlinien anzeigen
                  </label>
                  {plotType === 'line' && (
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSmooth}
                        onChange={(e) => setIsSmooth(e.target.checked)}
                        className="rounded border-slate-700 text-teal-600 bg-slate-900"
                      />
                      Geglättete Kurve (Smooth)
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Generated Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Generierter TikZ/PGFPlots-Code</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Kopiert!' : 'Code kopieren'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-48">
              {generatedTikz}
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
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-500/20 transition-colors"
          >
            In Dokument einfügen
          </button>
        </div>
      </div>
    </div>
  );
};
