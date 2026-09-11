import { describe, it, expect, beforeEach } from 'vitest';
import {
  createProjectSnapshot,
  getProjectSnapshots,
  deleteProjectSnapshot,
  computeLineDiff
} from '../snapshotService';
import type { ProjectFile } from '../../types';

describe('snapshotService', () => {
  const dummyFiles: ProjectFile[] = [
    {
      id: 'f1',
      name: 'main.tex',
      path: '/main.tex',
      content: 'Line 1\nLine 2\nLine 3',
      isFolder: false,
      type: 'tex'
    }
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  it('should create and retrieve project snapshots', () => {
    const snap = createProjectSnapshot('proj-1', 'Initial Draft', dummyFiles, 'Test description');
    expect(snap.id).toBeDefined();
    expect(snap.name).toBe('Initial Draft');

    const snapshots = getProjectSnapshots('proj-1');
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].files[0].content).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should delete a project snapshot', () => {
    const snap = createProjectSnapshot('proj-1', 'Snapshot to delete', dummyFiles);
    expect(getProjectSnapshots('proj-1').length).toBe(1);

    const remaining = deleteProjectSnapshot('proj-1', snap.id);
    expect(remaining.length).toBe(0);
    expect(getProjectSnapshots('proj-1').length).toBe(0);
  });

  it('should compute accurate line diffs', () => {
    const oldCode = 'Apple\nBanana\nCherry';
    const newCode = 'Apple\nBlueberry\nCherry\nDate';

    const diff = computeLineDiff(oldCode, newCode);
    expect(diff.length).toBeGreaterThan(0);

    const added = diff.filter(d => d.type === 'added');
    const removed = diff.filter(d => d.type === 'removed');
    const unchanged = diff.filter(d => d.type === 'unchanged');

    expect(added.map(d => d.text)).toContain('Blueberry');
    expect(added.map(d => d.text)).toContain('Date');
    expect(removed.map(d => d.text)).toContain('Banana');
    expect(unchanged.map(d => d.text)).toContain('Apple');
  });
});
