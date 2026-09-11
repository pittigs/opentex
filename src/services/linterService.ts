import type { DocumentStats, LinterIssue } from '../types';

/**
 * Strips comments from LaTeX code (% not preceded by backslash)
 */
export function stripComments(latex: string): string {
  return latex
    .split('\n')
    .map(line => {
      const commentIndex = line.search(/(?<!\\)%/);
      return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
    })
    .join('\n');
}

/**
 * Rough syllable estimator for English/academic words
 */
function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return 1;
  const matches = clean.match(/[aeiouy]{1,2}/g);
  let count = matches ? matches.length : 1;
  if (clean.endsWith('e') && !clean.endsWith('le')) count--;
  return Math.max(1, count);
}

/**
 * Calculates real-time document statistics for LaTeX text
 */
export function calculateDocumentStats(rawLatex: string): DocumentStats {
  const cleanLatex = stripComments(rawLatex);

  // Equation count
  const inlineMath = (cleanLatex.match(/\$[^$]+\$/g) || []).length;
  const displayMath = (cleanLatex.match(/\$\$[\s\S]*?\$\$/g) || []).length;
  const envMath = (cleanLatex.match(/\\begin\{(?:equation|align|gather|multline|matrix|pmatrix)\*?\}[\s\S]*?\\end\{(?:equation|align|gather|multline|matrix|pmatrix)\*?\}/g) || []).length;
  const equationCount = inlineMath + displayMath + envMath;

  // Citations count
  const citationMatches = cleanLatex.match(/\\cite[a-z]*\{([^}]+)\}/g) || [];
  let citationCount = 0;
  citationMatches.forEach(c => {
    const keys = c.replace(/\\cite[a-z]*\{/, '').replace(/\}/, '').split(',');
    citationCount += keys.length;
  });

  // Strip LaTeX commands for pure prose word count
  const prose = cleanLatex
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]+\$/g, ' ')
    .replace(/\\begin\{(?:equation|align|gather|multline|matrix|pmatrix|figure|table)\*?\}[\s\S]*?\\end\{(?:equation|align|gather|multline|matrix|pmatrix|figure|table)\*?\}/g, ' ')
    .replace(/\\(?:begin|end)\{[^}]+\}/g, ' ')
    .replace(/\\[a-zA-Z]+(?:\[[^\]]*\])?(?:\{[^}]*\})?/g, ' ')
    .replace(/[{}]/g, ' ')
    .trim();

  const words = prose.split(/\s+/).filter(w => w.length > 0 && /[a-zA-Z0-9]/.test(w));
  const wordCount = words.length;

  const characterCount = rawLatex.length;
  const characterCountNoSpaces = rawLatex.replace(/\s/g, '').length;

  const paragraphs = cleanLatex
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0);
  const paragraphCount = Math.max(1, paragraphs.length);

  const sentences = prose.split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 2);
  const sentenceCount = Math.max(1, sentences.length);

  // Reading time at average academic rate ~180-200 wpm
  const readingTimeMinutes = Math.max(1, Math.round((wordCount / 200) * 10) / 10);

  // Flesch Reading Ease = 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  let totalSyllables = 0;
  words.forEach(w => {
    totalSyllables += countSyllables(w);
  });

  let readabilityScore = 65; // default moderate
  if (wordCount > 10 && sentenceCount > 0) {
    const score = 206.835 - (1.015 * (wordCount / sentenceCount)) - (84.6 * (totalSyllables / Math.max(1, wordCount)));
    readabilityScore = Math.min(100, Math.max(0, Math.round(score)));
  }

  let gradeLevel = 'Standard';
  if (readabilityScore >= 80) gradeLevel = 'Leicht verständlich';
  else if (readabilityScore >= 60) gradeLevel = 'Standard (Gute Lesbarkeit)';
  else if (readabilityScore >= 40) gradeLevel = 'Akademisch / Fachpublikation';
  else if (readabilityScore >= 20) gradeLevel = 'Sehr komplex (Doktorarbeit / Math)';
  else gradeLevel = 'Extrem dicht & formal';

  return {
    wordCount,
    characterCount,
    characterCountNoSpaces,
    paragraphCount,
    sentenceCount,
    equationCount,
    citationCount,
    readingTimeMinutes,
    readabilityScore,
    gradeLevel
  };
}

