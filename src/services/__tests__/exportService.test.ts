import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportProjectAsZip, exportArxivPackage, exportEncryptedProject } from '../exportService';
import type { ProjectFile } from '../../types';
import * as fileSaver from 'file-saver';

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('exportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const files: ProjectFile[] = [
    {
      id: '1',
      name: 'main.tex',
      path: '/main.tex',
      isFolder: false,
      content: '\\documentclass{article}\n% Draft comment to hide from reviewer\n\\begin{document}Hello 50\\%\\end{document}',
      type: 'tex',
    },
    {
      id: '2',
      name: 'references.bib',
      path: '/references.bib',
      isFolder: false,
      content: '@article{einstein1905, author={Einstein, A.}}',
      type: 'bib',
    },
  ];

  it('bundles project files into a zip and triggers saveAs', async () => {
    await exportProjectAsZip(files, 'My Awesome Paper');

    expect(fileSaver.saveAs).toHaveBeenCalledTimes(1);
    const [blob, filename] = vi.mocked(fileSaver.saveAs).mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(filename).toBe('my_awesome_paper_source.zip');
  });

  it('exports clean arXiv package with comments stripped and 00README', async () => {
    await exportArxivPackage(files, 'Quantum Paper');

    expect(fileSaver.saveAs).toHaveBeenCalledTimes(1);
    const [blob, filename] = vi.mocked(fileSaver.saveAs).mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(filename).toBe('quantum_paper_arxiv.zip');
  });

  it('exports encrypted project as .otex.enc', async () => {
    await exportEncryptedProject(files, 'Secret Lab', 'Passw0rd!');

    expect(fileSaver.saveAs).toHaveBeenCalledTimes(1);
    const [blob, filename] = vi.mocked(fileSaver.saveAs).mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(filename).toBe('secret_lab.otex.enc');
  });
});
