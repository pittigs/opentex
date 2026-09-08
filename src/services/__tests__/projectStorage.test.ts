import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadProjects,
  saveProjects,
  loadUserProfile,
  saveUserProfile,
  getActiveProjectId,
  setActiveProjectId,
  createEmptyProject,
  createProjectFromTemplate,
  duplicateProject,
  deleteProject,
  toggleStarProject,
  DEFAULT_USER_PROFILE,
} from '../projectStorage';

describe('projectStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('User Profile', () => {
    it('returns default user profile if storage is empty', () => {
      const profile = loadUserProfile();
      expect(profile.name).toBe(DEFAULT_USER_PROFILE.name);
      expect(profile.email).toBe(DEFAULT_USER_PROFILE.email);
    });

    it('saves and reloads modified user profile', () => {
      const customProfile = { ...DEFAULT_USER_PROFILE, name: 'Dr. Ada Lovelace', affiliation: 'Oxford University' };
      saveUserProfile(customProfile);
      const loaded = loadUserProfile();
      expect(loaded.name).toBe('Dr. Ada Lovelace');
      expect(loaded.affiliation).toBe('Oxford University');
    });
  });

  describe('Project CRUD operations', () => {
    it('loads initial projects when localStorage is empty', () => {
      const projects = loadProjects();
      expect(projects.length).toBeGreaterThan(0);
      expect(projects[0]).toHaveProperty('id');
      expect(projects[0]).toHaveProperty('name');
    });

    it('persists and retrieves updated projects with saveProjects', () => {
      const custom = [{ ...DEFAULT_USER_PROFILE, id: 'proj-custom', name: 'Custom Project', files: [], isStarred: false, isArchived: false, isShared: false, ownerId: 'usr-1', lastModified: 'heute', updatedAt: 12345 } as any];
      saveProjects(custom);
      expect(loadProjects()).toEqual(custom);
    });

    it('creates an empty project and activates it', () => {
      const newProj = createEmptyProject('Quantencomputing Seminar', 'Ein Paper über Qubits');
      expect(newProj.name).toBe('Quantencomputing Seminar');
      expect(newProj.files).toHaveLength(1);
      expect(newProj.files[0].name).toBe('main.tex');
      expect(getActiveProjectId()).toBe(newProj.id);

      const all = loadProjects();
      expect(all.some(p => p.id === newProj.id)).toBe(true);
    });

    it('creates a project from template', () => {
      const proj = createProjectFromTemplate('template-thesis', 'Meine Masterarbeit');
      expect(proj.name).toBe('Meine Masterarbeit');
      expect(proj.files.length).toBeGreaterThan(1);
      expect(getActiveProjectId()).toBe(proj.id);
    });

    it('duplicates a project correctly', () => {
      const initial = loadProjects();
      const first = initial[0];
      const clone = duplicateProject(first.id);

      expect(clone).not.toBeNull();
      expect(clone?.name).toBe(`${first.name} (Kopie)`);
      expect(clone?.id).not.toBe(first.id);

      const after = loadProjects();
      expect(after.length).toBe(initial.length + 1);
    });

    it('deletes a project correctly', () => {
      const initial = loadProjects();
      const firstId = initial[0].id;
      const remaining = deleteProject(firstId);

      expect(remaining.some(p => p.id === firstId)).toBe(false);
      expect(loadProjects().some(p => p.id === firstId)).toBe(false);
    });

    it('toggles star status on a project', () => {
      const initial = loadProjects();
      const first = initial[0];
      const wasStarred = first.isStarred;

      const updated = toggleStarProject(first.id);
      const target = updated.find(p => p.id === first.id);
      expect(target?.isStarred).toBe(!wasStarred);
    });
  });

  describe('Active Project ID', () => {
    it('sets and gets active project ID', () => {
      setActiveProjectId('proj-xyz');
      expect(getActiveProjectId()).toBe('proj-xyz');
    });
  });
});
