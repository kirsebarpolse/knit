/* ==========================================================================
   Knit Workshop — Core Domain Types, Translations (i18n) & Local Storage
   ========================================================================== */

export type KnittingMode = 'flat' | 'round';
export type Lang = 'en' | 'hu';
export type ToolType = 'p' | 'e' | 'n' | 'f' | 'i' | 's' | 'h' | 'l' | 'r';
export type BrushMode = 'b' | 'c' | 's';
export type ViewMode = 'g' | 'k';
export type TabId = 'draw' | 'calc' | 'tpl' | 'proj' | 'ref';

export interface Gauge {
  s: number;
  r: number;
}

export interface CustomStitch {
  n: string;
  g: string;
  t: string;
  u: number;
  m: number;
}

export interface StitchInfo {
  idx: number;
  code: string;
  glyph: string;
  titleEn: string;
  titleHu: string;
  uses: number;
  makes: number;
  span?: number;
  isCustom?: boolean;
}

export interface KnitDocument {
  id: string;
  nm: string;
  cols: number;
  rows: number;
  pal: string[];
  grid: number[][];
  sy: number[][];
  mode: KnittingMode;
  gauge: Gauge;
  trk: number;
  cus: CustomStitch[];
  updatedAt: number;
}

export interface SelectionRect {
  r0: number;
  r1: number;
  k0: number;
  k1: number;
}

export interface ClipboardData {
  h: number;
  w: number;
  g: number[][];
  s: number[][];
}

export interface MotifStamp {
  id: string;
  name: string;
  w: number;
  h: number;
  g: number[][];
  s: number[][];
}

export interface ProjectCounter {
  n: string;
  c: number;
}

export interface ProjectItem {
  id: string;
  n: string;
  t: string;
  k: ProjectCounter[];
}

export interface RowAnalysis {
  rowNum: number;
  made: number;
  uses: number;
  status: 'empty' | 'ok' | 'mismatch';
  message: string;
  maxFloat: number;
  colorsUsed: number;
}

/* --------------------------------------------------------------------------
   Translations (EN / HU)
   -------------------------------------------------------------------------- */