/**
 * Scans LaTeX source code and returns actionable linting issues
 */
export function analyzeLatexText(rawLatex: string): LinterIssue[] {
  const issues: LinterIssue[] = [];
  const lines = rawLatex.split('\n');

  // Weasel words to flag in scientific papers
  const weaselWords = [
    { word: 'obviously', msg: 'Vermeide "obviously" in wissenschaftlichen Arbeiten; begründe Aussagen formal.' },
    { word: 'clearly', msg: 'Vermeide "clearly" – ein formaler Beweis oder Zitat ist besser.' },
    { word: 'very', msg: 'Das Wort "very" schwächt präzise wissenschaftliche Aussagen ab.' },
    { word: 'extremely', msg: 'Verwende quantifizierbare Metriken statt "extremely".' },
    { word: 'it is obvious that', msg: 'Aussagen als "offensichtlich" zu bezeichnen wirkt unwissenschaftlich.' },
    { word: 'it goes without saying', msg: 'Füllphrase ohne wissenschaftlichen Mehrwert.' }
  ];

  // Stack to track environments
  const envStack: { name: string; line: number }[] = [];

  lines.forEach((lineText, lineIdx) => {
    const lineNum = lineIdx + 1;
    const commentIdx = lineText.search(/(?<!\\)%/);
    const activeText = commentIdx >= 0 ? lineText.substring(0, commentIdx) : lineText;

    // 1. Missing non-breaking space before \ref (e.g. "Figure \ref{...}" or "Section \ref{...}")
    const refRegex = /(Figure|Table|Section|Fig\.|Tab\.|Sec\.|Equation|Eq\.|Theorem|Lemma)\s+(\\ref\{[^}]+\})/g;
    let matchRef;
    while ((matchRef = refRegex.exec(activeText)) !== null) {
      issues.push({
        id: `ref-tilde-${lineNum}-${matchRef.index}`,
        line: lineNum,
        severity: 'warning',
        category: 'latex',
        message: `Geschütztes Leerzeichen (~) empfohlen vor Referenz: "${matchRef[1]}~${matchRef[2]}"`,
        excerpt: matchRef[0],
        fixSuggestion: {
          label: `Ersetze durch "${matchRef[1]}~${matchRef[2]}"`,
          targetText: matchRef[0],
          replacementText: `${matchRef[1]}~${matchRef[2]}`
        }
      });
    }

    // 2. Missing non-breaking space before \cite (e.g. "word \cite{...}")
    const citeRegex = /([a-zA-Z0-9)])\s+(\\cite[a-z]*\{[^}]+\})/g;
    let matchCite;
    while ((matchCite = citeRegex.exec(activeText)) !== null) {
      issues.push({
        id: `cite-tilde-${lineNum}-${matchCite.index}`,
        line: lineNum,
        severity: 'warning',
        category: 'citation',
        message: `Geschütztes Leerzeichen (~) vor Zitat empfohlen: "${matchCite[1]}~${matchCite[2]}"`,
        excerpt: matchCite[0],
        fixSuggestion: {
          label: `Ersetze durch "${matchCite[1]}~${matchCite[2]}"`,
          targetText: matchCite[0],
          replacementText: `${matchCite[1]}~${matchCite[2]}`
        }
      });
    }

    // 3. ASCII straight double quotes ("...") instead of LaTeX quotes (``...'')
    const quoteRegex = /"([^"\n]{2,80})"/g;
    let matchQuote;
    while ((matchQuote = quoteRegex.exec(activeText)) !== null) {
      issues.push({
        id: `quote-${lineNum}-${matchQuote.index}`,
        line: lineNum,
        severity: 'info',
        category: 'style',
        message: `LaTeX-typografische Anführungszeichen verwenden: \`\`${matchQuote[1]}''`,
        excerpt: matchQuote[0],
        fixSuggestion: {
          label: `Ersetze mit typografischen Anführungszeichen`,
          targetText: matchQuote[0],
          replacementText: `\`\`${matchQuote[1]}''`
        }
      });
    }

    // 4. Repeated consecutive words (e.g. "the the", "in in")
    const duplicateWordRegex = /\b([a-zA-Z]{2,})\s+\1\b/gi;
    let matchDup;
    while ((matchDup = duplicateWordRegex.exec(activeText)) !== null) {
      issues.push({
        id: `dup-${lineNum}-${matchDup.index}`,
        line: lineNum,
        severity: 'warning',
        category: 'grammar',
        message: `Doppeltes Wort gefunden: "${matchDup[0]}"`,
        excerpt: matchDup[0],
        fixSuggestion: {
          label: `Dopplung entfernen (nur "${matchDup[1]}")`,
          targetText: matchDup[0],
          replacementText: matchDup[1]
        }
      });
    }

    // 5. Scientific Weasel words check
    weaselWords.forEach(w => {
      const regex = new RegExp(`\\b${w.word}\\b`, 'gi');
      let matchW;
      while ((matchW = regex.exec(activeText)) !== null) {
        issues.push({
          id: `weasel-${lineNum}-${matchW.index}`,
          line: lineNum,
          severity: 'info',
          category: 'style',
          message: w.msg,
          excerpt: matchW[0]
        });
      }
    });

    // 6. Track \begin{...} and \end{...} environments
    const beginMatches = activeText.matchAll(/\\begin\{([a-zA-Z*]+)\}/g);
    for (const b of beginMatches) {
      envStack.push({ name: b[1], line: lineNum });
    }

    const endMatches = activeText.matchAll(/\\end\{([a-zA-Z*]+)\}/g);
    for (const e of endMatches) {
      const envName = e[1];
      const lastIndex = envStack.map(x => x.name).lastIndexOf(envName);
      if (lastIndex >= 0) {
        envStack.splice(lastIndex, 1);
      } else {
        issues.push({
          id: `unmatched-end-${lineNum}`,
          line: lineNum,
          severity: 'error',
          category: 'latex',
          message: `\\end{${envName}} ohne vorheriges passendes \\begin{${envName}}`,
          excerpt: e[0]
        });
      }
    }

    // 7. Long sentences warning (> 40 words in single line)
    const wordsInLine = activeText.split(/\s+/).filter(w => w.length > 0 && /[a-zA-Z]/.test(w));
    if (wordsInLine.length > 45 && !activeText.includes('\\begin') && !activeText.includes('\\item')) {
      issues.push({
        id: `long-sentence-${lineNum}`,
        line: lineNum,
        severity: 'info',
        category: 'readability',
        message: `Sehr lange Zeile / Satz (${wordsInLine.length} Wörter). Ziehe eine Aufteilung in Betracht.`,
        excerpt: activeText.substring(0, 60) + '...'
      });
    }
  });

  // Flag any unclosed environments
  envStack.forEach(env => {
    issues.push({
      id: `unclosed-begin-${env.line}`,
      line: env.line,
      severity: 'error',
      category: 'latex',
      message: `\\begin{${env.name}} (Zeile ${env.line}) wurde nie mit \\end{${env.name}} geschlossen`,
      excerpt: `\\begin{${env.name}}`
    });
  });

  return issues;
}

/**
 * 1-Click Auto-Fix: Replaces straight quotes with LaTeX typographic quotes
 */
export function autoFixQuotes(latex: string): string {
  return latex.replace(/"([^"\n]+)"/g, "``$1''");
}

/**
 * 1-Click Auto-Fix: Adds non-breaking spaces (~) before references and citations
 */
export function autoFixTildes(latex: string): string {
  return latex
    .replace(/(Figure|Table|Section|Fig\.|Tab\.|Sec\.|Equation|Eq\.|Theorem|Lemma)\s+(\\ref\{[^}]+\})/g, '$1~$2')
    .replace(/([a-zA-Z0-9)])\s+(\\cite[a-z]*\{[^}]+\})/g, '$1~$2');
}

/**
 * 1-Click Auto-Fix: Removes duplicate consecutive words
 */
export function autoFixDuplicates(latex: string): string {
  return latex.replace(/\b([a-zA-Z]{2,})\s+\1\b/gi, '$1');
}
