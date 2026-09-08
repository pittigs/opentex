import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Folder, 
  FileText, 
  Star, 
  Clock, 
  Users, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Download, 
  LayoutGrid, 
  List as ListIcon, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  GitBranch, 
  ChevronRight,
  HardDrive
} from 'lucide-react';
import type { ProjectSummary, UserProfile } from '../../types';
import { exportProjectAsZip } from '../../services/exportService';

interface DashboardViewProps {
  projects: ProjectSummary[];
  userProfile: UserProfile;
  onOpenProject: (projectId: string) => void;
  onNewProjectClick: () => void;
  onOpenAccountClick: () => void;
  onToggleStar: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectTemplateDirect: (templateId: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

type FilterCategory = 'all' | 'mine' | 'shared' | 'starred' | 'archive';

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  userProfile,
  onOpenProject,
  onNewProjectClick,
  onOpenAccountClick,
  onToggleStar,
  onDuplicateProject,
  onDeleteProject,
  onSelectTemplateDirect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [menuOpenProjectId, setMenuOpenProjectId] = useState<string | null>(null);

  // Filtered and searched projects
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // Search query
      const matchesSearch = 
        proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (selectedFilter === 'all') return !proj.isArchived;
      if (selectedFilter === 'mine') return proj.ownerId === userProfile.id && !proj.isArchived;
      if (selectedFilter === 'shared') return proj.isShared && !proj.isArchived;
      if (selectedFilter === 'starred') return proj.isStarred && !proj.isArchived;
      if (selectedFilter === 'archive') return proj.isArchived;
      return true;
    });
  }, [projects, searchQuery, selectedFilter, userProfile.id]);

  const handleExportZip = (e: React.MouseEvent, proj: ProjectSummary) => {
    e.stopPropagation();
    exportProjectAsZip(proj.files, proj.name);
    setMenuOpenProjectId(null);
  };

  const handleDuplicate = (e: React.MouseEvent, projId: string) => {
    e.stopPropagation();
    onDuplicateProject(projId);
    setMenuOpenProjectId(null);
  };

  const handleDelete = (e: React.MouseEvent, projId: string) => {
    e.stopPropagation();
    if (window.confirm('Möchtest du dieses Projekt wirklich löschen?')) {
      onDeleteProject(projId);
    }
    setMenuOpenProjectId(null);
  };

  const percentageUsed = Math.min(100, Math.round((userProfile.storageUsedMb / userProfile.storageLimitMb) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="font-black text-sm text-white tracking-tight">TeX</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">OpenTeX</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Workspace
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dokumente, Kapitel, Vorlagen durchsuchen..."
              className="w-full bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-slate-950 transition"
            />
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onNewProjectClick}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-500/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Neues Projekt</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          {/* User Account Trigger Button */}
          <button
            onClick={onOpenAccountClick}
            className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition text-left cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-xs text-white shadow">
              {userProfile.avatar || 'MM'}
            </div>
            <div className="hidden sm:block">
              <span className="block text-xs font-semibold text-slate-200 group-hover:text-white transition leading-tight">
                {userProfile.name}
              </span>
              <span className="block text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                {userProfile.affiliation || 'Benutzerkonto'}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-6 py-8 gap-8">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 flex flex-col space-y-6 select-none">
          {/* Main Navigation Filters */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase text-slate-400 px-3 tracking-wider">
              Navigation
            </span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Folder className="w-4 h-4" />
                <span>Alle Dokumente</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {projects.filter((p) => !p.isArchived).length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFilter('mine')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                selectedFilter === 'mine'
                  ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4" />
                <span>Meine Dokumente</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedFilter('shared')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                selectedFilter === 'shared'
                  ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4" />
                <span>Mit mir geteilt</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {projects.filter((p) => p.isShared && !p.isArchived).length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFilter('starred')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                selectedFilter === 'starred'
                  ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Favoriten</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {projects.filter((p) => p.isStarred && !p.isArchived).length}
              </span>
            </button>
          </div>

          {/* Account & Profile Quick Card */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Benutzerkonto
              </span>
              <button
                onClick={onOpenAccountClick}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-0.5"
              >
                Verwalten <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-xs text-white shadow">
                {userProfile.avatar}
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-white truncate">{userProfile.name}</span>
                <span className="block text-[11px] text-slate-400 truncate">{userProfile.affiliation}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-slate-500" /> Cloud-Speicher
                </span>
                <span className="text-slate-300 font-medium">{userProfile.storageUsedMb} MB / 5 GB</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${percentageUsed}%` }}
                />
              </div>
            </div>
          </div>

          {/* Open Source / GitHub Footer */}
          <div className="mt-auto pt-4 border-t border-slate-900 flex items-center justify-between text-slate-400 text-xs">
            <a
              href="https://github.com/pittigs/opentex"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 hover:text-white transition"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
            <span className="text-[10px] font-mono text-slate-400">v1.0.0</span>
          </div>
        </aside>

        {/* Center Main Content */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Quick Start Academic Templates Banner */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Schnellstart mit Vorlagen
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => onSelectTemplateDirect('ieee-journal')}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 hover:border-indigo-500/50 transition cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase text-indigo-400">IEEEtran</span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition">
                  IEEE Journal / Paper
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Zweispaltiges Layout mit Formeln, Tabellen und BibTeX für wissenschaftliche Konferenzen.
                </p>
              </div>

              <div
                onClick={() => onSelectTemplateDirect('exam-mock')}
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 hover:border-blue-500/50 transition cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase text-blue-400">RUB Klausur</span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-200 transition">
                  Prüfungs- & Klausurvorlage
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Offizielle Header, Aufgabenboxen, Punktetabellen und Musterlösungen.
                </p>
              </div>

              <div
                onClick={() => onSelectTemplateDirect('thesis-template')}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 hover:border-amber-500/50 transition cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase text-amber-400">Abschlussarbeit</span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition">
                  Master- & Bachelorarbeit
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Komplette Buch-/Kapitelstruktur mit Inhaltsverzeichnis, Abstract und Eidesstattlicher Erklärung.
                </p>
              </div>
            </div>
          </div>

          {/* Section Header: Filter title & View Switcher */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {selectedFilter === 'all' && 'Alle Dokumente'}
                {selectedFilter === 'mine' && 'Meine Dokumente'}
                {selectedFilter === 'shared' && 'Mit mir geteilte Projekte'}
                {selectedFilter === 'starred' && 'Favorisierte Dokumente'}
                <span className="text-xs font-normal text-slate-400">
                  ({filteredProjects.length} {filteredProjects.length === 1 ? 'Projekt' : 'Projekte'})
                </span>
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'grid' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Rasteransicht"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'list' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Listenansicht"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Projects Display: Grid or List */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300">Keine Dokumente gefunden</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `Es wurden keine Treffer für "${searchQuery}" gefunden.`
                  : 'Starte dein erstes LaTeX-Dokument mit einer akademischen Vorlage oder einem leeren Dokument.'}
              </p>
              <button
                onClick={onNewProjectClick}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition inline-flex items-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Neues Dokument erstellen</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onOpenProject(proj.id)}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between relative shadow-sm"
                >
                  <div>
                    {/* Header with category and star */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                        {proj.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(proj.id);
                          }}
                          className={`p-1 rounded-md transition cursor-pointer ${
                            proj.isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                          }`}
                          title="Favorit"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>

                        {/* More Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenProjectId(menuOpenProjectId === proj.id ? null : proj.id);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:text-white transition cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {menuOpenProjectId === proj.id && (
                            <div 
                              className="absolute right-0 top-6 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-40 animate-in fade-in zoom-in-95 duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => handleDuplicate(e, proj.id)}
                                className="w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition text-left cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-blue-400" />
                                <span>Duplizieren</span>
                              </button>
                              <button
                                onClick={(e) => handleExportZip(e, proj)}
                                className="w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition text-left cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5 text-amber-400" />
                                <span>Als ZIP herunterladen</span>
                              </button>
                              <div className="my-1 border-t border-slate-800" />
                              <button
                                onClick={(e) => handleDelete(e, proj.id)}
                                className="w-full px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/15 flex items-center space-x-2 transition text-left cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Löschen</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                      {proj.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {proj.description || 'Keine Beschreibung vorhanden.'}
                    </p>
                  </div>

                  {/* Footer with Collaborators & Timestamp */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px]">{proj.lastModified}</span>
                    </div>

                    {proj.collaborators && proj.collaborators.length > 0 && (
                      <div className="flex -space-x-1">
                        {proj.collaborators.map((c) => (
                          <div
                            key={c.id}
                            className="w-5 h-5 rounded-full border border-slate-900 text-[9px] flex items-center justify-center font-bold text-white shadow"
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          >
                            {c.avatar}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table / List View */
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Dokumentenname</th>
                    <th className="py-3 px-4">Kategorie</th>
                    <th className="py-3 px-4">Letzte Änderung</th>
                    <th className="py-3 px-4">Mitautoren</th>
                    <th className="py-3 px-4 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProjects.map((proj) => (
                    <tr
                      key={proj.id}
                      onClick={() => onOpenProject(proj.id)}
                      className="hover:bg-slate-850/60 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-bold text-white group-hover:text-indigo-300 transition flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(proj.id);
                          }}
                          className={`cursor-pointer ${
                            proj.isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <span>{proj.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                          {proj.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{proj.lastModified}</td>
                      <td className="py-3.5 px-4">
                        {proj.collaborators && proj.collaborators.length > 0 ? (
                          <div className="flex -space-x-1">
                            {proj.collaborators.map((c) => (
                              <div
                                key={c.id}
                                className="w-4 h-4 rounded-full border border-slate-900 text-[8px] flex items-center justify-center font-bold text-white"
                                style={{ backgroundColor: c.color }}
                                title={c.name}
                              >
                                {c.avatar}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={(e) => handleExportZip(e, proj)}
                            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                            title="ZIP exportieren"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, proj.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
