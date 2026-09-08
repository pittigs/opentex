import type { CompilerLogEntry } from '../types';

export interface ParsedDocument {
  docClass: string;
  isTwoColumn: boolean;
  isBeamer: boolean;
  isReport: boolean;
  title: string;
  subtitle?: string;
  authors: string[];
  institution?: string;
  abstract?: string;
  keywords?: string[];
  sections: ParsedSection[];
  wordCount: number;
  charCount: number;
  equationCount: number;
  tableCount: number;
}

export interface ParsedSection {
  type: 'section' | 'subsection' | 'chapter' | 'paragraph' | 'math' | 'table' | 'frame' | 'raw';
  title?: string;
  content: string;
  rawMath?: string;
  lineNumber?: number;
}

export function analyzeLatexCode(code: string): { logs: CompilerLogEntry[]; parsed: ParsedDocument } {
  const logs: CompilerLogEntry[] = [];
  const lines = code.split('\n');

  // Syntax checking
  const openEnvs: { name: string; line: number }[] = [];
  let mathMode = false;

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const cleanLine = line.replace(/%.*$/, ''); // strip comments

    // Check environment open/close
    const beginMatches = cleanLine.matchAll(/\\begin\{([a-zA-Z0-9*]+)\}/g);
    for (const match of beginMatches) {
      openEnvs.push({ name: match[1], line: lineNum });
    }

    const endMatches = cleanLine.matchAll(/\\end\{([a-zA-Z0-9*]+)\}/g);
    for (const match of endMatches) {
      const envName = match[1];
      if (openEnvs.length === 0) {
        logs.push({
          type: 'error',
          line: lineNum,
          message: `Unerwartetes \\end{${envName}} ohne vorheriges \\begin{${envName}}`,
          raw: `! LaTeX Error: \\end{${envName}} without \\begin`
        });
      } else {
        const last = openEnvs.pop();
        if (last && last.name !== envName) {
          logs.push({
            type: 'error',
            line: lineNum,
            message: `Umgebungskonflikt: \\begin{${last.name}} (Zeile ${last.line}) wurde mit \\end{${envName}} geschlossen`,
            raw: `! LaTeX Error: \\begin{${last.name}} on input line ${last.line} ended by \\end{${envName}}.`
          });
        }
      }
    }

    // Check unclosed inline math $ ... $
    const dollarCount = (cleanLine.match(/(?<!\\)\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
      mathMode = !mathMode;
    }

    // Warning for overfull hbox or long lines
    if (line.length > 200) {
      logs.push({
        type: 'warning',
        line: lineNum,
        message: `Überlange Zeile (${line.length} Zeichen) — mögliche Overfull \\hbox`,
        raw: `Overfull \\hbox (14.2pt too wide) in paragraph at lines ${lineNum}--${lineNum}`
      });
    }

    // Check undefined citation or refs
    if (/\\cite\{\s*\}/.test(cleanLine)) {
      logs.push({
        type: 'warning',
        line: lineNum,
        message: 'Leere Zitation \\cite{} gefunden',
        raw: `LaTeX Warning: Citation \`' on page 1 undefined on input line ${lineNum}.`
      });
    }
  });

  if (openEnvs.length > 0) {
    for (const env of openEnvs) {
      logs.push({
        type: 'error',
        line: env.line,
        message: `Nicht geschlossene Umgebung: \\begin{${env.name}}`,
        raw: `! LaTeX Error: \\begin{${env.name}} on line ${env.line} not closed by end of document.`
      });
    }
  }

  // Parse Document Properties
  const docClassMatch = code.match(/\\documentclass(?:\[(.*?)\])?\{([a-zA-Z0-9]+)\}/);
  const docClassOptions = docClassMatch?.[1] || '';
  const docClass = docClassMatch?.[2] || 'article';
  const isTwoColumn = docClassOptions.includes('twocolumn') || docClass === 'IEEEtran';
  const isBeamer = docClass === 'beamer';
  const isReport = docClass === 'report';

  const titleMatch = code.match(/\\title(?:\[(.*?)\])?\{([\s\S]*?)\}(?=\s*\\|\s*\n\s*\\|\s*$)/);
  const title = titleMatch ? cleanLatexString(titleMatch[2]) : 'Unbenanntes LaTeX Dokument';

  const authorMatch = code.match(/\\author(?:\[(.*?)\])?\{([\s\S]*?)\}(?=\s*\\|\s*\n\s*\\|\s*$)/);
  const authorRaw = authorMatch ? authorMatch[2] : 'Autor';
  const authors = authorRaw
    .split(/\\and|\\thanks\{.*?\}|,/)
    .map(a => cleanLatexString(a).trim())
    .filter(a => a.length > 0 && !a.startsWith('e-mail'));

  const abstractMatch = code.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/);
  const abstract = abstractMatch ? cleanLatexString(abstractMatch[1]).trim() : undefined;

  // Extract Sections & Content
  const sections: ParsedSection[] = [];
  const words = code.replace(/\\.*?(?:\{.*?\}|\[.*?\])?/g, ' ').trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = code.length;
  const equationCount = (code.match(/\\begin\{(?:equation|align|gather)\*?\}/g) || []).length + (code.match(/\$\$[\s\S]*?\$\$/g) || []).length;
  const tableCount = (code.match(/\\begin\{tabular/g) || []).length;

  return {
    logs,
    parsed: {
      docClass,
      isTwoColumn,
      isBeamer,
      isReport,
      title,
      authors: authors.length ? authors : ['Autor'],
      abstract,
      sections,
      wordCount,
      charCount,
      equationCount,
      tableCount
    }
  };
}

export function cleanLatexString(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\textbf\{([\s\S]*?)\}/g, '$1')
    .replace(/\\textit\{([\s\S]*?)\}/g, '$1')
    .replace(/\\emph\{([\s\S]*?)\}/g, '$1')
    .replace(/\\underline\{([\s\S]*?)\}/g, '$1')
    .replace(/\\IEEEmembership\{[\s\S]*?\}/g, '')
    .replace(/\\thanks\{[\s\S]*?\}/g, '')
    .replace(/\\MakeLowercase\{([\s\S]*?)\}/g, '$1')
    .replace(/\\Large|\\huge|\\Huge|\\large|\\normalsize|\\small|\\bfseries|\\centering|\\par|\\\\/g, '')
    .replace(/~|\\enspace|\\quad|\\qquad/g, ' ')
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
