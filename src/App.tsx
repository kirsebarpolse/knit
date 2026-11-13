import { useEffect, useMemo, useState } from 'react';
import type { KnitDocument, Lang, MotifStamp, ProjectItem, TabId } from './core';
import {
  loadLang,
  loadPatternLibrary,
  loadProjects,
  loadStamps,
  loadTheme,
  makeBlankPattern,
  saveLang,
  savePatternLibrary,
  saveProjects,
  saveStamps,
  saveTheme,
} from './core';
import { OfflineIndicator, TopBar } from './ui';
import { DesignerWorkspace, PatternLibraryModal } from './DesignerWorkspace';
import { CalculatorsView, ProjectsView, ReferenceView, TemplatesView } from './ToolsViews';

export default function App() {
  const initialLib = useMemo(() => loadPatternLibrary(), []);
  const [patterns, setPatterns] = useState<KnitDocument[]>(initialLib.patterns);
  const [activeId, setActiveId] = useState<string>(initialLib.activeId);
  const [stamps, setStamps] = useState<MotifStamp[]>(() => loadStamps());
  const [projects, setProjects] = useState<ProjectItem[]>(() => loadProjects());
  const [activeTab, setActiveTab] = useState<TabId>('draw');
  const [lang, setLang] = useState<Lang>(() => loadLang());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  const [libraryOpen, setLibraryOpen] = useState(false);

  const activeDoc = useMemo(
    () => patterns.find((p) => p.id === activeId) ?? patterns[0],
    [patterns, activeId]
  );

  // Sync theme on <html> and theme-color meta
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const canvasColor = getComputedStyle(root).getPropertyValue('--kw-canvas').trim();
      if (canvasColor) meta.setAttribute('content', canvasColor);
    }
  }, [theme]);

  useEffect(() => {
    saveLang(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    savePatternLibrary(patterns, activeId);
  }, [patterns, activeId]);

  useEffect(() => {
    saveStamps(stamps);
  }, [stamps]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const handleUpdateActiveDoc = (next: KnitDocument) => {
    setPatterns((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  };

  const handleCreateBlank = () => {
    const fresh = makeBlankPattern(
      24,
      24,
      lang === 'hu' ? `Új minta ${patterns.length + 1}` : `Untitled ${patterns.length + 1}`,
      activeDoc.gauge
    );
    setPatterns((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setActiveTab('draw');
  };

  const handleDuplicate = (id: string) => {
    const src = patterns.find((p) => p.id === id);
    if (!src) return;
    const copy: KnitDocument = {
      ...src,
      id: crypto.randomUUID ? crypto.randomUUID() : `pat-${Date.now()}`,
      nm: `${src.nm} (${lang === 'hu' ? 'másolat' : 'copy'})`,
      grid: src.grid.map((r) => r.slice()),
      sy: src.sy.map((r) => r.slice()),
      pal: src.pal.slice(),
      cus: src.cus.map((c) => ({ ...c })),
      gauge: { ...src.gauge },
      updatedAt: Date.now(),
    };
    setPatterns((prev) => [copy, ...prev]);
    setActiveId(copy.id);
  };

  const handleDelete = (id: string) => {
    if (patterns.length <= 1) return;
    const next = patterns.filter((p) => p.id !== id);
    setPatterns(next);
    if (activeId === id) {
      setActiveId(next[0].id);
    }
  };

  const handleImportOrCreate = (doc: KnitDocument) => {
    setPatterns((prev) => [doc, ...prev]);
    setActiveId(doc.id);
    setActiveTab('draw');
  };

  return (
    <div className="min-h-screen flex flex-col text-ink">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLibrary={() => setLibraryOpen(true)}
        lang={lang}
      />

      <main className="flex-1">
        {activeTab === 'draw' && (
          <DesignerWorkspace
            doc={activeDoc}
            onChangeDoc={handleUpdateActiveDoc}
            onNewBlank={handleCreateBlank}
            stamps={stamps}
            onChangeStamps={setStamps}
            lang={lang}
            onToggleLang={() => setLang((l) => (l === 'en' ? 'hu' : 'en'))}
            theme={theme}
            onToggleTheme={() => setTheme((th) => (th === 'dark' ? 'light' : 'dark'))}
          />
        )}

        {activeTab === 'calc' && <CalculatorsView gauge={activeDoc.gauge} lang={lang} />}

        {activeTab === 'tpl' && (
          <TemplatesView
            gauge={activeDoc.gauge}
            designerCols={activeDoc.cols}
            lang={lang}
            onCreateDesignerChart={handleImportOrCreate}
          />
        )}

        {activeTab === 'proj' && <ProjectsView projects={projects} onChange={setProjects} lang={lang} />}

        {activeTab === 'ref' && <ReferenceView customStitches={activeDoc.cus} lang={lang} />}
      </main>

      <PatternLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        patterns={patterns}
        activeId={activeId}
        onSelectPattern={(id) => {
          setActiveId(id);
          setActiveTab('draw');
        }}
        onNewPattern={handleCreateBlank}
        onDuplicatePattern={handleDuplicate}
        onDeletePattern={handleDelete}
        onImportPattern={handleImportOrCreate}
        lang={lang}
      />

      <OfflineIndicator lang={lang} />
    </div>
  );
}
