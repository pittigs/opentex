import type { ProjectSummary, UserProfile, Collaborator } from '../types';
import { ALL_TEMPLATES, IEEE_TEMPLATE, EXAM_TEMPLATE, THESIS_TEMPLATE } from '../templates/latexTemplates';

const STORAGE_PROJECTS_KEY = 'opentex_projects_v1';
const STORAGE_PROFILE_KEY = 'opentex_user_profile_v1';
const STORAGE_ACTIVE_PROJECT_KEY = 'opentex_active_project_id_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-1',
  name: 'Maximilian Müller',
  email: 'max.mueller@opentex.org',
  avatar: 'MM',
  role: 'Wissenschaftlicher Mitarbeiter / PhD Candidate',
  affiliation: 'Universität / Forschungsinstitut',
  orcid: '0000-0002-8419-3281',
  bio: 'Forschungsschwerpunkte: Verteilte Systeme, CRDTs und wissenschaftliches Publizieren.',
  plan: 'OpenTeX Academic Pro',
  storageUsedMb: 38.4,
  storageLimitMb: 5120, // 5 GB
  gitUsername: 'pittigs',
  gitEmail: 'max.mueller@opentex.org',
  gitToken: '',
  aiKeys: {
    openai: '',
    gemini: '',
    anthropic: '',
    ollamaEndpoint: 'http://localhost:11434',
  },
};

const DEFAULT_COLLABORATORS: Collaborator[] = [
  {
    id: 'collab-1',
    name: 'Dr. Elena Schmidt',
    color: '#0284c7',
    avatar: 'ES',
    role: 'editor',
    currentFileId: 'file-1',
    cursorLine: 42,
    status: 'online',
  },
  {
    id: 'collab-2',
    name: 'Alex Weber',
    color: '#8b5cf6',
    avatar: 'AW',
    role: 'viewer',
    currentFileId: 'file-2',
    cursorLine: 18,
    status: 'idle',
  },
];

const INITIAL_PROJECTS: ProjectSummary[] = [
  {
    id: 'proj-crdt-ieee',
    name: 'OpenTeX CRDT Ecosystem Paper',
    description: 'IEEE Transactions on Software Engineering Submission: High-Performance Decentralized LaTeX.',
    category: 'Paper',
    lastModified: 'Vor 12 Minuten',
    updatedAt: Date.now() - 12 * 60 * 1000,
    isStarred: true,
    isArchived: false,
    isShared: true,
    ownerId: 'usr-1',
    files: IEEE_TEMPLATE.files,
    collaborators: DEFAULT_COLLABORATORS,
  },
  {
    id: 'proj-academic-exam',
    name: 'Academic Probability Exam 2026',
    description: 'Universitäre Klausur- und Übungsvorlage mit Aufgabenboxen, Punktetabelle und Deckblatt.',
    category: 'Exam',
    lastModified: 'Vor 2 Stunden',
    updatedAt: Date.now() - 2 * 3600 * 1000,
    isStarred: true,
    isArchived: false,
    isShared: false,
    ownerId: 'usr-1',
    files: EXAM_TEMPLATE.files,
    collaborators: [],
  },
  {
    id: 'proj-thesis-ai',
    name: 'Master Thesis: Decentralized Consensus',
    description: 'Masterarbeit an der Fakultät für Informatik, Abschlussarbeit mit TeX-Kapitelstruktur.',
    category: 'Thesis',
    lastModified: 'Gestern',
    updatedAt: Date.now() - 24 * 3600 * 1000,
    isStarred: false,
    isArchived: false,
    isShared: true,
    ownerId: 'usr-1',
    files: THESIS_TEMPLATE.files,
    collaborators: [DEFAULT_COLLABORATORS[0]],
  },
];

/**
 * Loads all projects from localStorage, falling back to initial projects.
 */
