import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ProjectFile } from '../types';

export async function exportProjectAsZip(files: ProjectFile[], projectName: string): Promise<void> {
  const zip = new JSZip();
  files.forEach((file) => {
    if (!file.isFolder) {
      zip.file(file.name, file.content);
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'opentex_project';
  saveAs(blob, `${safeName}_source.zip`);
}