export const TRANSLATIONS = {
  en: {
    brand: 'Knit Workshop',
    tabs: {
      draw: 'Designer',
      calc: 'Calculators',
      tpl: 'Templates',
      proj: 'Projects',
      ref: 'Reference',
    },
    topbar: {
      library: 'My Patterns',
    },
    toolbar: {
      undo: 'Undo',
      redo: 'Redo',
      zoomOut: 'Zoom out',
      zoomIn: 'Zoom in',
      fit: 'Fit',
      leftPanel: 'Tools and Yarns',
      rightPanel: 'Inspector',
      grid: 'Grid',
      knitted: 'Knitted view',
      knitMode: 'Knit Mode',
      exitKnitMode: 'Edit Mode',
      knitModeHint: 'Lock editing for hands-free knitting',
      exitKnitModeHint: 'Unlock editing and return to Designer',
      darkMode: 'Dark',
      lightMode: 'Light',
      langLabel: 'HU',
      langTitle: 'Váltás magyarra / Switch to Hungarian',
    },
    tools: {
      p: 'Pencil',
      e: 'Eraser',
      n: 'No stitch',
      f: 'Fill',
      i: 'Pick',
      s: 'Select',
      h: 'Hand',
      l: 'Line',
      r: 'Rect',
      symX: 'Mirror H',
      symY: 'Mirror V',
    },
    panels: {
      pattern: 'Pattern and Gauge',
      patternName: 'Pattern name',
      stitches10: 'Stitches / 10 cm',
      rows10: 'Rows / 10 cm',
      method: 'Knitting method',
      flat: 'Flat (rows)',
      round: 'In the round',
      newPattern: 'New pattern',
      saveBackup: 'Save .knit',
      pencil: 'Pencil mode',
      both: 'Yarn + stitch',
      yarnOnly: 'Yarn only',
      stitchOnly: 'Stitch only',
      yarns: 'Yarns and Usage',
      addYarn: '+ Yarn',
      fills: 'Fill patterns',
      applyFill: 'Apply fill',
      symbols: 'Stitch symbols',
      addCustomStitch: 'Add custom stitch',
      stamps: 'Motif stamps',
      saveStamp: 'Save selection as stamp',
      checks: 'Stitch and Float Check',
      selection: 'Selection',
      tracker: 'Row tracker',
      preview: 'Knitted preview',
      size: 'Size and Transform',
      export: 'Export and Image Import',
    },
    tracker: {
      prev: 'Previous row',
      next: 'Next row',
      start: 'Start (row 1)',
      off: 'Turn off',
      wakeLock: 'Keep screen on',
      wakeLockOff: 'Allow screen sleep',
      dimDone: 'Dim completed rows',
      turnedOff: 'Row tracker is turned off.',
      knitLockBanner: 'Knit Mode active — canvas editing is locked. Tap Next row or press Space to advance.',
    },
    checks: {
      allOk: 'All rows match stitch counts.',
      mismatch: 'Stitch count mismatch in rows:',
      floatWarn: 'Long floats (>5 sts) in rows:',
      colorWarn: '3+ colors in a single row:',
      maxFloatLabel: 'Float alert limit',
    },
    size: {
      cols: 'Stitches',
      rows: 'Rows',
      resize: 'Resize',
      flipH: 'Flip H',
      reset: 'Reset',
      insertRow: '+ Row above',
      delRow: '− Row',
      insertCol: '+ Col left',
      delCol: '− Col',
      shift: 'Shift / Roll',
      wrap: 'Wrap around',
      stretchLabel: 'Repeat every N rows',
      stretchBtn: 'Stretch rows',
    },
    export: {
      png: 'PNG Image',
      svg: 'SVG Vector',
      pdfColor: 'PDF Color',
      pdfBw: 'PDF Monochrome',
      pdfTiled: 'Tiled Multi-page PDF',
      toTxt: 'Row instructions',
      fromTxt: 'Instructions → grid',
      openKnit: 'Open .knit',
      saveKnit: 'Save .knit',
      imgImport: 'Image → pattern',
      dither: 'Floyd–Steinberg dithering',
      alphaNoStitch: 'Transparent → No stitch',
      brightness: 'Brightness',
      contrast: 'Contrast',
      applyImg: 'Apply to grid',
    },
    calc: {
      sizeTitle: 'Size ↔ stitch count',
      widthCm: 'Width (cm)',
      heightCm: 'Height (cm)',
      distTitle: 'Increase / decrease distributor',
      needleTitle: 'Needle size converter',
      weightsTitle: 'Yarn weight reference',
    },
    tpl: {
      title: 'Pattern from template',
      item: 'Garment / Item',
      size: 'Size',
      customCm: 'Custom size (cm)',
      calc: 'Calculate',
      openInDesigner: 'Open shaped chart in Designer',
    },
    proj: {
      addProject: '+ Project',
      addCounter: '+ Counter',
      deleteProject: 'Delete project',
      reset: 'Reset',
      notes: 'Notes',
    },
    ref: {
      howTitle: 'How Knit Workshop works',
      glossaryTitle: 'Stitch symbol glossary',
      checkerTitle: 'Standalone row checker',
      search: 'Search symbols',
      check: 'Check row',
    },
  },
  hu: {
    brand: 'Knit Workshop',
    tabs: {
      draw: 'Tervező',
      calc: 'Kalkulátorok',
      tpl: 'Sablonok',
      proj: 'Projektek',
      ref: 'Útmutató',
    },
    topbar: {
      library: 'Mintáim',
    },
    toolbar: {
      undo: 'Visszavonás',
      redo: 'Újra',
      zoomOut: 'Kicsinyítés',
      zoomIn: 'Nagyítás',
      fit: 'Igazítás',
      leftPanel: 'Eszközök',
      rightPanel: 'Tulajdonságok',
      grid: 'Rács',
      knitted: 'Kötött kép',
      knitMode: 'Kötés mód',
      exitKnitMode: 'Szerkesztő mód',
      knitModeHint: 'Szerkesztés zárolása kötés közben',
      exitKnitModeHint: 'Visszatérés a szerkesztéshez',
      darkMode: 'Sötét',
      lightMode: 'Világos',
      langLabel: 'EN',
      langTitle: 'Switch to English',
    },
    tools: {
      p: 'Ceruza',
      e: 'Radír',
      n: 'Nincs szem',
      f: 'Kitöltés',
      i: 'Pipetta',
      s: 'Kijelölés',
      h: 'Mozgatás',
      l: 'Vonal',
      r: 'Téglalap',
      symX: 'Tükör V',
      symY: 'Tükör F',
    },
    panels: {
      pattern: 'Minta és kötéspróba',
      patternName: 'Minta neve',
      stitches10: 'Szem / 10 cm',
      rows10: 'Sor / 10 cm',
      method: 'Kötés módja',
      flat: 'Síkban (oda-vissza)',
      round: 'Körben kötve',
      newPattern: 'Új minta',
      saveBackup: 'Mentés (.knit)',
      pencil: 'Ceruza mód',
      both: 'Fonal + szem',
      yarnOnly: 'Csak fonal',
      stitchOnly: 'Csak szemjel',
      yarns: 'Fonalak és igény',
      addYarn: '+ Fonal',
      fills: 'Minta-kitöltők',
      applyFill: 'Alkalmaz',
      symbols: 'Szemjelek',
      addCustomStitch: 'Saját szemjel hozzáadása',
      stamps: 'Motívum-bélyegzők',
      saveStamp: 'Kijelölés mentése bélyegzőként',
      checks: 'Szemszám és lebegő szál',
      selection: 'Kijelölés',
      tracker: 'Sorkövető',
      preview: 'Ismétlődés előnézet',
      size: 'Méret és átalakítás',
      export: 'Export és képimport',
    },
    tracker: {
      prev: 'Előző sor',
      next: 'Következő sor',
      start: 'Bekapcsolás (1. sor)',
      off: 'Kikapcsolás',
      wakeLock: 'Képernyő ébren tartása',
      wakeLockOff: 'Alvó mód engedése',
      dimDone: 'Kész sorok halványítása',
      turnedOff: 'A sorkövető ki van kapcsolva.',
      knitLockBanner: 'Kötés mód aktív — a vászon zárolva van. Koppints a Következő sorra vagy nyomd meg a Space-t.',
    },
    checks: {
      allOk: 'Minden sor szemszáma rendben van.',
      mismatch: 'Szemszám-eltérés a következő sorokban:',
      floatWarn: 'Hosszú lebegő szál (>5 szem) a sorokban:',
      colorWarn: '3+ szín egyetlen sorban:',
      maxFloatLabel: 'Lebegőszál-határ',
    },
    size: {
      cols: 'Szemek',
      rows: 'Sorok',
      resize: 'Átméretezés',
      flipH: 'Vízszintes tükrözés',
      reset: 'Alaphelyzet',
      insertRow: '+ Sor felülre',
      delRow: '− Sor törlése',
      insertCol: '+ Oszlop balra',
      delCol: '− Oszlop törlése',
      shift: 'Eltolás (Shift)',
      wrap: 'Körbefordítás',
      stretchLabel: 'Minden N. sor duplázása',
      stretchBtn: 'Sorok nyújtása',
    },
    export: {
      png: 'PNG kép',
      svg: 'SVG vektor',
      pdfColor: 'Színes PDF',
      pdfBw: 'Fekete-fehér PDF',
      pdfTiled: 'Többoldalas PDF (nagy mintákhoz)',
      toTxt: 'Sorleírás készítése',
      fromTxt: 'Leírás → rács',
      openKnit: 'Megnyitás (.knit)',
      saveKnit: 'Mentés (.knit)',
      imgImport: 'Kép → minta',
      dither: 'Floyd–Steinberg árnyalatszórás',
      alphaNoStitch: 'Átlátszó → Nincs szem',
      brightness: 'Fényerő',
      contrast: 'Kontraszt',
      applyImg: 'Alkalmazás a rácsra',
    },
    calc: {
      sizeTitle: 'Méret ↔ szemszám',
      widthCm: 'Szélesség (cm)',
      heightCm: 'Magasság (cm)',
      distTitle: 'Szaporítás / fogyasztás elosztó',
      needleTitle: 'Tűméret-átváltó',
      weightsTitle: 'Fonalvastagság-táblázat',
    },
    tpl: {
      title: 'Minta sablonból',
      item: 'Ruhadarab / Típus',
      size: 'Méret',
      customCm: 'Egyedi méret (cm)',
      calc: 'Kiszámítás',
      openInDesigner: 'Kész alaprács megnyitása a Tervezőben',
    },
    proj: {
      addProject: '+ Projekt',
      addCounter: '+ Számláló',
      deleteProject: 'Projekt törlése',
      reset: 'Nullázás',
      notes: 'Jegyzetek',
    },
    ref: {
      howTitle: 'Hogyan működik a Knit Workshop?',
      glossaryTitle: 'Szemjelek szótára',
      checkerTitle: 'Önálló sorellenőrző',
      search: 'Keresés',
      check: 'Ellenőrzés',
    },
  },
} as const;

