import type { BeamerSlide } from '../types';

/**
 * Extracts slides from LaTeX code.
 * Supports native Beamer \begin{frame} ... \end{frame} environments
 * as well as auto-segmenting standard documents by \section / \subsection.
 */
export function parseBeamerSlides(rawLatex: string): BeamerSlide[] {
  const slides: BeamerSlide[] = [];

  // Match Beamer frames: \begin{frame}[...]{Title}{Subtitle} or with \frametitle{Title}
  const frameRegex = /\\begin\{frame\}(?:\[[^\]]*\])?(?:\{([^}]*)\})?(?:\{([^}]*)\})?([\s\S]*?)\\end\{frame\}/g;
  let match;
  let index = 1;

  while ((match = frameRegex.exec(rawLatex)) !== null) {
    let title = match[1] || '';
    const subtitle = match[2] || '';
    let content = match[3] || '';

    // Check if title is inside \frametitle{...}
    const frameTitleMatch = content.match(/\\frametitle\{([^}]+)\}/);
    if (frameTitleMatch) {
      title = frameTitleMatch[1];
      content = content.replace(/\\frametitle\{[^}]+\}/, '');
    }

    // Extract bullet points (\item ...)
    const items: string[] = [];
    const itemMatches = content.matchAll(/\\item\s+([^\n\\]+)/g);
    for (const im of itemMatches) {
      items.push(im[1].trim());
    }

    // Extract math equations
    const equations: string[] = [];
    const eqMatches = content.matchAll(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$\n]+\$)/g);
    for (const eq of eqMatches) {
      equations.push(eq[1]);
    }

    slides.push({
      id: `slide-${index}`,
      index,
      title: title.trim() || `Folie ${index}`,
      subtitle: subtitle.trim() || undefined,
      content: content.trim(),
      bulletPoints: items,
      equations,
      rawLatex: match[0]
    });
    index++;
  }

  // If no \begin{frame} was found, fallback to section-based slides
  if (slides.length === 0) {
    const sectionRegex = /\\section\*?\{([^}]+)\}([\s\S]*?)(?=\\section\*?\{|$)/g;
    let secMatch;
    let secIndex = 1;

    // Title slide if document has \title{...}
    const titleMatch = rawLatex.match(/\\title\{([^}]+)\}/);
    const authorMatch = rawLatex.match(/\\author\{([^}]+)\}/);
    if (titleMatch) {
      slides.push({
        id: 'slide-0',
        index: 0,
        title: titleMatch[1].trim(),
        subtitle: authorMatch ? authorMatch[1].trim() : 'Präsentation',
        content: authorMatch ? `Autor: ${authorMatch[1].trim()}` : '',
        bulletPoints: [],
        equations: [],
        rawLatex: titleMatch[0]
      });
    }

    while ((secMatch = sectionRegex.exec(rawLatex)) !== null) {
      const secTitle = secMatch[1].trim();
      const secBody = secMatch[2].trim();

      const items: string[] = [];
      const itemMatches = secBody.matchAll(/\\item\s+([^\n\\]+)/g);
      for (const im of itemMatches) {
        items.push(im[1].trim());
      }

      const equations: string[] = [];
      const eqMatches = secBody.matchAll(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$\n]+\$)/g);
      for (const eq of eqMatches) {
        equations.push(eq[1]);
      }

      // Clean plain text preview
      const cleanContent = secBody
        .replace(/\\begin\{[^}]+\}/g, '')
        .replace(/\\end\{[^}]+\}/g, '')
        .replace(/\\[a-zA-Z]+(?:\[[^\]]*\])?(?:\{[^}]*\})?/g, '')
        .replace(/[{}]/g, '')
        .trim();

      slides.push({
        id: `slide-sec-${secIndex}`,
        index: secIndex,
        title: secTitle,
        content: cleanContent.slice(0, 300) + (cleanContent.length > 300 ? '...' : ''),
        bulletPoints: items,
        equations,
        rawLatex: secMatch[0]
      });
      secIndex++;
    }
  }

  // If still empty, provide one fallback slide
  if (slides.length === 0) {
    slides.push({
      id: 'slide-default',
      index: 1,
      title: 'LaTeX Dokument Vorschau',
      subtitle: 'Keine Beamer-Frames oder Sektionen gefunden',
      content: 'Füge \\begin{frame}{Titel} ... \\end{frame} hinzu, um interaktive Folien zu erstellen.',
      bulletPoints: ['Unterstützt \\item für Aufzählungen', 'Unterstützt Formeln $E = mc^2$'],
      equations: ['$E = mc^2$'],
      rawLatex: ''
    });
  }

  return slides;
}