export function loadProjects(): ProjectSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) {
      saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PROJECTS;
  } catch (err) {
    console.warn('Failed to load projects from localStorage:', err);
    return INITIAL_PROJECTS;
  }
}

/**
 * Persists all projects to localStorage.
 */
export function saveProjects(projects: ProjectSummary[]): void {
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}

/**
 * Loads the user profile from localStorage.
 */
export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (!raw) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

/**
 * Saves user profile to localStorage.
 */
export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
}

/**
 * Returns the currently active project ID.
 */
export function getActiveProjectId(): string {
  return localStorage.getItem(STORAGE_ACTIVE_PROJECT_KEY) || INITIAL_PROJECTS[0].id;
}

/**
 * Sets the active project ID.
 */
export function setActiveProjectId(id: string): void {
  localStorage.setItem(STORAGE_ACTIVE_PROJECT_KEY, id);
}

/**
 * Creates a new project from a predefined template.
 */
export function createProjectFromTemplate(templateId: string, customName?: string): ProjectSummary {
  const template = ALL_TEMPLATES.find((t) => t.id === templateId) || IEEE_TEMPLATE;
  const newProject: ProjectSummary = {
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: customName || template.title,
    description: template.description,
    category: (template.category as any) || 'General',
    lastModified: 'Gerade eben',
    updatedAt: Date.now(),
    isStarred: false,
    isArchived: false,
    isShared: false,
    ownerId: 'usr-1',
    files: JSON.parse(JSON.stringify(template.files)),
    collaborators: [],
  };

  const projects = loadProjects();
  const updated = [newProject, ...projects];
  saveProjects(updated);
  setActiveProjectId(newProject.id);
  return newProject;
}

/**
 * Creates an empty LaTeX project.
 */
export function createEmptyProject(name: string, description?: string): ProjectSummary {
  const newProject: ProjectSummary = {
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name || 'Neues LaTeX Dokument',
    description: description || 'Eigenes leeres Dokument mit Standardpräambel.',
    category: 'General',
    lastModified: 'Gerade eben',
    updatedAt: Date.now(),
    isStarred: false,
    isArchived: false,
    isShared: false,
    ownerId: 'usr-1',
    files: [
      {
        id: `file-${Date.now()}`,
        name: 'main.tex',
        path: '/main.tex',
        isFolder: false,
        type: 'tex',
        content: `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb}
\\usepackage{geometry}
\\geometry{margin=2.5cm}

\\title{${name || 'Neues LaTeX Dokument'}}
\\author{Maximilian Müller}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Einleitung}
Willkommen in deinem neuen LaTeX-Dokument mit OpenTeX!

\\end{document}
`,
      },
    ],
    collaborators: [],
  };

  const projects = loadProjects();
  const updated = [newProject, ...projects];
  saveProjects(updated);
  setActiveProjectId(newProject.id);
  return newProject;
}

/**
 * Duplicates an existing project.
 */
export function duplicateProject(projectId: string): ProjectSummary | null {
  const projects = loadProjects();
  const target = projects.find((p) => p.id === projectId);
  if (!target) return null;

  const clone: ProjectSummary = {
    ...JSON.parse(JSON.stringify(target)),
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: `${target.name} (Kopie)`,
    lastModified: 'Gerade eben',
    updatedAt: Date.now(),
    isStarred: false,
  };

  const updated = [clone, ...projects];
  saveProjects(updated);
  return clone;
}

/**
 * Deletes a project.
 */
export function deleteProject(projectId: string): ProjectSummary[] {
  const projects = loadProjects();
  const updated = projects.filter((p) => p.id !== projectId);
  saveProjects(updated);
  return updated;
}

/**
 * Toggles the starred status of a project.
 */
export function toggleStarProject(projectId: string): ProjectSummary[] {
  const projects = loadProjects();
  const updated = projects.map((p) => (p.id === projectId ? { ...p, isStarred: !p.isStarred } : p));
  saveProjects(updated);
  return updated;
}
