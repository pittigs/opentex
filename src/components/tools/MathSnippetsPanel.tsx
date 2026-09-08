import React, { useState } from 'react';
import { Sigma, X, Sparkles } from 'lucide-react';

interface MathSnippetsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet: (snippet: string) => void;
}

export const MathSnippetsPanel: React.FC<MathSnippetsPanelProps> = ({
  isOpen,
  onClose,
  onInsertSnippet
}) => {
  const [activeTab, setActiveTab] = useState<'greek' | 'operators' | 'envs' | 'symbols'>('greek');

  if (!isOpen) return null;

  const greekLetters = [
    { label: 'α', code: '\\alpha ' },
    { label: 'β', code: '\\beta ' },
    { label: 'γ', code: '\\gamma ' },
    { label: 'δ', code: '\\delta ' },
    { label: 'ε', code: '\\epsilon ' },
    { label: 'ζ', code: '\\zeta ' },
    { label: 'η', code: '\\eta ' },
    { label: 'θ', code: '\\theta ' },
    { label: 'λ', code: '\\lambda ' },
    { label: 'μ', code: '\\mu ' },
    { label: 'π', code: '\\pi ' },
    { label: 'ρ', code: '\\rho ' },
    { label: 'σ', code: '\\sigma ' },
    { label: 'τ', code: '\\tau ' },
    { label: 'φ', code: '\\phi ' },
    { label: 'ω', code: '\\omega ' },
    { label: 'Γ', code: '\\Gamma ' },
    { label: 'Δ', code: '\\Delta ' },
    { label: 'Θ', code: '\\Theta ' },
    { label: 'Λ', code: '\\Lambda ' },
    { label: 'Σ', code: '\\Sigma ' },
    { label: 'Φ', code: '\\Phi ' },
    { label: 'Ψ', code: '\\Psi ' },
    { label: 'Ω', code: '\\Omega ' }
  ];

  const operators = [
    { label: 'a/b', code: '\\frac{a}{b}' },
    { label: '√x', code: '\\sqrt{x}' },
    { label: 'xⁿ', code: 'x^{n}' },
    { label: 'xₙ', code: 'x_{n}' },
    { label: '∫', code: '\\int_{a}^{b} f(x) \\, dx' },
    { label: '∑', code: '\\sum_{i=1}^{n} a_i' },
    { label: '∏', code: '\\prod_{i=1}^{n} x_i' },
    { label: 'lim', code: '\\lim_{x \\to \\infty}' },
    { label: '∂f/∂x', code: '\\frac{\\partial f}{\\partial x}' },
    { label: '∇', code: '\\nabla ' },
    { label: '∞', code: '\\infty ' },
    { label: '±', code: '\\pm ' }
  ];

  const symbols = [
    { label: '≤', code: '\\le ' },
    { label: '≥', code: '\\ge ' },
    { label: '≠', code: '\\neq ' },
    { label: '≈', code: '\\approx ' },
    { label: '∈', code: '\\in ' },
    { label: '∉', code: '\\notin ' },
    { label: '⊂', code: '\\subset ' },
    { label: '⊆', code: '\\subseteq ' },
    { label: '∀', code: '\\forall ' },
    { label: '∃', code: '\\exists ' },
    { label: '→', code: '\\to ' },
    { label: '⇒', code: '\\implies ' },
    { label: '⇔', code: '\\iff ' },
    { label: '·', code: '\\cdot ' },
    { label: '×', code: '\\times ' },
    { label: 'ℝ', code: '\\mathbb{R}' },
    { label: 'ℕ', code: '\\mathbb{N}' },
    { label: 'ℤ', code: '\\mathbb{Z}' },
    { label: 'ℂ', code: '\\mathbb{C}' }
  ];

  const environments = [
    {
      name: 'Equation (nummeriert)',
      code: `\\begin{equation}
  E = m c^2
  \\label{eq:einstein}
\\end{equation}`
    },
    {
      name: 'Align (mehrzeilig)',
      code: `\\begin{align}
  f(x) &= a x^2 + b x + c \\\\
  g(x) &= 2 a x + b
\\end{align}`
    },
    {
      name: 'Matrix (Klammern)',
      code: `\\begin{pmatrix}
  a_{11} & a_{12} \\\\
  a_{21} & a_{22}
\\end{pmatrix}`
    },
    {
      name: 'Tabelle (Booktabs)',
      code: `\\begin{table}[htbp]
\\centering
\\caption{Beispieltabelle}
\\begin{tabular}{llr}
\\toprule
\\textbf{Parameter} & \\textbf{Typ} & \\textbf{Wert} \\\\
\\midrule
Alpha & Float & 0.05 \\\\
Beta & Integer & 42 \\\\
\\bottomrule
\\end{tabular}
\\label{tab:params}
\\end{table}`
    },
    {
      name: 'Abbildung / Figure',
      code: `\\begin{figure}[htbp]
\\centering
% \\includegraphics[width=0.8\\linewidth]{grafik.png}
\\caption{Beschreibung der Abbildung}
\\label{fig:diagram}
\\end{figure}`
    },
    {
      name: 'Aufzählung (Itemize)',
      code: `\\begin{itemize}
  \\item Erster Punkt
  \\item Zweiter Punkt
\\end{itemize}`
    }
  ];

  return (
    <div className="w-80 border-r border-slate-800 bg-slate-900/95 flex flex-col h-full z-20 select-none shadow-xl">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sigma className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">Symbol- & Formel-Assistent</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 p-1.5 bg-slate-950/60 border-b border-slate-800 text-[11px] gap-1">
        <button
          onClick={() => setActiveTab('greek')}
          className={`py-1 rounded font-medium transition ${
            activeTab === 'greek' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Griechisch
        </button>
        <button
          onClick={() => setActiveTab('operators')}
          className={`py-1 rounded font-medium transition ${
            activeTab === 'operators' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Operatoren
        </button>
        <button
          onClick={() => setActiveTab('symbols')}
          className={`py-1 rounded font-medium transition ${
            activeTab === 'symbols' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Symbole
        </button>
        <button
          onClick={() => setActiveTab('envs')}
          className={`py-1 rounded font-medium transition ${
            activeTab === 'envs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Blöcke
        </button>
      </div>

      {/* Content */}
      <div className="p-3 overflow-y-auto flex-1">
        {activeTab === 'greek' && (
          <div className="grid grid-cols-4 gap-1.5">
            {greekLetters.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onInsertSnippet(item.code)}
                className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white rounded border border-slate-700/60 text-center font-serif text-sm transition"
                title={item.code}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'operators' && (
          <div className="grid grid-cols-3 gap-1.5">
            {operators.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onInsertSnippet(item.code)}
                className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white rounded border border-slate-700/60 text-center font-mono text-xs transition"
                title={item.code}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'symbols' && (
          <div className="grid grid-cols-4 gap-1.5">
            {symbols.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onInsertSnippet(item.code)}
                className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white rounded border border-slate-700/60 text-center font-serif text-sm transition"
                title={item.code}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'envs' && (
          <div className="space-y-2">
            {environments.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onInsertSnippet(item.code + '\n')}
                className="w-full text-left p-2.5 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500 rounded border border-slate-700/60 text-xs transition group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-indigo-400 mb-1">
                  {item.name}
                </div>
                <pre className="text-[10px] text-slate-400 font-mono overflow-hidden truncate">
                  {item.code.split('\n')[0]}
                </pre>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 flex items-center space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>Klick fügt Code an aktueller Cursorposition ein.</span>
      </div>
    </div>
  );
};
