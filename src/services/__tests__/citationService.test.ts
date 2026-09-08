import { describe, it, expect } from 'vitest';
import {
  extractCitationsFromTex,
  extractKeysFromBib,
  auditCitations,
} from '../citationService';

describe('citationService', () => {
  describe('extractCitationsFromTex', () => {
    it('extracts single and multiple citation keys accurately', () => {
      const tex = `
        In recent work \\cite{knuth1984, lamport1994}, researchers have shown...
        Furthermore, \\citep{vaswani2017attention} introduced Transformers.
        See also \\citet{shannon1948}.
      `;
      const keys = extractCitationsFromTex(tex);
      expect(keys).toContain('knuth1984');
      expect(keys).toContain('lamport1994');
      expect(keys).toContain('vaswani2017attention');
      expect(keys).toContain('shannon1948');
      expect(keys).toHaveLength(4);
    });

    it('returns empty array when no citations exist', () => {
      const tex = 'Just plain text without any citation commands.';
      expect(extractCitationsFromTex(tex)).toEqual([]);
    });
  });

  describe('extractKeysFromBib', () => {
    it('extracts all entry keys from a bibtex file', () => {
      const bib = `
@article{knuth1984,
  author = {Donald E. Knuth},
  title = {Literate Programming},
  journal = {The Computer Journal},
  year = {1984}
}

@book{lamport1994,
  author = {Leslie Lamport},
  title = {LaTeX: A Document Preparation System},
  year = {1994}
}

@inproceedings{vaswani2017attention,
  author = {Ashish Vaswani},
  title = {Attention Is All You Need},
  year = {2017}
}
      `;
      const keys = extractKeysFromBib(bib);
      expect(keys).toEqual(['knuth1984', 'lamport1994', 'vaswani2017attention']);
    });
  });

  describe('auditCitations', () => {
    it('identifies missing and unused citation keys', () => {
      const tex = `
        We refer to \\cite{knuth1984} and also to an uncited paper \\cite{unknown2025}.
      `;
      const bib = `
@article{knuth1984,
  title = {Literate Programming}
}
@book{unusedBook,
  title = {Unused Book Reference}
}
      `;

      const audit = auditCitations(tex, bib);

      expect(audit.citedKeys).toEqual(['knuth1984', 'unknown2025']);
      expect(audit.definedKeys).toEqual(['knuth1984', 'unusedBook']);
      expect(audit.missingKeys).toEqual(['unknown2025']);
      expect(audit.unusedKeys).toEqual(['unusedBook']);
    });
  });
});