export function tFor(lang: Lang) {
  return TRANSLATIONS[lang];
}

/* --------------------------------------------------------------------------
   Storage & Validation
   -------------------------------------------------------------------------- */

export const DEFAULT_PALETTE = [
  '#5E3F1B',
  '#B5835A',
  '#D9B180',
  '#F3E6CF',
  '#8C6A47',
  '#C9A98A',
  '#E8CFA6',
  '#7A5C3E',
  '#3A4D39',
  '#739072',
  '#9A3B3B',
  '#2D4356',
];

const BUILTIN_STITCH_CODES = ['k', 'p', 'yo', 'k2tog', 'skp', 'ssk', 'kfb', 'm1', 'sl', 'k3tog', 'cdd', 'c4f', 'c4b'];

const LIB_KEY = 'kw-library-v1';
const ACTIVE_KEY = 'kw-active-id';
const STAMPS_KEY = 'kw-stamps-v1';
const PROJ_KEY = 'kw-projects-v1';
const LANG_KEY = 'kw-lang';
const THEME_KEY = 'kw-theme';
const LEGACY_DOC_KEY = 'kt-doc';
const LEGACY_GAUGE_KEY = 'kt-g';
const LEGACY_PROJ_KEY = 'kt-p';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const BAD_CHARS_RE = /[<>&"'`\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g;

export function cleanName(s: unknown, fallback = 'Untitled pattern'): string {
  const cleaned = String(s == null ? '' : s).replace(BAD_CHARS_RE, '').trim().slice(0, 80);
  return cleaned || fallback;
}

export function sanitizeCustomStitch(o: unknown): CustomStitch | null {
  if (!o || typeof o !== 'object') return null;
  const obj = o as Record<string, unknown>;
  if (typeof obj.g !== 'string' || !obj.g.trim()) return null;
  const u = Math.max(0, Math.min(6, Math.floor(Number(obj.u) || 0)));
  const m = Math.max(0, Math.min(3, Math.floor(Number(obj.m) || 0)));
  const g = obj.g.replace(BAD_CHARS_RE, '').trim().slice(0, 2);
  const n = String(obj.n || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  if (!/^[a-z]/.test(n) || !g) return null;
  const t = String(obj.t || '').replace(BAD_CHARS_RE, '').trim().slice(0, 40) || `Custom ${g}`;
  return { g, t, u, m, n };
}

export function makeSamplePattern(): KnitDocument {
  const cols = 24;
  const rows = 24;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(3));
  const sy = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      if (Math.abs(r - (12 + Math.round(4 * Math.sin((k / cols) * Math.PI * 4)))) <= 1) {
        grid[r][k] = 0;
      }
      for (const [a, b] of [
        [6, 6],
        [18, 17],
      ]) {
        const d = Math.hypot(r - a, k - b);
        if (d < 1.6) grid[r][k] = 1;
        else if (d < 3.3) grid[r][k] = 2;
      }
    }
  }
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `pat-${Date.now()}`,
    nm: 'Wave and Medallion Sample',
    cols,
    rows,
    pal: DEFAULT_PALETTE.slice(0, 4),
    grid,
    sy,
    mode: 'flat',
    gauge: { s: 22, r: 30 },
    trk: 0,
    cus: [],
    updatedAt: Date.now(),
  };
}

