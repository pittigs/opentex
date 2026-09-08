import React, { useRef, useEffect, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Code, Eye, MessageSquarePlus } from 'lucide-react';
import type { CompilerLogEntry, Collaborator } from '../../types';
import katex from 'katex';
import { cleanLatexString } from '../../services/latexParser';

interface LatexEditorProps {
  value: string;
  onChange: (val: string) => void;
  fileName: string;
  logs: CompilerLogEntry[];
  collaborators: Collaborator[];
  onCursorChange?: (line: number) => void;
  isDarkMode: boolean;
  editorRef?: React.MutableRefObject<any>;
  onAddCommentAtLine?: (line: number) => void;
}

export const LatexEditor: React.FC<LatexEditorProps> = ({
  value,
  onChange,
  fileName,
  logs,
  collaborators,
  onCursorChange,
  isDarkMode,
  editorRef: externalRef,
  onAddCommentAtLine
}) => {
  const internalEditorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [editorMode, setEditorMode] = useState<'source' | 'visual'>('source');
  const [currentLine, setCurrentLine] = useState(1);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    internalEditorRef.current = editor;
    monacoRef.current = monaco;
    if (externalRef) {
      externalRef.current = editor;
    }

    // Register LaTeX snippets
    monaco.languages.registerCompletionItemProvider('latex', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: '\\section',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '\\section{${1:Titel}}\n$0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Fügt einen neuen Hauptabschnitt ein',
            range,
          },
          {
            label: '\\subsection',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '\\subsection{${1:Unterabschnitt}}\n$0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Fügt einen Unterabschnitt ein',
            range,
          },
          {
            label: '\\begin{equation}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '\\begin{equation}\n\t${1:E = mc^2}\n\t\\label{eq:${2:label}}\n\\end{equation}\n$0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Nummerierte mathematische Gleichung',
            range,
          },
          {
            label: '\\begin{figure}',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '\\begin{figure}[htbp]\n\t\\centering\n\t\\includegraphics[width=${1:0.8}\\linewidth]{${2:image.png}}\n\t\\caption{${3:Bildunterschrift}}\n\t\\label{fig:${4:label}}\n\\end{figure}\n$0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Abbildung / Figure einfügen',
            range,
          },
          {
            label: '\\cite',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '\\cite{${1:key}}$0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Literaturverweis zitieren',
            range,
          },
          {
            label: '\\ref',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '\\ref{${1:label}}$0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Querverweis einfügen',
            range,
          },
          {
            label: '\\textbf',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '\\textbf{${1:Fettgedruckter Text}}$0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Fetter Text',
            range,
          },
          {
            label: '\\textit',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '\\textit{${1:Kursiver Text}}$0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Kursiver Text',
            range,
          },
        ];

        return { suggestions };
      },
    });

    // Track Cursor Changes
    editor.onDidChangeCursorPosition((e) => {
      setCurrentLine(e.position.lineNumber);
      if (onCursorChange) {
        onCursorChange(e.position.lineNumber);
      }
    });
  };

  // Update error markers whenever logs change
  useEffect(() => {
    if (monacoRef.current && internalEditorRef.current) {
      const monaco = monacoRef.current;
      const model = internalEditorRef.current.getModel();
      if (!model) return;

      const markers = logs
        .filter((l) => l.line && (l.type === 'error' || l.type === 'warning'))
        .map((l) => ({
          startLineNumber: l.line!,
          endLineNumber: l.line!,
          startColumn: 1,
          endColumn: 120,
          message: l.message,
          severity:
            l.type === 'error'
              ? monaco.MarkerSeverity.Error
              : monaco.MarkerSeverity.Warning,
        }));

      monaco.editor.setModelMarkers(model, 'latex', markers);
    }
  }, [logs]);

  // Visual Editor Renderer
  const renderVisualEditor = () => {
    const lines = value.split('\n');
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-4 font-serif text-slate-200">
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 font-sans flex items-center justify-between">
          <span>✨ <strong>Visueller Modus (WYSIWYM):</strong> Strukturiertes Editieren mit gerenderten Gleichungen.</span>
          <button
            onClick={() => setEditorMode('source')}
            className="text-xs text-indigo-400 hover:underline font-semibold"
          >
            Zu Quellcode wechseln
          </button>
        </div>

        {lines.map((line, idx) => {
          const cleanLine = line.trim();

          if (cleanLine.startsWith('\\section{')) {
            const title = cleanLine.match(/\\section\{(.*?)\}/)?.[1] || '';
            return (
              <h2 key={idx} className="text-xl font-bold font-sans text-white border-b border-slate-800 pb-1 mt-6">
                {title}
              </h2>
            );
          }
          if (cleanLine.startsWith('\\subsection{')) {
            const title = cleanLine.match(/\\subsection\{(.*?)\}/)?.[1] || '';
            return (
              <h3 key={idx} className="text-base font-bold font-sans text-indigo-300 mt-4">
                {title}
              </h3>
            );
          }
          if (cleanLine.startsWith('\\begin{equation}') || cleanLine.startsWith('\\end{equation}')) {
            return null;
          }
          if (cleanLine.includes('\\frac') || cleanLine.includes('\\sum') || cleanLine.includes('\\int')) {
            try {
              const rendered = katex.renderToString(cleanLine, { displayMode: true, throwOnError: false });
              return (
                <div
                  key={idx}
                  className="my-3 py-2 bg-slate-900 rounded border border-slate-800 text-center"
                  dangerouslySetInnerHTML={{ __html: rendered }}
                />
              );
            } catch {
              return null;
            }
          }

          if (cleanLine.length > 0 && !cleanLine.startsWith('\\') && !cleanLine.startsWith('%')) {
            return (
              <p key={idx} className="text-sm leading-relaxed text-slate-300">
                {cleanLatexString(cleanLine)}
              </p>
            );
          }

          return null;
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-950 overflow-hidden relative">
      {/* File Tab Header */}
      <div className="h-8 border-b border-slate-800 bg-slate-900/80 px-3 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-indigo-300 font-medium">{fileName}</span>
            <span className="text-[10px] text-slate-500 font-sans">• Zeile {currentLine}</span>
          </div>

          {/* Source vs Visual Toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
            <button
              onClick={() => setEditorMode('source')}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded font-medium transition ${
                editorMode === 'source' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Quelltext</span>
            </button>
            <button
              onClick={() => setEditorMode('visual')}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded font-medium transition ${
                editorMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Visuell</span>
            </button>
          </div>
        </div>

        {/* Right: Comments at current line & Live Collaborators */}
        <div className="flex items-center space-x-2">
          {onAddCommentAtLine && (
            <button
              onClick={() => onAddCommentAtLine(currentLine)}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] border border-slate-700 transition"
              title="Kommentar an aktueller Zeile anheften"
            >
              <MessageSquarePlus className="w-3 h-3 text-emerald-400" />
              <span>Kommentar (Z.{currentLine})</span>
            </button>
          )}

          {collaborators.map((c) => (
            <div
              key={c.id}
              className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: `${c.color}22`, color: c.color, border: `1px solid ${c.color}44` }}
            >
              <span>{c.name}</span>
              {c.cursorLine && <span className="opacity-75 font-mono">Z.{c.cursorLine}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full h-full relative">
        {editorMode === 'source' ? (
          <Editor
            height="100%"
            language={fileName.endsWith('.bib') ? 'bibtex' : 'latex'}
            value={value}
            theme={isDarkMode ? 'vs-dark' : 'light'}
            onChange={(val) => onChange(val || '')}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 13,
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              fontLigatures: true,
              lineNumbers: 'on',
              lineNumbersMinChars: 3,
              glyphMargin: true,
              folding: true,
              minimap: { enabled: true, maxColumn: 80, renderCharacters: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
            }}
          />
        ) : (
          <div className="h-full overflow-y-auto bg-slate-950">
            {renderVisualEditor()}
          </div>
        )}
      </div>
    </div>
  );
};
