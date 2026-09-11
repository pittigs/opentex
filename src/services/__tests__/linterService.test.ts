import { describe, it, expect } from 'vitest';
import {
  calculateDocumentStats,
  analyzeLatexText,
  autoFixQuotes,
  autoFixTildes,
  autoFixDuplicates
} from '../linterService';

describe('linterService', () => {
  const sampleLatex = `
\\documentclass{article}
\\begin{document}
\\title{Quantum Computing}

This is a very important paper about algorithms in Figure \\ref{fig:model}.
As shown by Schmidt \\cite{schmidt2024}, the the result is obviously correct.
The system uses "state of the art" techniques.

$E = mc^2$

\\begin{equation}
\\int_{0}^{\\infty} e^{-x} dx = 1
\\end{equation}

\\end{document}
`;

  it('should calculate accurate document statistics', () => {
    const stats = calculateDocumentStats(sampleLatex);
    expect(stats.wordCount).toBeGreaterThan(10);
    expect(stats.equationCount).toBe(2);
    expect(stats.citationCount).toBe(1);
    expect(stats.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    expect(stats.readabilityScore).toBeGreaterThanOrEqual(0);
    expect(stats.readabilityScore).toBeLessThanOrEqual(100);
  });

  it('should detect academic style and formatting issues', () => {
    const issues = analyzeLatexText(sampleLatex);
    expect(issues.length).toBeGreaterThan(0);

    const refIssue = issues.find(i => i.id.startsWith('ref-tilde'));
    expect(refIssue).toBeDefined();

    const citeIssue = issues.find(i => i.id.startsWith('cite-tilde'));
    expect(citeIssue).toBeDefined();

    const dupIssue = issues.find(i => i.id.startsWith('dup-'));
    expect(dupIssue).toBeDefined();
    expect(dupIssue?.excerpt).toContain('the the');

    const quoteIssue = issues.find(i => i.id.startsWith('quote-'));
    expect(quoteIssue).toBeDefined();

    const weaselIssue = issues.find(i => i.id.startsWith('weasel-'));
    expect(weaselIssue).toBeDefined();
  });

  it('should auto-fix typographic quotes', () => {
    const input = 'This is a "cool" feature and "another one".';
    const fixed = autoFixQuotes(input);
    expect(fixed).toBe("This is a ``cool'' feature and ``another one''.");
  });

  it('should auto-fix missing non-breaking spaces', () => {
    const input = 'See Figure \\ref{fig:1} and study \\cite{paper1}.';
    const fixed = autoFixTildes(input);
    expect(fixed).toBe('See Figure~\\ref{fig:1} and study~\\cite{paper1}.');
  });

  it('should auto-fix duplicate words', () => {
    const input = 'This is the the paper in in the journal.';
    const fixed = autoFixDuplicates(input);
    expect(fixed).toBe('This is the paper in the journal.');
  });
});
