import { describe, it, expect } from 'vitest';
import { parseBeamerSlides } from '../beamerParser';

describe('beamerParser', () => {
  it('should parse native Beamer frames with items and math', () => {
    const beamerLatex = `
\\documentclass{beamer}
\\begin{document}

\\begin{frame}{Einführung}{Überblick über Quanten-Computing}
Hier ist der einleitende Text.
\\begin{itemize}
\\item Erster Punkt zur Quantenüberlegenheit
\\item Zweiter Punkt zu Qubits
\\end{itemize}
Die Grundgleichung ist $H |\\psi\\rangle = E |\\psi\\rangle$.
\\end{frame}

\\begin{frame}{Algorithmen}
\\begin{itemize}
\\item Shor-Algorithmus
\\item Grover-Algorithmus
\\end{itemize}
\\end{frame}

\\end{document}
`;

    const slides = parseBeamerSlides(beamerLatex);
    expect(slides.length).toBe(2);
    expect(slides[0].title).toBe('Einführung');
    expect(slides[0].subtitle).toBe('Überblick über Quanten-Computing');
    expect(slides[0].bulletPoints.length).toBe(2);
    expect(slides[0].bulletPoints[0]).toContain('Erster Punkt zur Quantenüberlegenheit');
    expect(slides[0].equations.length).toBe(1);

    expect(slides[1].title).toBe('Algorithmen');
    expect(slides[1].bulletPoints.length).toBe(2);
  });

  it('should fallback to sections if no frames are present', () => {
    const paperLatex = `
\\documentclass{article}
\\title{Machine Learning Fundamentals}
\\author{Dr. Turing}
\\begin{document}
\\maketitle

\\section{Introduction}
Neural networks learn from data.
\\begin{itemize}
\\item Supervised learning
\\item Unsupervised learning
\\end{itemize}

\\section{Methodology}
We optimize weights with gradient descent $w_{t+1} = w_t - \\eta \\nabla L$.

\\end{document}
`;

    const slides = parseBeamerSlides(paperLatex);
    expect(slides.length).toBeGreaterThanOrEqual(2);
    const titles = slides.map(s => s.title);
    expect(titles).toContain('Introduction');
    expect(titles).toContain('Methodology');
  });
});
