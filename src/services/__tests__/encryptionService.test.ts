import { describe, it, expect } from 'vitest';
import { encryptProjectFiles, decryptProjectFiles } from '../encryptionService';
import type { ProjectFile } from '../../types';

describe('encryptionService', () => {
  const sampleFiles: ProjectFile[] = [
    {
      id: 'f1',
      name: 'main.tex',
      path: '/main.tex',
      isFolder: false,
      content: '\\section{Top Secret Quantum Research}\nGeheime Formel: E = hf',
      type: 'tex',
    },
    {
      id: 'f2',
      name: 'data.csv',
      path: '/data.csv',
      isFolder: false,
      content: 'x,y\n1,2\n3,4',
      type: 'other',
    },
  ];

  it('encrypts files and successfully decrypts with correct password', async () => {
    const password = 'SuperSecretKey2026!';
    const encryptedPkg = await encryptProjectFiles(sampleFiles, password);

    expect(typeof encryptedPkg).toBe('string');
    expect(encryptedPkg).toContain('AES-256-GCM');
    expect(encryptedPkg).not.toContain('Top Secret Quantum Research');

    const decryptedFiles = await decryptProjectFiles(encryptedPkg, password);
    expect(decryptedFiles).toEqual(sampleFiles);
  });

  it('fails decryption with an incorrect password', async () => {
    const password = 'CorrectPassword123';
    const wrongPassword = 'WrongPassword456';
    const encryptedPkg = await encryptProjectFiles(sampleFiles, password);

    await expect(decryptProjectFiles(encryptedPkg, wrongPassword)).rejects.toThrow(
      /Entschlüsselung fehlgeschlagen/
    );
  });

  it('rejects passwords shorter than 4 characters', async () => {
    await expect(encryptProjectFiles(sampleFiles, 'abc')).rejects.toThrow(
      /mindestens 4 Zeichen/
    );
  });
});