export function makeBlankPattern(cols = 24, rows = 24, name = 'Untitled pattern', gauge: Gauge = { s: 22, r: 30 }): KnitDocument {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `pat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nm: name,
    cols,
    rows,
    pal: DEFAULT_PALETTE.slice(0, 4),
    grid: Array.from({ length: rows }, () => Array(cols).fill(0)),
    sy: Array.from({ length: rows }, () => Array(cols).fill(0)),
    mode: 'flat',
    gauge: { s: Math.min(60, Math.max(5, gauge.s)), r: Math.min(80, Math.max(5, gauge.r)) },
    trk: 0,
    cus: [],
    updatedAt: Date.now(),
  };
}

const LEGACY_BUILTIN_CODES = new Map([
  ['sl', 8],
  ['k3tog', 9],
  ['m1', 7],
]);

export function validDoc(raw: unknown, fallbackGauge?: Gauge): KnitDocument | null {
  try {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const d = raw as Record<string, unknown>;
    const C = d.cols;
    const R = d.rows;
    if (
      !(
        typeof C === 'number' &&
        typeof R === 'number' &&
        Number.isInteger(C) &&
        Number.isInteger(R) &&
        C >= 2 &&
        C <= 300 &&
        R >= 2 &&
        R <= 400
      )
    ) {
      return null;
    }

    if (!Array.isArray(d.pal) || d.pal.length < 1 || d.pal.length > 12 || !d.pal.every((c) => typeof c === 'string' && HEX_RE.test(c))) {
      return null;
    }

    const rawCus = Array.isArray(d.cus) ? d.cus.slice(0, 25) : [];
    const parsedCus: CustomStitch[] = [];
    const legacyRemap = new Map<number, number>();
    const isV2 = d.v === 2 || (typeof d.id === 'string' && d.gauge !== undefined);
    const builtinCount = BUILTIN_STITCH_CODES.length;

    rawCus.forEach((c, oldCusIdx) => {
      const sanitized = sanitizeCustomStitch(c);
      if (!sanitized) return;
      if (!isV2 && LEGACY_BUILTIN_CODES.has(sanitized.n)) {
        legacyRemap.set(5 + oldCusIdx, LEGACY_BUILTIN_CODES.get(sanitized.n)!);
      } else {
        const idxInBuiltin = BUILTIN_STITCH_CODES.indexOf(sanitized.n);
        if (idxInBuiltin >= 0) {
          legacyRemap.set((isV2 ? builtinCount : 5) + oldCusIdx, idxInBuiltin);
        } else {
          const newIdx = builtinCount + parsedCus.length;
          legacyRemap.set((isV2 ? builtinCount : 5) + oldCusIdx, newIdx);
          parsedCus.push(sanitized);
        }
      }
    });

    const np = d.pal.length;
    const maxSym = builtinCount + parsedCus.length;
    const okGridRow = (r: unknown) =>
      Array.isArray(r) && r.length === C && r.every((v) => typeof v === 'number' && Number.isInteger(v) && v >= -1 && v < np);
    const okSyRow = (r: unknown) =>
      Array.isArray(r) && r.length === C && r.every((v) => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < maxSym + 25);

    if (!Array.isArray(d.grid) || d.grid.length !== R || !d.grid.every(okGridRow)) return null;
    if (!Array.isArray(d.sy) || d.sy.length !== R || !d.sy.every(okSyRow)) return null;

    const mappedSy = (d.sy as number[][]).map((row) =>
      row.map((val) => {
        if (legacyRemap.has(val)) return legacyRemap.get(val)!;
        if (!isV2 && val >= 5) return 0;
        return val < maxSym ? val : 0;
      })
    );

    const gObj = (d.gauge && typeof d.gauge === 'object' ? d.gauge : {}) as Record<string, unknown>;
    const gs = Number.isFinite(Number(gObj.s))
      ? Math.min(60, Math.max(5, Math.round(Number(gObj.s))))
      : fallbackGauge?.s ?? 22;
    const gr = Number.isFinite(Number(gObj.r))
      ? Math.min(80, Math.max(5, Math.round(Number(gObj.r))))
      : fallbackGauge?.r ?? 30;

    return {
      id: typeof d.id === 'string' && d.id.trim() ? d.id.slice(0, 64) : `pat-${Date.now()}`,
      nm: cleanName(d.nm),
      cols: C,
      rows: R,
      pal: d.pal.slice(),
      grid: (d.grid as number[][]).map((r) => r.slice()),
      sy: mappedSy,
      mode: d.mode === 'round' ? 'round' : 'flat',
      gauge: { s: gs, r: gr },
      trk: typeof d.trk === 'number' && Number.isInteger(d.trk) && d.trk >= 0 && d.trk <= R ? d.trk : 0,
      cus: parsedCus,
      updatedAt: typeof d.updatedAt === 'number' && Number.isFinite(d.updatedAt) ? d.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw.length > 6_000_000) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetJSON(key: string, val: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    return false;
  }
}

export function loadPatternLibrary(): { patterns: KnitDocument[]; activeId: string } {
  const saved = safeGetJSON<unknown[]>(LIB_KEY, []);
  const patterns: KnitDocument[] = [];
  if (Array.isArray(saved)) {
    for (const item of saved) {
      const doc = validDoc(item);
      if (doc) patterns.push(doc);
    }
  }

  if (patterns.length === 0) {
    const legacyGaugeRaw = safeGetJSON<{ s?: number; r?: number } | null>(LEGACY_GAUGE_KEY, null);
    const legacyGauge: Gauge = {
      s: legacyGaugeRaw && Number.isFinite(Number(legacyGaugeRaw.s)) ? Math.min(60, Math.max(5, Number(legacyGaugeRaw.s))) : 22,
      r: legacyGaugeRaw && Number.isFinite(Number(legacyGaugeRaw.r)) ? Math.min(80, Math.max(5, Number(legacyGaugeRaw.r))) : 30,
    };
    const legacyDoc = validDoc(safeGetJSON(LEGACY_DOC_KEY, null), legacyGauge);
    patterns.push(legacyDoc ?? makeSamplePattern());
    safeSetJSON(LIB_KEY, patterns);
  }

  let activeId = localStorage.getItem(ACTIVE_KEY) || patterns[0].id;
  if (!patterns.some((p) => p.id === activeId)) {
    activeId = patterns[0].id;
  }
  return { patterns, activeId };
}

export function savePatternLibrary(patterns: KnitDocument[], activeId: string): boolean {
  try {
    localStorage.setItem(ACTIVE_KEY, activeId);
  } catch {
    // ignore
  }
  return safeSetJSON(LIB_KEY, patterns);
}

export function loadStamps(): MotifStamp[] {
  const raw = safeGetJSON<unknown[]>(STAMPS_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is MotifStamp => {
      if (!s || typeof s !== 'object') return false;
      const m = s as MotifStamp;
      return typeof m.id === 'string' && typeof m.name === 'string' && Array.isArray(m.g) && Array.isArray(m.s) && m.w > 0 && m.h > 0;
    })
    .slice(0, 30);
}

export function saveStamps(stamps: MotifStamp[]): boolean {
  return safeSetJSON(STAMPS_KEY, stamps);
}

export function loadProjects(): ProjectItem[] {
  const raw = safeGetJSON<unknown[]>(PROJ_KEY, null as unknown as unknown[]) ?? safeGetJSON<unknown[]>(LEGACY_PROJ_KEY, []);
  const out: ProjectItem[] = [];
  if (Array.isArray(raw)) {
    for (const p of raw.slice(0, 20)) {
      if (!p || typeof p !== 'object') continue;
      const obj = p as Record<string, unknown>;
      const ks = Array.isArray(obj.k) ? obj.k : [{ n: 'Rows', c: obj.c ?? 0 }];
      const counters = ks
        .slice(0, 12)
        .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
        .map((c) => ({
          n: String(c.n ?? 'Rows').slice(0, 40),
          c: Math.max(0, Math.min(1e9, Math.floor(Number(c.c) || 0))),
        }));
      out.push({
        id: typeof obj.id === 'string' ? obj.id : `proj-${out.length + 1}`,
        n: String(obj.n ?? `Project ${out.length + 1}`).slice(0, 80),
        t: String(obj.t ?? '').slice(0, 20000),
        k: counters.length ? counters : [{ n: 'Rows', c: 0 }],
      });
    }
  }
  if (out.length === 0) {
    return [
      { id: 'proj-1', n: 'Project 1', t: '', k: [{ n: 'Rows', c: 0 }] },
      { id: 'proj-2', n: 'Project 2', t: '', k: [{ n: 'Rows', c: 0 }] },
    ];
  }
  return out;
}

export function saveProjects(projects: ProjectItem[]): boolean {
  return safeSetJSON(PROJ_KEY, projects);
}

export function loadLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === 'hu' ? 'hu' : 'en';
  } catch {
    return 'en';
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // ignore
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'dark' || v === 'light') return v;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
