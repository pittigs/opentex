export type FileType = 'tex' | 'bib' | 'cls' | 'sty' | 'image' | 'folder' | 'other';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isFolder: boolean;
  parentId?: string | null;
  type: FileType;
  isOpen?: boolean;
  size?: number;
}

export interface CompilerLogEntry {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  file?: string;
  raw?: string;
}

export interface CompilationResult {
  success: boolean;
  pdfUrl?: string;
  timestamp: string;
  durationMs: number;
  logs: CompilerLogEntry[];
  engineUsed: 'wasm-browser' | 'cloud-texlive';
  pageCount: number;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
  currentFileId: string;
  cursorLine?: number;
  status: 'online' | 'idle';
}

export interface LaTeXTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Paper' | 'Thesis' | 'Slides' | 'Resume' | 'CheatSheet';
  author: string;
  icon: string;
  files: ProjectFile[];
}

// Git Integration Types (Generic for any provider)
export interface GitConfig {
  remoteUrl: string;
  branch: string;
  authorName: string;
  authorEmail: string;
  token?: string;
  isConnected: boolean;
  lastSync?: string;
  unpushedCommits: number;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  filesChanged: number;
}

// Review & Track Changes Types
export interface DocumentComment {
  id: string;
  fileId: string;
  line: number;
  author: string;
  avatar: string;
  color: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  replies?: {
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }[];
}

export interface TrackChangeSuggestion {
  id: string;
  fileId: string;
  line: number;
  author: string;
  color: string;
  originalText: string;
  suggestedText: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

// AI & DOI Fetcher Types
export interface AiProviderConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'ollama-local';
  apiKey?: string;
  model: string;
  endpoint?: string;
}
