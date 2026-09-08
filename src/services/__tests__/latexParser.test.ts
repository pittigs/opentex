import { describe, it, expect } from 'vitest';
import { analyzeLatexCode, cleanLatexString } from '../latexParser';

describe('latexParser', () => {
  describe('cleanLatexString', () => {
    it('removes LaTeX formatting commands and returns clean text', () => {
      const input = '\\textbf{Hello} \\textit{World} \\underline{Test}!';
      expect(cleanLatexString(input)).toBe('Hello World Test!');
    });

    it('handles empty or undefined strings gracefully', () => {
      expect(cleanLatexString('')).toBe('');
    });

    it('strips LaTeX symbols and macros like \\&, \\%, and \\_', () => {
      const input = 'Research \\& Development: 50\\% \\_done';
      expect(cleanLatexString(input)).toBe('Research & Development: 50% _done');
    });

    it('strips sizing and alignment macros', () => {
      const input = '\\Large \\bfseries \\centering Meine Überschrift';
      expect(cleanLatexString(input)).toBe('Meine Überschrift');
    });
  });

  describe('analyzeLatexCode', () => {
    it('correctly parses document class and metadata', () => {
      const code = `\\documentclass[twocolumn]{article}
\\title{Künstliche Intelligenz in der Wissenschaft}
\\author{Max Mustermann \\and Maria Schmidt}
\\begin{document}
\\begin{abstract}
Dies ist ein Abstract über KI.
\\end{abstract}
\\section{Einleitung}
Hier beginnt der Text.
\\end{document}`;

      const { logs, parsed } = analyzeLatexCode(code);

      expect(parsed.docClass).toBe('article');
      expect(parsed.isTwoColumn).toBe(true);
      expect(parsed.title).toBe('Künstliche Intelligenz in der Wissenschaft');
      expect(parsed.authors).toEqual(['Max Mustermann', 'Maria Schmidt']);
      expect(parsed.abstract).toBe('Dies ist ein Abstract über KI.');
      expect(parsed.wordCount).toBeGreaterThan(0);
      expect(logs).toHaveLength(0);
    });

    it('detects unclosed environment mismatch', () => {
      const code = `\\documentclass{article}
\\begin{document}
\\begin{itemize}
\\item Test
\\end{enumerate}
\\end{document}`;

      const { logs } = analyzeLatexCode(code);
      expect(logs.some(l => l.type === 'error' && l.message.includes('Umgebungskonflikt'))).toBe(true);
    });

    it('detects unclosed environments at end of document', () => {
      const code = `\\documentclass{article}
\\begin{document}
\\begin{table}
Inhalt
\\end{document}`;

      const { logs } = analyzeLatexCode(code);
      expect(logs.some(l => l.type === 'error' && l.message.includes('Nicht geschlossene Umgebung'))).toBe(true);
    });

    it('detects empty cite warning', () => {
      const code = `\\documentclass{article}
\\begin{document}
Hier ist ein Verweis \\cite{} ohne Key.
\\end{document}`;

      const { logs } = analyzeLatexCode(code);
      expect(logs.some(l => l.type === 'warning' && l.message.includes('Leere Zitation'))).toBe(true);
    });

    it('counts equations and tables accurately', () => {
      const code = `\\documentclass{article}
\\begin{document}
\\begin{equation}
E = mc^2
\\end{equation}
$$a^2 + b^2 = c^2$$
\\begin{tabular}{|c|c|}
1 & 2
\\end{tabular}
\\end{document}`;

      const { parsed } = analyzeLatexCode(code);
      expect(parsed.equationCount).toBe(2);
      expect(parsed.tableCount).toBe(1);
    });
  });
});
