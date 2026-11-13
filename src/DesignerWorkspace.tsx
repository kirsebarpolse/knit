import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Columns,
  Command,
  Copy,
  Eraser,
  Eye,
  FilePlus2,
  FlipHorizontal2,
  FlipVertical2,
  Grid,
  Hand,
  Highlighter,
  Image as ImageIcon,
  Lock,
  Maximize2,
  Minimize2,
  Minus,
  Moon,
  PaintBucket,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Pipette,
  Plus,
  Redo2,
  RotateCcw,
  Rows,
  Scissors,
  Search,
  Slash,
  SlidersHorizontal,
  Square,
  SquareDashed,
  Sun,
  Trash2,
  Undo2,
  Unlock,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type {
  BrushMode,
  ClipboardData,
  CustomStitch,
  Gauge,
  KnitDocument,
  Lang,
  MotifStamp,
  SelectionRect,
  ToolType,
  ViewMode,
} from './core';
import { DEFAULT_PALETTE, sanitizeCustomStitch, tFor, validDoc } from './core';
import {
  BUILTIN_STITCHES,
  CHART_MARGIN,
  YARN_LETTERS,
  analyzePattern,
  buildFillPattern,
  buildPdfBlob,
  buildSVGChart,
  calcCellDims,
  contrastInk,
  convertImageToGrid,
  drawCells,
  estimateYarnUsage,
  exportPNGDataUrl,
  formatDimensionsCm,
  getAllStitches,
  isRightToLeft,
  isWrongSide,
  parseInstructionsToGrid,
  renderChartToCanvas,
  renderRepeatPreview,
  resolveChartTheme,
  rowToInstructions,
  rowToStepChunks,
  safeFilename,
  sniffImageMagic,
  swapHorizontalStitch,
  triggerBlobDownload,
} from './knitEngine';
import {
  Alert,
  Button,
  CollapsiblePanel,
  FieldLabel,
  Input,
  Modal,
  PWAInstallButton,
  Panel,
  SectionTitle,
  SegmentedControl,
  Select,
  TableWrap,
  Textarea,
  ToggleButton,
  cn,
} from './ui';

/* ==========================================================================
   Knit Workshop — Designer Workspace, Pattern Library & Image Import
   ========================================================================== */

interface DesignerWorkspaceProps {
  doc: KnitDocument;
  onChangeDoc: (next: KnitDocument) => void;
  onNewBlank: () => void;
  stamps: MotifStamp[];
  onChangeStamps: (next: MotifStamp[]) => void;
  lang: Lang;
  onToggleLang: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

interface Snapshot {
  cols: number;
  rows: number;
  grid: number[][];
  sy: number[][];
  pal: string[];
  nm: string;
  mode: 'flat' | 'round';
  gauge: { s: number; r: number };
  cus: CustomStitch[];
}

function makeSnapshot(d: KnitDocument): Snapshot {
  return {
    cols: d.cols,
    rows: d.rows,
    grid: d.grid.map((r) => r.slice()),
    sy: d.sy.map((r) => r.slice()),
    pal: d.pal.slice(),
    nm: d.nm,
    mode: d.mode,
    gauge: { ...d.gauge },
    cus: d.cus.map((c) => ({ ...c })),
  };
}

function bresenhamLine(r0: number, k0: number, r1: number, k1: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  const dr = Math.abs(r1 - r0);
  const dk = Math.abs(k1 - k0);
  const sr = r0 < r1 ? 1 : -1;
  const sk = k0 < k1 ? 1 : -1;
  let err = dk - dr;
  let r = r0;
  let k = k0;
  for (;;) {
    pts.push([r, k]);
    if (r === r1 && k === k1) break;
    const e2 = 2 * err;
    if (e2 > -dr) {
      err -= dr;
      k += sk;
    }
    if (e2 < dk) {
      err += dk;
      r += sr;
    }
  }
  return pts;
}

export const DesignerWorkspace: React.FC<DesignerWorkspaceProps> = ({
  doc,
  onChangeDoc,
  onNewBlank,
  stamps,
  onChangeStamps,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
}) => {
  const t = tFor(lang);
  const allStitches = useMemo(() => getAllStitches(doc.cus), [doc.cus]);

  const [tool, setTool] = useState<ToolType>('p');
  const [brushMode, setBrushMode] = useState<BrushMode>('b');
  const [curYarn, setCurYarn] = useState(0);
  const [curSym, setCurSym] = useState(0);
  const [symX, setSymX] = useState(false);
  const [symY, setSymY] = useState(false);
  const [view, setView] = useState<ViewMode>('g');
  const [zoom, setZoom] = useState(1);
  const [activeDrawer, setActiveDrawer] = useState<'pattern' | 'fills' | null>(null);
  const [showTextImport, setShowTextImport] = useState(false);
  const [knitMode, setKnitMode] = useState(false);
  const [dimCompleted, setDimCompleted] = useState(true);
  const [floatLimit, setFloatLimit] = useState(5);
  const [doneStepIdxs, setDoneStepIdxs] = useState<number[]>([]);

  // Persisted Workspace Layout & Accessibility Preferences
  const [zenMode, setZenMode] = useState<boolean>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('kw-workspace-prefs-v1') || '{}');
      return Boolean(raw.zenMode);
    } catch {
      return false;
    }
  });
  const [leftCompact, setLeftCompact] = useState<boolean>(() => {
  try {
    const raw = JSON.parse(localStorage.getItem('kw-workspace-prefs-v1') || '{}');
    return typeof raw.leftCompact === 'boolean' ? raw.leftCompact : true;
  } catch {
    return true;
  }
});
  const [rightTab, setRightTab] = useState<'live' | 'checks' | 'legend'>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('kw-workspace-prefs-v1') || '{}');
      return raw.rightTab === 'checks' || raw.rightTab === 'legend' ? raw.rightTab : 'live';
    } catch {
      return 'live';
    }
  });
  const [showYarnLetters, setShowYarnLetters] = useState<boolean>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('kw-workspace-prefs-v1') || '{}');
      return Boolean(raw.showYarnLetters);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'kw-workspace-prefs-v1',
        JSON.stringify({ zenMode, leftCompact, rightTab, showYarnLetters })
      );
    } catch {
      // ignore storage errors
    }
  }, [zenMode, leftCompact, rightTab, showYarnLetters]);

  // CAD Ergonomics: Spacebar temporary pan, Alt temporary eyedropper, Command Palette, Ghost HUD, Stamp placement, Magic Marker, Knit Cycle Counter
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [altHeld, setAltHeld] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [pendingStamp, setPendingStamp] = useState<MotifStamp | null>(null);
  const [hoverHud, setHoverHud] = useState<{
    r: number;
    k: number;
    clientX: number;
    clientY: number;
  } | null>(null);
  const [dragShapeEnd, setDragShapeEnd] = useState<[number, number] | null>(null);
  const [highlightSym, setHighlightSym] = useState<number | null>(null);
  const [highlightYarn, setHighlightYarn] = useState<number | null>(null);
  const [cycleEvery, setCycleEvery] = useState(6);
  const [cycleCurrent, setCycleCurrent] = useState(1);

  const effectiveTool: ToolType = spaceHeld ? 'h' : altHeld ? 'i' : tool;

  useEffect(() => {
    setDoneStepIdxs([]);
  }, [doc.id, doc.trk]);

  useEffect(() => {
    if (!activeDrawer && !commandOpen && !pendingStamp) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (commandOpen) setCommandOpen(false);
        else if (pendingStamp) setPendingStamp(null);
        else if (activeDrawer) setActiveDrawer(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeDrawer, commandOpen, pendingStamp]);

  // Global Figma/Photoshop-grade hotkeys: Tab = Zen Mode, Ctrl/Cmd+K = Command Palette, Space hold = Pan, Alt hold = Pipette
  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandQuery('');
        setCommandOpen((v) => !v);
        return;
      }

      if (isTypingTarget(e.target) || activeDrawer || commandOpen) return;

      if (e.key === 'Tab' && !knitMode) {
        e.preventDefault();
        setZenMode((v) => !v);
        return;
      }

      if (e.key === ' ' && !knitMode) {
        e.preventDefault();
        if (!e.repeat) setSpaceHeld(true);
        return;
      }

      if (e.key === 'Alt' && !knitMode) {
        if (!e.repeat) setAltHeld(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') setSpaceHeld(false);
      if (e.key === 'Alt') setAltHeld(false);
    };

    const onBlur = () => {
      setSpaceHeld(false);
      setAltHeld(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [activeDrawer, commandOpen, knitMode]);

  const [cursor, setCursor] = useState<{ r: number; k: number }>({ r: 0, k: 0 });
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const selAnchorRef = useRef<[number, number] | null>(null);
  const shapeStartRef = useRef<[number, number] | null>(null);
  const preShapeDocRef = useRef<KnitDocument | null>(null);
  const panStartRef = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);

  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (!statusMsg) return;
    const timer = window.setTimeout(() => setStatusMsg(''), 4000);
    return () => window.clearTimeout(timer);
  }, [statusMsg]);
  const [instructionsText, setInstructionsText] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null);
  const [repCount, setRepCount] = useState(2);

  const [sizeCols, setSizeCols] = useState(doc.cols);
  const [sizeRows, setSizeRows] = useState(doc.rows);
  const [stretchEvery, setStretchEvery] = useState(5);
  const [shiftWrap, setShiftWrap] = useState(true);

  const [fillType, setFillType] = useState<'hound' | 'hstripe' | 'vstripe' | 'check' | 'zig' | 'diam'>('hound');
  const [fillYarn1, setFillYarn1] = useState(0);
  const [fillYarn2, setFillYarn2] = useState(Math.min(1, doc.pal.length - 1));
  const [fillSize, setFillSize] = useState(2);

  const [csName, setCsName] = useState('');
  const [csCode, setCsCode] = useState('');
  const [csGlyph, setCsGlyph] = useState('');
  const [csUses, setCsUses] = useState(1);
  const [csMakes, setCsMakes] = useState(1);
  const [csMsg, setCsMsg] = useState<string | null>(null);

  const [stampName, setStampName] = useState('');

  const [pendingImageEl, setPendingImageEl] = useState<HTMLImageElement | null>(null);
  const knitFileInputRef = useRef<HTMLInputElement>(null);
  const imgFileInputRef = useRef<HTMLInputElement>(null);

  const [wakeActive, setWakeActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const wantWakeRef = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const didAutoFitRef = useRef(false);
  const isDrawingRef = useRef(false);
  const lastCellRef = useRef<[number, number] | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchBaseRef = useRef<{ dist: number; zoom: number; midX: number; midY: number; sl: number; st: number } | null>(null);

  const computeFitZoom = useCallback(() => {
    const el = paperRef.current;
    if (!el) return 1.25;
    const margin = view === 'g' ? CHART_MARGIN : 12;
    const availW = Math.max(200, el.clientWidth - 28 - margin * 2);
    const availH = Math.max(200, el.clientHeight - 28 - margin * 2);
    const baseCellW = 24;
    const baseCellH = (24 * doc.gauge.s) / doc.gauge.r;
    const zw = availW / (doc.cols * baseCellW);
    const zh = availH / (doc.rows * baseCellH);
    return Math.max(0.25, Math.min(3.0, Math.min(zw, zh)));
  }, [doc.cols, doc.rows, doc.gauge.s, doc.gauge.r, view]);

  useEffect(() => {
    if (didAutoFitRef.current) return;
    didAutoFitRef.current = true;
    const id = window.requestAnimationFrame(() => {
      setZoom(Math.max(0.85, Math.min(2.0, computeFitZoom())));
    });
    return () => window.cancelAnimationFrame(id);
  }, [computeFitZoom]);

  useEffect(() => {
    setSizeCols(doc.cols);
    setSizeRows(doc.rows);
    setCurYarn((prev) => Math.min(prev, doc.pal.length - 1));
    setFillYarn2((prev) => Math.min(prev, doc.pal.length - 1));
    setCursor((prev) => ({
      r: Math.min(prev.r, doc.rows - 1),
      k: Math.min(prev.k, doc.cols - 1),
    }));
    setSelection((prev) => (prev && (prev.r1 >= doc.rows || prev.k1 >= doc.cols) ? null : prev));
  }, [doc.id, doc.cols, doc.rows, doc.pal.length]);

  const analysis = useMemo(
    () => analyzePattern(doc.grid, doc.sy, doc.cols, doc.rows, doc.mode, allStitches, lang, floatLimit),
    [doc.grid, doc.sy, doc.cols, doc.rows, doc.mode, allStitches, lang, floatLimit]
  );

  const mismatchSet = useMemo(() => new Set(analysis.mismatchRows), [analysis.mismatchRows]);
  const floatSet = useMemo(() => new Set(analysis.floatRows), [analysis.floatRows]);

  const yarnStats = useMemo(() => {
    const counts = Array(doc.pal.length).fill(0);
    doc.grid.forEach((row) =>
      row.forEach((v) => {
        if (v >= 0 && v < counts.length) counts[v]++;
      })
    );
    const total = counts.reduce((a, b) => a + b, 0) || 1;
    const estimates = estimateYarnUsage(counts, doc.gauge);
    return counts.map((count, i) => ({
      count,
      pct: Math.round((count / total) * 100),
      meters: estimates[i].meters,
      grams: estimates[i].grams,
    }));
  }, [doc.grid, doc.pal.length, doc.gauge]);

  const soloYarn = useMemo(() => {
    const used = new Set<number>();
    doc.grid.forEach((r) =>
      r.forEach((v) => {
        if (v >= 0) used.add(v);
      })
    );
    return used.size <= 1 && (!used.size || used.has(0));
  }, [doc.grid]);

  const pushUndo = useCallback((d: KnitDocument) => {
    setUndoStack((prev) => [...prev.slice(-59), makeSnapshot(d)]);
    setRedoStack([]);
  }, []);

  const restoreSnapshot = useCallback(
    (snap: Snapshot) => {
      setSelection(null);
      onChangeDoc({
        ...doc,
        cols: snap.cols,
        rows: snap.rows,
        grid: snap.grid.map((r) => r.slice()),
        sy: snap.sy.map((r) => r.slice()),
        pal: snap.pal.slice(),
        nm: snap.nm,
        mode: snap.mode,
        gauge: { ...snap.gauge },
        cus: snap.cus.map((c) => ({ ...c })),
        trk: Math.min(doc.trk, snap.rows),
        updatedAt: Date.now(),
      });
    },
    [doc, onChangeDoc]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, makeSnapshot(doc)]);
    setUndoStack((u) => u.slice(0, -1));
    restoreSnapshot(prev);
  }, [undoStack, doc, restoreSnapshot]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, makeSnapshot(doc)]);
    setRedoStack((r) => r.slice(0, -1));
    restoreSnapshot(next);
  }, [redoStack, doc, restoreSnapshot]);

  // Render main canvas & preview canvas using live CSS token bridge
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const margin = view === 'g' ? CHART_MARGIN : 12;
    const [w, h] = calcCellDims(doc.cols, doc.rows, doc.gauge, zoom, margin);
    canvas.width = Math.ceil(doc.cols * w + 2 * margin);
    canvas.height = Math.ceil(doc.rows * h + 2 * margin);

    const ghostPreview =
      pendingStamp && hoverHud && !knitMode
        ? { r0: hoverHud.r, k0: hoverHud.k, g: pendingStamp.g, s: pendingStamp.s }
        : null;

    renderChartToCanvas(ctx, {
      grid: doc.grid,
      sy: doc.sy,
      pal: doc.pal,
      cols: doc.cols,
      rows: doc.rows,
      w,
      h,
      mode: view,
      margin,
      knittedMode: doc.mode,
      stitches: allStitches,
      cursor: knitMode ? null : cursor,
      selection: knitMode ? null : selection,
      trackerRow: doc.trk,
      dimCompleted: doc.trk > 0 && dimCompleted,
      mismatchRows: mismatchSet,
      floatRows: floatSet,
      symX: !knitMode && symX,
      symY: !knitMode && symY,
      showGuides: true,
      showYarnLetters,
      highlightSym,
      highlightYarn,
      ghostPreview,
      chartTheme: resolveChartTheme('screen'),
    });
  }, [
    doc,
    view,
    zoom,
    allStitches,
    cursor,
    selection,
    knitMode,
    dimCompleted,
    mismatchSet,
    floatSet,
    symX,
    symY,
    theme,
    showYarnLetters,
    highlightSym,
    highlightYarn,
    pendingStamp,
    hoverHud,
  ]);

  useEffect(() => {
    if (!previewCanvasRef.current) return;
    renderRepeatPreview(
      previewCanvasRef.current,
      doc.grid,
      doc.sy,
      doc.pal,
      doc.cols,
      doc.rows,
      doc.gauge,
      repCount,
      allStitches,
      resolveChartTheme('screen')
    );
  }, [doc.grid, doc.sy, doc.pal, doc.cols, doc.rows, doc.gauge, repCount, allStitches, theme, activeDrawer]);

  const okCell = (r: number, k: number) => r >= 0 && k >= 0 && r < doc.rows && k < doc.cols;

  const paintCellOnArrays = useCallback(
    (grid: number[][], sy: number[][], r: number, k: number, activeTool: ToolType) => {
      const applySingle = (rr: number, kk: number) => {
        if (rr < 0 || kk < 0 || rr >= doc.rows || kk >= doc.cols) return;
        if (activeTool === 'e') {
          grid[rr][kk] = 0;
          sy[rr][kk] = 0;
          return;
        }
        if (activeTool === 'n') {
          grid[rr][kk] = -1;
          sy[rr][kk] = 0;
          return;
        }

        const st = allStitches[curSym];
        const span = st?.span && brushMode !== 'c' ? st.span : 1;
        if (span > 1) {
          const startK = Math.min(doc.cols - span, Math.max(0, kk));
          for (let offset = 0; offset < span; offset++) {
            const tk = startK + offset;
            if (tk >= doc.cols) continue;
            if (brushMode !== 's') grid[rr][tk] = curYarn;
            else if (grid[rr][tk] < 0) grid[rr][tk] = curYarn;
            if (brushMode !== 'c') sy[rr][tk] = curSym;
          }
          return;
        }

        if (brushMode !== 's') grid[rr][kk] = curYarn;
        else if (grid[rr][kk] < 0) grid[rr][kk] = curYarn;
        if (brushMode !== 'c') sy[rr][kk] = curSym;
      };

      applySingle(r, k);
      if (symX) applySingle(r, doc.cols - 1 - k);
      if (symY) applySingle(doc.rows - 1 - r, k);
      if (symX && symY) applySingle(doc.rows - 1 - r, doc.cols - 1 - k);
    },
    [doc.rows, doc.cols, allStitches, curSym, brushMode, curYarn, symX, symY]
  );

  const floodFillAt = useCallback(
    (r: number, k: number, baseDoc: KnitDocument): KnitDocument => {
      const grid = baseDoc.grid.map((row) => row.slice());
      const sy = baseDoc.sy.map((row) => row.slice());
      const targetYarn = grid[r][k];
      const targetSym = sy[r][k];
      const writeYarn = brushMode !== 's' ? curYarn : targetYarn < 0 ? curYarn : targetYarn;
      const writeSym = brushMode !== 'c' ? curSym : targetSym;
      if (writeYarn === targetYarn && writeSym === targetSym) return baseDoc;

      const same = (rr: number, kk: number) =>
        brushMode === 'c'
          ? grid[rr][kk] === targetYarn
          : brushMode === 's'
          ? sy[rr][kk] === targetSym
          : grid[rr][kk] === targetYarn && sy[rr][kk] === targetSym;

      const seen = new Set<number>();
      const queue: Array<[number, number]> = [[r, k]];
      while (queue.length) {
        const [rr, kk] = queue.pop()!;
        if (rr < 0 || kk < 0 || rr >= baseDoc.rows || kk >= baseDoc.cols) continue;
        const id = rr * baseDoc.cols + kk;
        if (seen.has(id) || !same(rr, kk)) continue;
        seen.add(id);
        if (brushMode !== 's') grid[rr][kk] = curYarn;
        else if (grid[rr][kk] < 0) grid[rr][kk] = curYarn;
        if (brushMode !== 'c') sy[rr][kk] = curSym;
        queue.push([rr + 1, kk], [rr - 1, kk], [rr, kk + 1], [rr, kk - 1]);
      }

      return { ...baseDoc, grid, sy, updatedAt: Date.now() };
    },
    [brushMode, curYarn, curSym]
  );

  const getCellFromPointer = (clientX: number, clientY: number): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const margin = view === 'g' ? CHART_MARGIN : 12;
    const [w, h] = calcCellDims(doc.cols, doc.rows, doc.gauge, zoom, margin);
    const r = Math.floor((((clientY - rect.top) * canvas.height) / rect.height - margin) / h);
    const k = Math.floor((((clientX - rect.left) * canvas.width) / rect.width - margin) / w);
    return okCell(r, k) ? [r, k] : null;
  };

  const announceCell = (r: number, k: number, d: KnitDocument = doc) => {
    const v = d.grid[r][k];
    const q = d.sy[r][k];
    const rn = (d.mode === 'round' ? (lang === 'hu' ? 'Kör ' : 'Round ') : (lang === 'hu' ? 'Sor ' : 'Row ')) + (d.rows - r);
    const stNum = d.cols - k;
    const stInfo = allStitches[q];
    const stLabel = stInfo ? (lang === 'hu' ? stInfo.titleHu : stInfo.titleEn) : 'k';
    if (v < 0 && q === 0) {
      setStatusMsg(`${rn}, ${stNum}: ${lang === 'hu' ? 'nincs szem' : 'no stitch'}`);
    } else {
      const yarnStr = v < 0 ? (lang === 'hu' ? 'üres' : 'empty') : `${lang === 'hu' ? 'Fonal' : 'Yarn'} ${YARN_LETTERS[v]}`;
      setStatusMsg(`${rn}, ${stNum}: ${yarnStr} · ${stLabel}`);
    }
  };

  const placeStampAt = useCallback(
    (stamp: MotifStamp, r0: number, k0: number) => {
      pushUndo(doc);
      const grid = doc.grid.map((row) => row.slice());
      const sy = doc.sy.map((row) => row.slice());
      for (let r = 0; r < stamp.h; r++) {
        for (let k = 0; k < stamp.w; k++) {
          const tr = r0 + r;
          const tk = k0 + k;
          if (okCell(tr, tk)) {
            const yarn = stamp.g[r][k];
            grid[tr][tk] = yarn < doc.pal.length ? yarn : 0;
            sy[tr][tk] = stamp.s[r][k] < allStitches.length ? stamp.s[r][k] : 0;
          }
        }
      }
      setCursor({ r: r0, k: k0 });
      setSelection({
        r0,
        k0,
        r1: Math.min(doc.rows - 1, r0 + stamp.h - 1),
        k1: Math.min(doc.cols - 1, k0 + stamp.w - 1),
      });
      onChangeDoc({ ...doc, grid, sy, updatedAt: Date.now() });
      setStatusMsg(lang === 'hu' ? `Bélyegző letéve: ${stamp.name}` : `Placed stamp: ${stamp.name}`);
    },
    [doc, allStitches.length, onChangeDoc, pushUndo, lang]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2 && paperRef.current) {
      isDrawingRef.current = false;
      panStartRef.current = null;
      const pts = [...activePointersRef.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchBaseRef.current = {
        dist: Math.max(10, dist),
        zoom,
        midX: (pts[0].x + pts[1].x) / 2,
        midY: (pts[0].y + pts[1].y) / 2,
        sl: paperRef.current.scrollLeft,
        st: paperRef.current.scrollTop,
      };
      return;
    }

    if (knitMode) return;

    // Middle mouse or Hand tool / Space-hold drag-to-pan
    if ((effectiveTool === 'h' || e.button === 1) && paperRef.current) {
      e.preventDefault();
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        sl: paperRef.current.scrollLeft,
        st: paperRef.current.scrollTop,
      };
      setIsPanning(true);
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    const cell = getCellFromPointer(e.clientX, e.clientY);
    if (!cell) return;
    const [r, k] = cell;
    setCursor({ r, k });
    setHoverHud({ r, k, clientX: e.clientX, clientY: e.clientY });

    // Live Ghost Stamp placement on click
    if (pendingStamp) {
      placeStampAt(pendingStamp, r, k);
      setPendingStamp(null);
      return;
    }

    if (effectiveTool === 's') {
      selAnchorRef.current = [r, k];
      setSelection({ r0: r, r1: r, k0: k, k1: k });
      setDragShapeEnd([r, k]);
      isDrawingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    if (effectiveTool === 'i' || e.altKey) {
      if (doc.grid[r][k] >= 0) {
        setCurYarn(doc.grid[r][k]);
        setCurSym(doc.sy[r][k]);
        setBrushMode('b');
      }
      if (!altHeld) setTool('p');
      announceCell(r, k);
      return;
    }

    if (effectiveTool === 'f') {
      pushUndo(doc);
      const next = floodFillAt(r, k, doc);
      onChangeDoc(next);
      announceCell(r, k, next);
      return;
    }

    if (effectiveTool === 'l' || effectiveTool === 'r') {
      pushUndo(doc);
      preShapeDocRef.current = doc;
      shapeStartRef.current = [r, k];
      setDragShapeEnd([r, k]);
      isDrawingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      const nextGrid = doc.grid.map((row) => row.slice());
      const nextSy = doc.sy.map((row) => row.slice());
      paintCellOnArrays(nextGrid, nextSy, r, k, 'p');
      onChangeDoc({ ...doc, grid: nextGrid, sy: nextSy, updatedAt: Date.now() });
      return;
    }

    pushUndo(doc);
    isDrawingRef.current = true;
    lastCellRef.current = [r, k];
    e.currentTarget.setPointerCapture(e.pointerId);
    const nextGrid = doc.grid.map((row) => row.slice());
    const nextSy = doc.sy.map((row) => row.slice());
    paintCellOnArrays(nextGrid, nextSy, r, k, effectiveTool);
    const nextDoc = { ...doc, grid: nextGrid, sy: nextSy, updatedAt: Date.now() };
    onChangeDoc(nextDoc);
    announceCell(r, k, nextDoc);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (activePointersRef.current.size === 2 && pinchBaseRef.current && paperRef.current) {
      const pts = [...activePointersRef.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const scale = dist / pinchBaseRef.current.dist;
      setZoom(Math.max(0.2, Math.min(3, pinchBaseRef.current.zoom * scale)));
      paperRef.current.scrollLeft = pinchBaseRef.current.sl - (midX - pinchBaseRef.current.midX);
      paperRef.current.scrollTop = pinchBaseRef.current.st - (midY - pinchBaseRef.current.midY);
      return;
    }

    if (panStartRef.current && paperRef.current) {
      paperRef.current.scrollLeft = panStartRef.current.sl - (e.clientX - panStartRef.current.x);
      paperRef.current.scrollTop = panStartRef.current.st - (e.clientY - panStartRef.current.y);
      return;
    }

    const hoverCell = getCellFromPointer(e.clientX, e.clientY);
    if (!knitMode) {
      if (hoverCell) {
        setHoverHud({ r: hoverCell[0], k: hoverCell[1], clientX: e.clientX, clientY: e.clientY });
      } else if (!isDrawingRef.current) {
        setHoverHud(null);
      }
    }

    if (!isDrawingRef.current || knitMode || !hoverCell) return;
    const [r, k] = hoverCell;

    if (effectiveTool === 's' && selAnchorRef.current) {
      const [ar, ak] = selAnchorRef.current;
      setDragShapeEnd([r, k]);
      setSelection({
        r0: Math.min(ar, r),
        r1: Math.max(ar, r),
        k0: Math.min(ak, k),
        k1: Math.max(ak, k),
      });
      return;
    }

    if ((effectiveTool === 'l' || effectiveTool === 'r') && shapeStartRef.current && preShapeDocRef.current) {
      const [sr, sk] = shapeStartRef.current;
      setDragShapeEnd([r, k]);
      const base = preShapeDocRef.current;
      const nextGrid = base.grid.map((row) => row.slice());
      const nextSy = base.sy.map((row) => row.slice());
      if (effectiveTool === 'l') {
        for (const [pr, pk] of bresenhamLine(sr, sk, r, k)) {
          paintCellOnArrays(nextGrid, nextSy, pr, pk, 'p');
        }
      } else {
        const r0 = Math.min(sr, r);
        const r1 = Math.max(sr, r);
        const k0 = Math.min(sk, k);
        const k1 = Math.max(sk, k);
        for (let rr = r0; rr <= r1; rr++) {
          for (let kk = k0; kk <= k1; kk++) {
            paintCellOnArrays(nextGrid, nextSy, rr, kk, 'p');
          }
        }
      }
      setCursor({ r, k });
      onChangeDoc({ ...base, grid: nextGrid, sy: nextSy, updatedAt: Date.now() });
      return;
    }

    if ((effectiveTool === 'p' || effectiveTool === 'e' || effectiveTool === 'n') && lastCellRef.current) {
      const [lr, lk] = lastCellRef.current;
      if (lr === r && lk === k) return;
      const nextGrid = doc.grid.map((row) => row.slice());
      const nextSy = doc.sy.map((row) => row.slice());
      for (const [pr, pk] of bresenhamLine(lr, lk, r, k)) {
        paintCellOnArrays(nextGrid, nextSy, pr, pk, effectiveTool);
      }
      lastCellRef.current = [r, k];
      setCursor({ r, k });
      const nextDoc = { ...doc, grid: nextGrid, sy: nextSy, updatedAt: Date.now() };
      onChangeDoc(nextDoc);
      announceCell(r, k, nextDoc);
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) pinchBaseRef.current = null;
    panStartRef.current = null;
    setIsPanning(false);
    isDrawingRef.current = false;
    lastCellRef.current = null;
    shapeStartRef.current = null;
    preShapeDocRef.current = null;
    setDragShapeEnd(null);
  };

  const runSelectionOp = useCallback(
    (op: 'c' | 'x' | 'p' | 'h' | 'v' | 'f' | 'd') => {
      if (knitMode) return;
      const activeSel =
        selection ??
        (op === 'p' && clipboard ? { r0: cursor.r, r1: cursor.r, k0: cursor.k, k1: cursor.k } : null);
      if (!activeSel) return;

      const { r0, r1, k0, k1 } = activeSel;
      const H = r1 - r0 + 1;
      const W = k1 - k0 + 1;

      if (op === 'c' || op === 'x') {
        const g: number[][] = [];
        const s: number[][] = [];
        for (let r = r0; r <= r1; r++) {
          g.push(doc.grid[r].slice(k0, k1 + 1));
          s.push(doc.sy[r].slice(k0, k1 + 1));
        }
        setClipboard({ h: H, w: W, g, s });
        setStatusMsg(lang === 'hu' ? `Másolva: ${W} × ${H}` : `Copied ${W} × ${H}`);
        if (op === 'c') return;
      }

      if (op === 'p' && !clipboard) return;

      pushUndo(doc);
      const grid = doc.grid.map((row) => row.slice());
      const sy = doc.sy.map((row) => row.slice());

      if (op === 'p' && clipboard) {
        for (let r = 0; r < clipboard.h; r++) {
          for (let k = 0; k < clipboard.w; k++) {
            if (okCell(r0 + r, k0 + k)) {
              grid[r0 + r][k0 + k] = clipboard.g[r][k];
              sy[r0 + r][k0 + k] = clipboard.s[r][k];
            }
          }
        }
        setSelection({
          r0,
          k0,
          r1: Math.min(doc.rows - 1, r0 + clipboard.h - 1),
          k1: Math.min(doc.cols - 1, k0 + clipboard.w - 1),
        });
      } else if (op === 'x' || op === 'd') {
        for (let r = r0; r <= r1; r++) {
          for (let k = k0; k <= k1; k++) {
            grid[r][k] = -1;
            sy[r][k] = 0;
          }
        }
      } else if (op === 'f') {
        for (let r = r0; r <= r1; r++) {
          for (let k = k0; k <= k1; k++) {
            if (brushMode !== 's') grid[r][k] = curYarn;
            else if (grid[r][k] < 0) grid[r][k] = curYarn;
            if (brushMode !== 'c') sy[r][k] = curSym;
          }
        }
      } else if (op === 'h') {
        for (let r = r0; r <= r1; r++) {
          const rg = grid[r].slice(k0, k1 + 1).reverse();
          const rs = sy[r].slice(k0, k1 + 1).reverse().map(swapHorizontalStitch);
          for (let k = 0; k < W; k++) {
            grid[r][k0 + k] = rg[k];
            sy[r][k0 + k] = rs[k];
          }
        }
      } else if (op === 'v') {
        const rg = grid.slice(r0, r1 + 1).map((r) => r.slice(k0, k1 + 1)).reverse();
        const rs = sy.slice(r0, r1 + 1).map((r) => r.slice(k0, k1 + 1)).reverse();
        for (let r = 0; r < H; r++) {
          for (let k = 0; k < W; k++) {
            grid[r0 + r][k0 + k] = rg[r][k];
            sy[r0 + r][k0 + k] = rs[r][k];
          }
        }
      }

      onChangeDoc({ ...doc, grid, sy, updatedAt: Date.now() });
    },
    [knitMode, selection, clipboard, cursor, doc, pushUndo, onChangeDoc, brushMode, curYarn, curSym, lang]
  );

  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (knitMode) {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextRow = doc.trk >= doc.rows ? 1 : doc.trk + 1;
        onChangeDoc({ ...doc, trk: nextRow, updatedAt: Date.now() });
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevRow = doc.trk <= 1 ? doc.rows : doc.trk - 1;
        onChangeDoc({ ...doc, trk: prevRow, updatedAt: Date.now() });
      }
      return;
    }

    if (e.key === 'Escape') {
      setSelection(null);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      e.shiftKey ? handleRedo() : handleUndo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      runSelectionOp({ c: 'c', x: 'x', v: 'p' }[e.key.toLowerCase()] as 'c' | 'x' | 'p');
      return;
    }

    const deltas: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const delta = deltas[e.key];
    if (delta) {
      e.preventDefault();
      const nr = Math.max(0, Math.min(doc.rows - 1, cursor.r + delta[0]));
      const nk = Math.max(0, Math.min(doc.cols - 1, cursor.k + delta[1]));
      if (e.shiftKey) {
        if (!selection) selAnchorRef.current = [cursor.r, cursor.k];
        const [ar, ak] = selAnchorRef.current ?? [cursor.r, cursor.k];
        setSelection({ r0: Math.min(ar, nr), r1: Math.max(ar, nr), k0: Math.min(ak, nk), k1: Math.max(ak, nk) });
      }
      setCursor({ r: nr, k: nk });
      announceCell(nr, nk);
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      pushUndo(doc);
      const grid = doc.grid.map((row) => row.slice());
      const sy = doc.sy.map((row) => row.slice());
      paintCellOnArrays(grid, sy, cursor.r, cursor.k, tool === 'n' || tool === 'e' ? tool : 'p');
      const next = { ...doc, grid, sy, updatedAt: Date.now() };
      onChangeDoc(next);
      announceCell(cursor.r, cursor.k, next);
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (selection) {
        runSelectionOp('d');
      } else {
        pushUndo(doc);
        const grid = doc.grid.map((row) => row.slice());
        const sy = doc.sy.map((row) => row.slice());
        grid[cursor.r][cursor.k] = -1;
        sy[cursor.r][cursor.k] = 0;
        onChangeDoc({ ...doc, grid, sy, updatedAt: Date.now() });
      }
      return;
    }

    const shortcutTool: Record<string, ToolType> = {
      p: 'p',
      e: 'e',
      n: 'n',
      f: 'f',
      i: 'i',
      s: 's',
      h: 'h',
      l: 'l',
      r: 'r',
    };
    const nextTool = shortcutTool[e.key.toLowerCase()];
    if (nextTool && !e.ctrlKey && !e.metaKey) {
      setTool(nextTool);
    }
  };

  const handleResize = () => {
    const nc = Math.min(300, Math.max(2, Math.floor(sizeCols) || 24));
    const nr = Math.min(400, Math.max(2, Math.floor(sizeRows) || 24));
    pushUndo(doc);
    const grid = Array.from({ length: nr }, () => Array(nc).fill(0));
    const sy = Array.from({ length: nr }, () => Array(nc).fill(0));
    const dr = nr - doc.rows;
    const dc = nc - doc.cols;
    for (let r = 0; r < doc.rows; r++) {
      for (let k = 0; k < doc.cols; k++) {
        const rr = r + dr;
        const kk = k + dc;
        if (rr >= 0 && rr < nr && kk >= 0 && kk < nc) {
          grid[rr][kk] = doc.grid[r][k];
          sy[rr][kk] = doc.sy[r][k];
        }
      }
    }
    onChangeDoc({ ...doc, cols: nc, rows: nr, grid, sy, trk: Math.min(doc.trk, nr), updatedAt: Date.now() });
  };

  const handleInsertRow = () => {
    if (doc.rows >= 400) return;
    pushUndo(doc);
    const at = cursor.r;
    const grid = [...doc.grid.slice(0, at), Array(doc.cols).fill(0), ...doc.grid.slice(at)];
    const sy = [...doc.sy.slice(0, at), Array(doc.cols).fill(0), ...doc.sy.slice(at)];
    onChangeDoc({ ...doc, rows: doc.rows + 1, grid, sy, updatedAt: Date.now() });
  };

  const handleDeleteRow = () => {
    if (doc.rows <= 2) return;
    pushUndo(doc);
    const at = cursor.r;
    const grid = doc.grid.filter((_, idx) => idx !== at);
    const sy = doc.sy.filter((_, idx) => idx !== at);
    onChangeDoc({ ...doc, rows: doc.rows - 1, grid, sy, trk: Math.min(doc.trk, doc.rows - 1), updatedAt: Date.now() });
  };

  const handleInsertCol = () => {
    if (doc.cols >= 300) return;
    pushUndo(doc);
    const at = cursor.k;
    const grid = doc.grid.map((row) => [...row.slice(0, at), 0, ...row.slice(at)]);
    const sy = doc.sy.map((row) => [...row.slice(0, at), 0, ...row.slice(at)]);
    onChangeDoc({ ...doc, cols: doc.cols + 1, grid, sy, updatedAt: Date.now() });
  };

  const handleDeleteCol = () => {
    if (doc.cols <= 2) return;
    pushUndo(doc);
    const at = cursor.k;
    const grid = doc.grid.map((row) => row.filter((_, idx) => idx !== at));
    const sy = doc.sy.map((row) => row.filter((_, idx) => idx !== at));
    onChangeDoc({ ...doc, cols: doc.cols - 1, grid, sy, updatedAt: Date.now() });
  };

  const handleShift = (dr: number, dk: number) => {
    pushUndo(doc);
    const r0 = selection ? selection.r0 : 0;
    const r1 = selection ? selection.r1 : doc.rows - 1;
    const k0 = selection ? selection.k0 : 0;
    const k1 = selection ? selection.k1 : doc.cols - 1;
    const H = r1 - r0 + 1;
    const W = k1 - k0 + 1;

    const grid = doc.grid.map((row) => row.slice());
    const sy = doc.sy.map((row) => row.slice());

    for (let lr = 0; lr < H; lr++) {
      for (let lk = 0; lk < W; lk++) {
        const sr = lr - dr;
        const sk = lk - dk;
        if (shiftWrap) {
          const wr = ((sr % H) + H) % H;
          const wk = ((sk % W) + W) % W;
          grid[r0 + lr][k0 + lk] = doc.grid[r0 + wr][k0 + wk];
          sy[r0 + lr][k0 + lk] = doc.sy[r0 + wr][k0 + wk];
        } else if (sr >= 0 && sr < H && sk >= 0 && sk < W) {
          grid[r0 + lr][k0 + lk] = doc.grid[r0 + sr][k0 + sk];
          sy[r0 + lr][k0 + lk] = doc.sy[r0 + sr][k0 + sk];
        } else {
          grid[r0 + lr][k0 + lk] = 0;
          sy[r0 + lr][k0 + lk] = 0;
        }
      }
    }
    onChangeDoc({ ...doc, grid, sy, updatedAt: Date.now() });
  };

  const handleStretchRows = () => {
    const n = Math.max(2, Math.min(20, Math.floor(stretchEvery) || 5));
    const add = Math.floor(doc.rows / n);
    if (doc.rows + add > 400) {
      setStatusMsg(lang === 'hu' ? 'Legfeljebb 400 sor támogatott.' : '400 rows maximum.');
      return;
    }
    pushUndo(doc);
    const grid: number[][] = [];
    const sy: number[][] = [];
    for (let r = 0; r < doc.rows; r++) {
      grid.push(doc.grid[r].slice());
      sy.push(doc.sy[r].slice());
      if ((r + 1) % n === 0) {
        grid.push(doc.grid[r].slice());
        sy.push(doc.sy[r].slice());
      }
    }
    onChangeDoc({ ...doc, rows: grid.length, grid, sy, updatedAt: Date.now() });
  };

  const handleApplyFillPattern = () => {
    if (fillYarn1 === fillYarn2) {
      setStatusMsg(lang === 'hu' ? 'Válassz két különböző fonalat!' : 'Choose two different yarns!');
      return;
    }
    pushUndo(doc);
    const r0 = selection ? selection.r0 : 0;
    const r1 = selection ? selection.r1 : doc.rows - 1;
    const k0 = selection ? selection.k0 : 0;
    const k1 = selection ? selection.k1 : doc.cols - 1;
    const z = Math.max(1, Math.min(12, Math.floor(fillSize) || 2));
    const grid = doc.grid.map((row) => row.slice());
    for (let r = r0; r <= r1; r++) {
      for (let k = k0; k <= k1; k++) {
        if (grid[r][k] < 0 && doc.sy[r][k] === 0) continue;
        grid[r][k] = buildFillPattern(fillType, doc.rows - 1 - r, doc.cols - 1 - k, z) ? fillYarn2 : fillYarn1;
      }
    }
    onChangeDoc({ ...doc, grid, updatedAt: Date.now() });
  };

  const handleSaveStamp = () => {
    if (!selection) return;
    const { r0, r1, k0, k1 } = selection;
    const g: number[][] = [];
    const s: number[][] = [];
    for (let r = r0; r <= r1; r++) {
      g.push(doc.grid[r].slice(k0, k1 + 1));
      s.push(doc.sy[r].slice(k0, k1 + 1));
    }
    const stamp: MotifStamp = {
      id: `st-${Date.now()}`,
      name: stampName.trim() || `${k1 - k0 + 1}×${r1 - r0 + 1} Motif`,
      w: k1 - k0 + 1,
      h: r1 - r0 + 1,
      g,
      s,
    };
    onChangeStamps([stamp, ...stamps].slice(0, 30));
    setStampName('');
  };

  const handleApplyStamp = (stamp: MotifStamp) => {
    pushUndo(doc);
    const grid = doc.grid.map((row) => row.slice());
    const sy = doc.sy.map((row) => row.slice());
    for (let r = 0; r < stamp.h; r++) {
      for (let k = 0; k < stamp.w; k++) {
        const tr = cursor.r + r;
        const tk = cursor.k + k;
        if (okCell(tr, tk)) {
          const yarn = stamp.g[r][k];
          grid[tr][tk] = yarn < doc.pal.length ? yarn : 0;
          sy[tr][tk] = stamp.s[r][k] < allStitches.length ? stamp.s[r][k] : 0;
        }
      }
    }
    setSelection({
      r0: cursor.r,
      k0: cursor.k,
      r1: Math.min(doc.rows - 1, cursor.r + stamp.h - 1),
      k1: Math.min(doc.cols - 1, cursor.k + stamp.w - 1),
    });
    onChangeDoc({ ...doc, grid, sy, updatedAt: Date.now() });
  };

  const enableWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      setStatusMsg(lang === 'hu' ? 'A böngésző nem támogatja a képernyő ébren tartását.' : 'Browser does not support Screen Wake Lock.');
      return;
    }
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      setWakeActive(true);
      sentinel.addEventListener('release', () => {
        wakeLockRef.current = null;
        setWakeActive(false);
      });
    } catch {
      setWakeActive(false);
    }
  }, [lang]);

  const toggleWakeLock = async () => {
    if (wakeLockRef.current) {
      wantWakeRef.current = false;
      await wakeLockRef.current.release();
    } else {
      wantWakeRef.current = true;
      await enableWakeLock();
    }
  };

  useEffect(() => {
    const onVis = () => {
      if (wantWakeRef.current && !wakeLockRef.current && document.visibilityState === 'visible') {
        enableWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      wakeLockRef.current?.release().catch(() => {});
    };
  }, [enableWakeLock]);

  const generateRowInstructions = () => {
    const used = new Set<string>();
    const lines: string[] = [];
    for (let n = 1; n <= doc.rows; n++) {
      const res = rowToInstructions(n, doc.grid, doc.sy, doc.cols, doc.rows, doc.mode, allStitches, soloYarn);
      res.usedCodes.forEach((c) => used.add(c));
      const tag = doc.mode === 'round' ? '' : isWrongSide(n, doc.mode) ? ' (WS)' : ' (RS)';
      lines.push(`${doc.mode === 'round' ? 'Round' : 'Row'} ${n}${tag}: ${res.text}`);
    }
    const header = `${doc.nm} – ${doc.cols} × ${doc.rows} (${formatDimensionsCm(doc.cols, doc.rows, doc.gauge)})\nGauge: ${doc.gauge.s} sts × ${doc.gauge.r} rows / 10 cm\nYarns: ${doc.pal.map((c, i) => `${YARN_LETTERS[i]}=${c}`).join(', ')}\n\n`;
    setInstructionsText(header + lines.join('\n') + '\n');
    setParseErrors([]);
  };

  const applyInstructionsToGrid = () => {
    const { parsed, errors } = parseInstructionsToGrid(
      instructionsText,
      doc.cols,
      doc.rows,
      doc.pal.length,
      doc.mode,
      allStitches
    );
    if (errors.length > 0 || parsed.length === 0) {
      setParseErrors(errors.length ? errors.slice(0, 6) : ['No valid row lines found (start lines with "Row 1:" or "Round 1:").']);
      return;
    }
    setParseErrors([]);
    pushUndo(doc);
    const grid = doc.grid.map((row) => row.slice());
    const sy = doc.sy.map((row) => row.slice());
    parsed.forEach(({ rowNum, cells }) => {
      for (let k = 0; k < doc.cols; k++) {
        grid[doc.rows - rowNum][k] = cells[k][0];
        sy[doc.rows - rowNum][k] = cells[k][1];
      }
    });
    onChangeDoc({ ...doc, grid, sy, updatedAt: Date.now() });
    setStatusMsg(lang === 'hu' ? `${parsed.length} sor frissítve.` : `Updated ${parsed.length} rows from instructions.`);
  };

  const handleSaveKnitFile = () => {
    const payload = {
      app: 'knitworkshop',
      v: 2,
      id: doc.id,
      nm: doc.nm,
      cols: doc.cols,
      rows: doc.rows,
      pal: doc.pal,
      grid: doc.grid,
      sy: doc.sy,
      mode: doc.mode,
      gauge: doc.gauge,
      trk: doc.trk,
      cus: doc.cus,
    };
    triggerBlobDownload(new Blob([JSON.stringify(payload)], { type: 'application/json' }), `${safeFilename(doc.nm)}.knit`);
  };

  const handleOpenImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 8_000_000) {
      setStatusMsg(lang === 'hu' ? 'Csak PNG, JPEG, WebP vagy GIF kép (max 8 MB) tölthető be.' : 'Only PNG, JPEG, WebP or GIF up to 8 MB supported.');
      return;
    }
    if (!(await sniffImageMagic(file))) {
      setStatusMsg(lang === 'hu' ? 'Érvénytelen képfájl.' : 'Invalid image signature.');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.naturalWidth * img.naturalHeight > 5e7) {
        setStatusMsg(lang === 'hu' ? 'Túl nagy felbontású kép.' : 'Image exceeds 50 MP limit.');
        return;
      }
      setPendingImageEl(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setStatusMsg(lang === 'hu' ? 'A kép nem olvasható.' : 'Image could not be read.');
    };
    img.src = url;
  };

  const handleAddCustomStitch = () => {
    const code = csCode.trim().toLowerCase();
    if (
      !/^[a-z][a-z0-9]{0,7}$/.test(code) ||
      !csGlyph.trim() ||
      code === 'empty' ||
      allStitches.some((s) => s.code.toLowerCase() === code) ||
      ['p2tog', 'ssp'].includes(code)
    ) {
      setCsMsg(lang === 'hu' ? 'Adj meg egy egyedi rövid kódot (1–8 betű) és jelet.' : 'Provide a unique 1–8 char code and symbol.');
      return;
    }
    if (doc.cus.length >= 25) {
      setCsMsg(lang === 'hu' ? 'Elérted a 25 egyedi szemjel limitet.' : 'Maximum 25 custom stitches reached.');
      return;
    }
    const sanitized = sanitizeCustomStitch({ n: code, g: csGlyph.trim(), t: csName.trim() || code, u: csUses, m: csMakes });
    if (!sanitized) return;
    pushUndo(doc);
    onChangeDoc({ ...doc, cus: [...doc.cus, sanitized], updatedAt: Date.now() });
    setCsName('');
    setCsCode('');
    setCsGlyph('');
    setCsMsg(lang === 'hu' ? `Hozzáadva: ${sanitized.n}` : `Added custom stitch "${sanitized.n}".`);
  };

  const trackerText = useMemo(() => {
    if (!doc.trk || doc.trk < 1 || doc.trk > doc.rows) return t.tracker.turnedOff;
    const rowLabel =
      doc.mode === 'round'
        ? `${lang === 'hu' ? 'Kör' : 'Round'} ${doc.trk} (${lang === 'hu' ? 'jobbról balra' : 'R→L'})`
        : `${lang === 'hu' ? 'Sor' : 'Row'} ${doc.trk} (${
            isWrongSide(doc.trk, doc.mode) ? (lang === 'hu' ? 'visszája' : 'WS') : lang === 'hu' ? 'színe' : 'RS'
          }, ${isRightToLeft(doc.trk, doc.mode) ? '←' : '→'})`;
    const inst = rowToInstructions(doc.trk, doc.grid, doc.sy, doc.cols, doc.rows, doc.mode, allStitches, soloYarn).text;
    return `${rowLabel}: ${inst}`;
  }, [doc.trk, doc.rows, doc.mode, doc.grid, doc.sy, doc.cols, allStitches, soloYarn, lang, t.tracker.turnedOff]);

  const trackerChunks = useMemo(() => {
    if (!doc.trk || doc.trk < 1 || doc.trk > doc.rows) return [];
    return rowToStepChunks(doc.trk, doc.grid, doc.sy, doc.cols, doc.rows, doc.mode, allStitches);
  }, [doc.trk, doc.rows, doc.grid, doc.sy, doc.cols, doc.mode, allStitches]);

  const activeCursorRow = doc.rows - cursor.r;
  const activeCursorCol = doc.cols - cursor.k;

  const livePatternRows = useMemo(() => {
    const items: Array<{ rowNum: number; tag: string; text: string; isWrong: boolean }> = [];
    for (let n = 1; n <= doc.rows; n++) {
      const res = rowToInstructions(n, doc.grid, doc.sy, doc.cols, doc.rows, doc.mode, allStitches, soloYarn);
      const ws = isWrongSide(n, doc.mode);
      const tag =
        doc.mode === 'round'
          ? lang === 'hu'
            ? 'kör ←'
            : 'rnd ←'
          : ws
          ? lang === 'hu'
            ? 'vissza →'
            : 'WS →'
          : lang === 'hu'
          ? 'színe ←'
          : 'RS ←';
      items.push({ rowNum: n, tag, text: res.text, isWrong: ws });
    }
    return items;
  }, [doc.rows, doc.grid, doc.sy, doc.cols, doc.mode, allStitches, soloYarn, lang]);

  const fullLiveText = useMemo(() => {
    const header = `${doc.nm} – ${doc.cols} × ${doc.rows} (${formatDimensionsCm(doc.cols, doc.rows, doc.gauge)})\nGauge: ${doc.gauge.s} sts × ${doc.gauge.r} rows / 10 cm\nYarns: ${doc.pal.map((c, i) => `${YARN_LETTERS[i]}=${c}`).join(', ')}\n\n`;
    const body = livePatternRows
      .map((item) => {
        const prefix = doc.mode === 'round' ? 'Round' : 'Row';
        const tagEn = doc.mode === 'round' ? '' : item.isWrong ? ' (WS)' : ' (RS)';
        return `${prefix} ${item.rowNum}${tagEn}: ${item.text}`;
      })
      .join('\n');
    return `${header}${body}\n`;
  }, [doc.nm, doc.cols, doc.rows, doc.gauge, doc.pal, doc.mode, livePatternRows]);

  const usedLegendStitches = useMemo(() => {
    const used = new Set<number>([0, curSym]);
    for (let r = 0; r < doc.rows; r++) {
      for (let k = 0; k < doc.cols; k++) {
        used.add(doc.sy[r][k] ?? 0);
      }
    }
    return allStitches.filter((st) => used.has(st.idx));
  }, [doc.sy, doc.rows, doc.cols, allStitches, curSym]);

  const toolButtons: Array<{ id: ToolType; icon: React.ComponentType<{ className?: string }>; label: string; keyHint: string }> = [
    { id: 'p', icon: Pencil, label: t.tools.p, keyHint: 'P' },
    { id: 'e', icon: Eraser, label: t.tools.e, keyHint: 'E' },
    { id: 'n', icon: Ban, label: t.tools.n, keyHint: 'N' },
    { id: 'f', icon: PaintBucket, label: t.tools.f, keyHint: 'F' },
    { id: 'l', icon: Slash, label: t.tools.l, keyHint: 'L' },
    { id: 'r', icon: Square, label: t.tools.r, keyHint: 'R' },
    { id: 'i', icon: Pipette, label: t.tools.i, keyHint: 'I' },
    { id: 's', icon: SquareDashed, label: t.tools.s, keyHint: 'S' },
    { id: 'h', icon: Hand, label: t.tools.h, keyHint: 'H' },
  ];

  const curToolMeta = toolButtons.find((item) => item.id === effectiveTool);
  const activeRowAnalysis = analysis.rows.find((r) => r.rowNum === activeCursorRow);
  const activeLiveRow = livePatternRows.find((r) => r.rowNum === activeCursorRow);

  const cycleReached = cycleCurrent >= cycleEvery;
  const advanceKnitRow = useCallback(() => {
    const nextRow = doc.trk >= doc.rows ? 1 : doc.trk + 1;
    onChangeDoc({ ...doc, trk: nextRow, updatedAt: Date.now() });
    setCycleCurrent((c) => (c >= cycleEvery ? 1 : c + 1));
  }, [doc, onChangeDoc, cycleEvery]);

  const retreatKnitRow = useCallback(() => {
    const prevRow = doc.trk <= 1 ? doc.rows : doc.trk - 1;
    onChangeDoc({ ...doc, trk: prevRow, updatedAt: Date.now() });
    setCycleCurrent((c) => (c <= 1 ? cycleEvery : c - 1));
  }, [doc, onChangeDoc, cycleEvery]);

  const dragDims = useMemo(() => {
    if (effectiveTool === 's' && selection) {
      return { w: selection.k1 - selection.k0 + 1, h: selection.r1 - selection.r0 + 1 };
    }
    if ((effectiveTool === 'l' || effectiveTool === 'r') && shapeStartRef.current && dragShapeEnd) {
      return {
        w: Math.abs(dragShapeEnd[1] - shapeStartRef.current[1]) + 1,
        h: Math.abs(dragShapeEnd[0] - shapeStartRef.current[0]) + 1,
      };
    }
    return null;
  }, [effectiveTool, selection, dragShapeEnd]);

  const commandItems = useMemo(
    () => [
      {
        id: 'zen',
        group: lang === 'hu' ? 'Nézet' : 'View',
        label: zenMode ? (lang === 'hu' ? 'Teljes panelek visszaállítása (Tab)' : 'Exit Zen mode (Tab)') : lang === 'hu' ? 'Zen mód — csak vászon (Tab)' : 'Zen mode — canvas only (Tab)',
        run: () => setZenMode((v) => !v),
      },
      {
        id: 'knit',
        group: lang === 'hu' ? 'Mód' : 'Mode',
        label: knitMode ? t.toolbar.exitKnitMode : t.toolbar.knitMode,
        run: () => {
          const next = !knitMode;
          setActiveDrawer(null);
          setKnitMode(next);
          if (next && doc.trk === 0) onChangeDoc({ ...doc, trk: 1, updatedAt: Date.now() });
        },
      },
      {
        id: 'letters',
        group: lang === 'hu' ? 'Akadálymentesség' : 'Accessibility',
        label: showYarnLetters
          ? lang === 'hu'
            ? 'Fonalbetűk (A/B) elrejtése a rácson'
            : 'Hide yarn letters (A/B) on grid'
          : lang === 'hu'
          ? 'Fonalbetűk (A/B) megjelenítése a rácson'
          : 'Show yarn letters (A/B) on grid',
        run: () => setShowYarnLetters((v) => !v),
      },
      {
        id: 'fit',
        group: lang === 'hu' ? 'Nézet' : 'View',
        label: lang === 'hu' ? 'Rács igazítása a képernyőhöz' : 'Fit chart to viewport',
        run: () => setZoom(computeFitZoom()),
      },
      {
        id: 'view-toggle',
        group: lang === 'hu' ? 'Nézet' : 'View',
        label: view === 'g' ? (lang === 'hu' ? 'Váltás kötött képre' : 'Switch to Knitted view') : lang === 'hu' ? 'Váltás rácsnézetre' : 'Switch to Grid view',
        run: () => setView((v) => (v === 'g' ? 'k' : 'g')),
      },
      {
        id: 'fills',
        group: lang === 'hu' ? 'Eszközök' : 'Tools',
        label: lang === 'hu' ? 'Kitöltés és bélyegzők megnyitása' : 'Open Fills and Stamps',
        run: () => setActiveDrawer('fills'),
      },
      {
        id: 'pattern',
        group: lang === 'hu' ? 'Projekt' : 'Pattern',
        label: lang === 'hu' ? 'Minta, méret, kötéspróba és export' : 'Open Pattern, Size and Export',
        run: () => setActiveDrawer('pattern'),
      },
      {
        id: 'export-png',
        group: 'Export',
        label: t.export.png,
        run: () => {
          setPngPreviewUrl(exportPNGDataUrl(doc, allStitches, lang));
          setActiveDrawer('pattern');
        },
      },
      {
        id: 'export-pdf-c',
        group: 'Export',
        label: t.export.pdfColor,
        run: async () => {
          const blob = await buildPdfBlob(doc, false, false, allStitches, lang);
          triggerBlobDownload(blob, `${safeFilename(doc.nm)}.pdf`);
        },
      },
      {
        id: 'export-pdf-bw',
        group: 'Export',
        label: t.export.pdfBw,
        run: async () => {
          const blob = await buildPdfBlob(doc, true, false, allStitches, lang);
          triggerBlobDownload(blob, `${safeFilename(doc.nm)}-bw.pdf`);
        },
      },
      {
        id: 'copy-txt',
        group: 'Export',
        label: lang === 'hu' ? 'Írott minta másolása vágólapra' : 'Copy written pattern to clipboard',
        run: () => {
          navigator.clipboard?.writeText(fullLiveText).catch(() => {});
          setStatusMsg(lang === 'hu' ? 'Szöveges leírás másolva.' : 'Pattern instructions copied.');
        },
      },
      {
        id: 'img-import',
        group: lang === 'hu' ? 'Import' : 'Import',
        label: t.export.imgImport,
        run: () => imgFileInputRef.current?.click(),
      },
      {
        id: 'new-pat',
        group: lang === 'hu' ? 'Projekt' : 'Pattern',
        label: t.panels.newPattern,
        run: () => onNewBlank(),
      },
      {
        id: 'undo',
        group: lang === 'hu' ? 'Szerkesztés' : 'Edit',
        label: `${t.toolbar.undo} (Ctrl+Z)`,
        run: () => handleUndo(),
      },
      {
        id: 'redo',
        group: lang === 'hu' ? 'Szerkesztés' : 'Edit',
        label: `${t.toolbar.redo} (Ctrl+Y)`,
        run: () => handleRedo(),
      },
      {
        id: 'theme',
        group: lang === 'hu' ? 'Megjelenés' : 'Appearance',
        label: theme === 'dark' ? t.toolbar.lightMode : t.toolbar.darkMode,
        run: () => onToggleTheme(),
      },
    ],
    [
      lang,
      zenMode,
      knitMode,
      t,
      doc,
      onChangeDoc,
      showYarnLetters,
      computeFitZoom,
      view,
      allStitches,
      fullLiveText,
      onNewBlank,
      handleUndo,
      handleRedo,
      theme,
      onToggleTheme,
    ]
  );

  const filteredCommands = useMemo(() => {
    const q = commandQuery.trim().toLowerCase();
    if (!q) return commandItems;
    return commandItems.filter(
      (item) => item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
    );
  }, [commandItems, commandQuery]);

  return (
    <div className="w-full min-h-[calc(100vh-49px)] flex flex-col pb-16 md:pb-0">
      {/* Hidden file inputs kept mounted so triggers work cleanly */}
      <input
        ref={imgFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          handleOpenImageFile(e);
          setActiveDrawer(null);
        }}
      />
      <input
        ref={knitFileInputRef}
        type="file"
        accept=".knit,application/json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const raw = JSON.parse(String(reader.result));
              const imported = raw && raw.cols ? raw : null;
              if (imported) {
                const valid = validDoc(imported, doc.gauge);
                if (!valid) {
                  setStatusMsg(lang === 'hu' ? 'Érvénytelen .knit fájl.' : 'Invalid .knit file.');
                  return;
                }
                pushUndo(doc);
                onChangeDoc({ ...valid, id: doc.id, updatedAt: Date.now() });
                setActiveDrawer(null);
              }
            } catch {
              setStatusMsg(lang === 'hu' ? 'Érvénytelen .knit fájl.' : 'Invalid .knit file.');
            }
          };
          reader.readAsText(file);
        }}
      />

      {/* Unified Figma/Adobe-style Studio Sub-Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-3 sm:px-4 py-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {!knitMode && (
            <>
              <Button
                variant="icon"
                size="icon"
                disabled={undoStack.length === 0}
                onClick={handleUndo}
                title={`${t.toolbar.undo} (Ctrl+Z)`}
                aria-label={t.toolbar.undo}
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="icon"
                size="icon"
                disabled={redoStack.length === 0}
                onClick={handleRedo}
                title={`${t.toolbar.redo} (Ctrl+Y)`}
                aria-label={t.toolbar.redo}
              >
                <Redo2 className="w-4 h-4" />
              </Button>

              <span className="h-4 w-px bg-line mx-1.5" aria-hidden="true" />
            </>
          )}

          <Button
            variant="icon"
            size="icon"
            onClick={() => setZoom((z) => Math.max(0.15, z / 1.25))}
            aria-label={t.toolbar.zoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="min-w-[46px] text-center font-mono text-xs font-medium tabular-nums text-ink-secondary">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="icon"
            size="icon"
            onClick={() => setZoom((z) => Math.min(3, z * 1.25))}
            aria-label={t.toolbar.zoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setZoom(computeFitZoom())}>
            {t.toolbar.fit}
          </Button>

          <span className="h-4 w-px bg-line mx-1.5 hidden sm:inline-block" aria-hidden="true" />

          <SegmentedControl>
            <ToggleButton layout="seg" tone="neutral" pressed={view === 'g'} onClick={() => setView('g')}>
              {t.toolbar.grid}
            </ToggleButton>
            <ToggleButton layout="seg" tone="neutral" pressed={view === 'k'} onClick={() => setView('k')}>
              {t.toolbar.knitted}
            </ToggleButton>
          </SegmentedControl>

          <Button
            variant={showYarnLetters ? 'primary' : 'ghost'}
            size="sm"
            aria-pressed={showYarnLetters}
            onClick={() => setShowYarnLetters((v) => !v)}
            title={lang === 'hu' ? 'Fonalbetűk (A/B/C) mutatása a rácson (színvak-barát)' : 'Show yarn letters (A/B/C) inside cells'}
          >
            <span className="font-mono font-semibold text-xs">A/B</span>
          </Button>

          {!knitMode && (
            <Button
              variant={zenMode ? 'primary' : 'ghost'}
              size="sm"
              aria-pressed={zenMode}
              onClick={() => setZenMode((v) => !v)}
              title={lang === 'hu' ? 'Zen mód — oldalsávok elrejtése (Tab)' : 'Zen mode — hide sidebars (Tab)'}
            >
              {zenMode ? <Minimize2 className="w-3.5 h-3.5 shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 shrink-0" />}
              <span className="hidden xl:inline">{lang === 'hu' ? 'Zen' : 'Zen'}</span>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setCommandQuery('');
              setCommandOpen(true);
            }}
            title={lang === 'hu' ? 'Parancspaletta (Ctrl+K)' : 'Command Palette (Ctrl+K)'}
          >
            <Command className="w-3.5 h-3.5 shrink-0 text-ink-muted" />
            <span className="hidden sm:inline font-mono text-[11px] text-ink-muted">Ctrl+K</span>
          </Button>

          {!knitMode && (
            <>
              <Button
                variant={activeDrawer === 'fills' ? 'primary' : 'secondary'}
                size="sm"
                aria-pressed={activeDrawer === 'fills'}
                onClick={() => setActiveDrawer((d) => (d === 'fills' ? null : 'fills'))}
              >
                <PaintBucket className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === 'hu' ? 'Kitöltés és bélyegzők' : 'Fills and Stamps'}</span>
              </Button>

              <Button
                variant={activeDrawer === 'pattern' ? 'primary' : 'secondary'}
                size="sm"
                aria-pressed={activeDrawer === 'pattern'}
                onClick={() => setActiveDrawer((d) => (d === 'pattern' ? null : 'pattern'))}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === 'hu' ? 'Minta, méret és export' : 'Pattern, Size and Export'}</span>
              </Button>
            </>
          )}

          <Button
            variant={knitMode ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={knitMode}
            onClick={() => {
              const next = !knitMode;
              setActiveDrawer(null);
              setPendingStamp(null);
              setKnitMode(next);
              if (next && doc.trk === 0) {
                onChangeDoc({ ...doc, trk: 1, updatedAt: Date.now() });
              }
            }}
            title={knitMode ? t.toolbar.exitKnitModeHint : t.toolbar.knitModeHint}
            aria-label={knitMode ? t.toolbar.exitKnitModeHint : t.toolbar.knitModeHint}
          >
            {knitMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {knitMode ? t.toolbar.exitKnitMode : t.toolbar.knitMode}
          </Button>

          <span className="h-4 w-px bg-line mx-0.5 hidden sm:inline-block" aria-hidden="true" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            aria-pressed={theme === 'dark'}
            title={theme === 'dark' ? t.toolbar.lightMode : t.toolbar.darkMode}
            aria-label={theme === 'dark' ? t.toolbar.lightMode : t.toolbar.darkMode}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-ink" /> : <Moon className="w-4 h-4 text-ink-muted" />}
            <span className="hidden sm:inline">{theme === 'dark' ? t.toolbar.lightMode : t.toolbar.darkMode}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLang}
            title={t.toolbar.langTitle}
            aria-label={t.toolbar.langTitle}
            className="font-mono text-xs"
          >
            {t.toolbar.langLabel}
          </Button>

          <PWAInstallButton lang={lang} />
        </div>
      </div>

      {/* Hands-Free Knit Mode Bar (Knit Companion benchmark: tap-to-advance + cycle counter + magic marker) */}
      {knitMode && (
        <div className="border-b border-line bg-surface px-4 sm:px-6 py-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-bold text-ink">
              {doc.mode === 'round'
                ? lang === 'hu'
                  ? '← Jobbról balra köss · Körben (munka színe)'
                  : '← Knit right to left · In the round'
                : isRightToLeft(doc.trk || 1, doc.mode)
                ? lang === 'hu'
                  ? '← Jobbról balra köss · Munka színe'
                  : '← Knit right to left · Right side (RS)'
                : lang === 'hu'
                ? '→ Balról jobbra köss · Munka visszája'
                : '→ Knit left to right · Wrong side (WS)'}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={dimCompleted}
                  onChange={(e) => setDimCompleted(e.target.checked)}
                  className="w-5 h-5 accent-neutral-800 dark:accent-neutral-300"
                />
                <span>{t.tracker.dimDone}</span>
              </label>
              <ToggleButton
                layout="inline"
                tone="success"
                pressed={wakeActive}
                onClick={toggleWakeLock}
                className="min-h-[44px] px-3.5 text-sm bg-surface text-ink border-line-strong"
              >
                {wakeActive ? t.tracker.wakeLockOff : t.tracker.wakeLock}
              </ToggleButton>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto] items-center">
            <div className="space-y-1">
              <div className="h-2.5 w-full rounded-kw-sm border border-line-strong bg-surface-subtle overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-200"
                  style={{ width: `${Math.min(100, Math.round(((doc.trk || 0) / Math.max(1, doc.rows)) * 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[13px] font-semibold text-ink-secondary tabular-nums">
                <span>
                  {lang === 'hu' ? 'Haladás:' : 'Progress:'} {doc.trk || 0} / {doc.rows} {lang === 'hu' ? 'sor' : 'rows'}
                </span>
                <span>{Math.min(100, Math.round(((doc.trk || 0) / Math.max(1, doc.rows)) * 100))}%</span>
              </div>
            </div>

            {/* Secondary Shaping / Repeat Cycle Counter */}
            <div
              className={cn(
                'flex flex-wrap items-center gap-2 rounded-kw-md border px-3 py-2 tabular-nums',
                cycleReached ? 'border-warning bg-warning-bg text-ink' : 'border-line-strong bg-surface-subtle text-ink'
              )}
            >
              <span className="text-xs font-bold">
                {lang === 'hu' ? 'Ismétlés:' : 'Cycle:'}
              </span>
              <span className="font-mono text-base font-extrabold">
                {cycleCurrent} / {cycleEvery}
              </span>
              <label className="inline-flex items-center gap-1 text-xs text-ink-secondary">
                <span>{lang === 'hu' ? 'Minden' : 'Every'}</span>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={cycleEvery}
                  onChange={(e) => {
                    const next = Math.max(2, Math.min(50, Number(e.target.value) || 6));
                    setCycleEvery(next);
                    setCycleCurrent((c) => Math.min(c, next));
                  }}
                  aria-label={lang === 'hu' ? 'Ismétlési ciklus hossza' : 'Repeat cycle length'}
                  className="w-12 rounded-kw-sm border border-line-strong bg-surface px-1.5 py-1 text-center font-mono text-xs font-bold text-ink"
                />
              </label>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCycleCurrent((c) => (c >= cycleEvery ? 1 : c + 1))}
                className="min-h-[36px] px-2.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>1</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCycleCurrent(1)}
                aria-label={lang === 'hu' ? 'Ciklus nullázása' : 'Reset cycle'}
                className="min-h-[36px] px-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              {cycleReached && (
                <span className="text-xs font-extrabold text-danger">
                  {lang === 'hu' ? 'Művelet sor!' : 'Action row!'}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="icon"
              onClick={retreatKnitRow}
              className="min-h-[60px] min-w-[68px] rounded-kw-md border-line-strong"
              aria-label={t.tracker.prev}
            >
              <ChevronLeft className="w-7 h-7" />
            </Button>
            <div className="px-4 text-center">
              <div className="font-mono text-4xl font-bold tabular-nums text-ink">
                {doc.trk || '–'}
                <span className="text-base font-semibold text-ink-secondary"> / {doc.rows}</span>
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={advanceKnitRow}
              className="flex-1 min-h-[60px] text-lg"
            >
              <span>{t.tracker.next}</span>
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {trackerChunks.length > 0 && (
            <div className="space-y-2">
              <div className="text-[13px] font-semibold text-ink-secondary">
                {lang === 'hu'
                  ? 'Sor lépései sorrendben (koppints rá, ha megkötötted):'
                  : 'Row steps in order (tap a step to mark it done):'}
              </div>
              <div className="flex flex-wrap gap-2">
                {trackerChunks.map((chunk, idx) => {
                  const done = doneStepIdxs.includes(idx);
                  const bgHex = chunk.yarnIdx >= 0 ? doc.pal[chunk.yarnIdx] ?? DEFAULT_PALETTE[0] : undefined;
                  const fgHex = bgHex ? contrastInk(bgHex) : undefined;
                  const label = lang === 'hu' ? chunk.labelHu : chunk.labelEn;
                  return (
                    <button
                      key={idx}
                      type="button"
                      aria-pressed={done}
                      onClick={() =>
                        setDoneStepIdxs((prev) => (prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]))
                      }
                      className={cn(
                        'inline-flex items-center gap-2.5 min-h-[46px] px-3.5 py-2 rounded-kw-sm border-2 text-base font-bold cursor-pointer transition-opacity',
                        done
                          ? 'border-line bg-surface-subtle text-ink-muted line-through opacity-50'
                          : 'border-line-strong bg-surface text-ink hover:border-accent'
                      )}
                    >
                      {!chunk.isNoStitch && bgHex ? (
                        <span
                          className="w-7 h-7 rounded-kw-sm border border-line-strong flex items-center justify-center font-mono text-sm font-extrabold shrink-0"
                          style={{ backgroundColor: bgHex, color: fgHex }}
                        >
                          {YARN_LETTERS[chunk.yarnIdx]}
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-kw-sm border border-line-strong bg-surface-subtle flex items-center justify-center font-mono text-sm font-bold shrink-0">
                          ×
                        </span>
                      )}
                      <span className="tabular-nums">
                        {chunk.isCableRepeat
                          ? `${chunk.count > 1 ? `${chunk.count}× ` : ''}${label}`
                          : `${chunk.count} ${label}`}
                      </span>
                      {done && <Check className="w-4 h-4 text-success shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tap-anywhere-on-banner to advance row + Magic Marker quick filter */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={advanceKnitRow}
              title={lang === 'hu' ? 'Koppints ide a következő sorra ugráshoz' : 'Tap here to advance to the next row'}
              className="flex-1 min-w-[220px] text-left font-mono text-xs sm:text-sm font-medium text-ink bg-surface-subtle hover:bg-accent-soft rounded-kw-sm px-3.5 py-2.5 border border-line-strong cursor-pointer"
            >
              <span className="font-bold text-accent mr-2">{lang === 'hu' ? 'Koppints →' : 'Tap →'}</span>
              {trackerText}
            </button>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-secondary">
                <Highlighter className="w-3.5 h-3.5 text-accent" />
                {lang === 'hu' ? 'Jelölő:' : 'Marker:'}
              </span>
              {usedLegendStitches
                .filter((st) => st.idx > 0)
                .map((st) => {
                  const active = highlightSym === st.idx;
                  return (
                    <button
                      key={`mk-${st.idx}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setHighlightSym((prev) => (prev === st.idx ? null : st.idx))}
                      className={cn(
                        'min-h-[38px] px-2.5 rounded-kw-sm border font-mono text-xs font-bold cursor-pointer',
                        active
                          ? 'border-line-strong bg-accent text-accent-fg'
                          : 'border-line bg-surface-subtle text-ink hover:border-accent'
                      )}
                    >
                      {st.glyph} {st.code}
                    </button>
                  );
                })}
              {(highlightSym !== null || highlightYarn !== null) && (
                <button
                  type="button"
                  onClick={() => {
                    setHighlightSym(null);
                    setHighlightYarn(null);
                  }}
                  className="min-h-[38px] px-2.5 rounded-kw-sm border border-line text-xs font-bold text-danger hover:bg-danger-bg cursor-pointer"
                >
                  {lang === 'hu' ? 'Törlés' : 'Clear'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN DOCKED STUDIO WORKSPACE (Seamless Left Dock + Drafting Canvas Stage + Right Inspector Dock) */}
      <div
        className={cn(
          'grid flex-1 gap-0 items-stretch',
          knitMode || zenMode
            ? 'grid-cols-1'
            : leftCompact
            ? 'grid-cols-1 lg:grid-cols-[64px_minmax(0,1fr)_328px] xl:grid-cols-[64px_minmax(0,1fr)_344px]'
            : 'grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)_328px] xl:grid-cols-[260px_minmax(0,1fr)_344px]'
        )}
      >
        {/* LEFT STUDIO DOCK: Seamless Tools & Stitch Symbol Palette */}
        {!knitMode && !zenMode && (
          <aside className="order-2 lg:order-1 border-t lg:border-t-0 lg:border-r border-line bg-surface lg:sticky lg:top-12 lg:max-h-[calc(100vh-97px)] lg:overflow-y-auto divide-y divide-line">
            <div className="space-y-2 p-2.5">
              <div className="flex items-center justify-between gap-1 px-0.5">
                {!leftCompact && (
                  <span className="text-xs font-semibold text-ink-secondary">
                    {t.toolbar.leftPanel}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setLeftCompact((v) => !v)}
                  aria-label={leftCompact ? (lang === 'hu' ? 'Bal sáv kinyitása' : 'Expand left rail') : lang === 'hu' ? 'Bal sáv összecsukása' : 'Compact left rail'}
                  title={leftCompact ? (lang === 'hu' ? 'Bal sáv kinyitása' : 'Expand left rail') : lang === 'hu' ? 'Bal sáv összecsukása' : 'Compact left rail'}
                  className="ml-auto min-h-[28px] min-w-[28px] rounded-kw-sm hover:bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
                >
                  {leftCompact ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
              </div>

              <div className={cn('grid gap-1', leftCompact ? 'grid-cols-1' : 'grid-cols-3')}>
                {toolButtons.map(({ id, icon: Icon, label, keyHint }) => (
                  <ToggleButton
                    key={id}
                    layout="tile"
                    tone="accent"
                    pressed={effectiveTool === id}
                    onClick={() => setTool(id)}
                    title={`${label} (${keyHint})`}
                    className={leftCompact ? 'min-h-[38px] py-1.5 px-1' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {!leftCompact && <span className="truncate max-w-full">{label}</span>}
                  </ToggleButton>
                ))}
              </div>

              {!leftCompact && (
                <>
                  <div className="pt-1.5 grid grid-cols-2 gap-1.5">
                    <ToggleButton
                      layout="inline"
                      tone="symmetry"
                      pressed={symX}
                      onClick={() => setSymX((v) => !v)}
                      title={
                        symX
                          ? lang === 'hu'
                            ? 'Vízszintes tükör kikapcsolása'
                            : 'Turn off horizontal mirror'
                          : lang === 'hu'
                          ? 'Vízszintes tükör bekapcsolása'
                          : 'Turn on horizontal mirror'
                      }
                    >
                      <FlipHorizontal2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {symX ? (lang === 'hu' ? 'Tükör ↔ ki' : 'Mirror ↔ off') : lang === 'hu' ? 'Tükör ↔ be' : 'Mirror ↔ on'}
                      </span>
                    </ToggleButton>
                    <ToggleButton
                      layout="inline"
                      tone="symmetry"
                      pressed={symY}
                      onClick={() => setSymY((v) => !v)}
                      title={
                        symY
                          ? lang === 'hu'
                            ? 'Függőleges tükör kikapcsolása'
                            : 'Turn off vertical mirror'
                          : lang === 'hu'
                          ? 'Függőleges tükör bekapcsolása'
                          : 'Turn on vertical mirror'
                      }
                    >
                      <FlipVertical2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {symY ? (lang === 'hu' ? 'Tükör ↕ ki' : 'Mirror ↕ off') : lang === 'hu' ? 'Tükör ↕ be' : 'Mirror ↕ on'}
                      </span>
                    </ToggleButton>
                  </div>

                  <SegmentedControl className="w-full grid grid-cols-3 gap-0.5">
                    {(
                      [
                        ['b', t.panels.both],
                        ['c', t.panels.yarnOnly],
                        ['s', t.panels.stitchOnly],
                      ] as const
                    ).map(([m, label]) => (
                      <ToggleButton
                        key={m}
                        layout="seg"
                        tone="neutral"
                        pressed={brushMode === m}
                        onClick={() => setBrushMode(m)}
                        className="px-1 text-[11px]"
                      >
                        {label}
                      </ToggleButton>
                    ))}
                  </SegmentedControl>
                </>
              )}
            </div>

            {/* Always-Visible 1-Click Stitch Symbol Palette */}
            <div className="space-y-2 p-2.5">
              {!leftCompact && (
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <h2 className="text-xs font-semibold text-ink-secondary">
                    {t.panels.symbols}
                  </h2>
                  <span className="font-mono text-[11px] font-medium text-ink-muted">
                    {allStitches[curSym]?.code ?? 'k'}
                  </span>
                </div>
              )}

              <div className={cn('grid gap-1', leftCompact ? 'grid-cols-1' : 'grid-cols-2')}>
                {allStitches.map((st) => {
                  const active = curSym === st.idx;
                  const shortTitle = (lang === 'hu' ? st.titleHu : st.titleEn).split('(')[0].trim();
                  return (
                    <button
                      key={st.idx}
                      type="button"
                      aria-pressed={active}
                      title={lang === 'hu' ? st.titleHu : st.titleEn}
                      onClick={() => {
                        setCurSym(st.idx);
                        if (['e', 'n', 'h', 'i'].includes(tool)) setTool('p');
                      }}
                      className={cn(
                        'flex items-center gap-2 min-h-[38px] rounded-kw-sm border cursor-pointer',
                        leftCompact ? 'justify-center px-1 py-1' : 'px-1.5 py-1 text-left',
                        active
                          ? 'border-transparent bg-accent text-accent-fg font-semibold shadow-kw-sm'
                          : 'border-transparent bg-surface-subtle/70 text-ink hover:bg-surface-hover'
                      )}
                    >
                      <span
                        className={cn(
                          'w-6 h-6 rounded-[5px] flex items-center justify-center font-semibold text-sm shrink-0',
                          active
                            ? 'bg-white/20 dark:bg-black/20'
                            : 'bg-surface border border-line'
                        )}
                      >
                        {st.glyph}
                      </span>
                      {!leftCompact && (
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block text-xs font-medium truncate">{shortTitle}</span>
                          <span
                            className={cn(
                              'block font-mono text-[10px] truncate',
                              active ? 'text-accent-fg/75' : 'text-ink-muted'
                            )}
                          >
                            {st.code}
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {!leftCompact && (
                <details className="border-t border-line pt-2">
                  <summary className="text-xs font-bold text-accent cursor-pointer min-h-[38px] flex items-center">
                    {t.panels.addCustomStitch}
                  </summary>
                  <div className="mt-2 space-y-2 text-sm">
                    <Input
                      compact
                      type="text"
                      placeholder={lang === 'hu' ? 'Név (pl. Bogyó)' : 'Name (e.g. Bobble)'}
                      maxLength={30}
                      value={csName}
                      onChange={(e) => setCsName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        compact
                        type="text"
                        placeholder={lang === 'hu' ? 'Kód (mb)' : 'Code (mb)'}
                        maxLength={8}
                        value={csCode}
                        onChange={(e) => setCsCode(e.target.value)}
                        className="font-mono"
                      />
                      <Input
                        compact
                        type="text"
                        placeholder={lang === 'hu' ? 'Jel (B)' : 'Symbol (B)'}
                        maxLength={2}
                        value={csGlyph}
                        onChange={(e) => setCsGlyph(e.target.value)}
                        className="text-center font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label>
                        <span className="text-[12px] font-medium text-ink-secondary">{lang === 'hu' ? 'Felhasznál' : 'Uses'}</span>
                        <Input
                          compact
                          type="number"
                          min={0}
                          max={6}
                          value={csUses}
                          onChange={(e) => setCsUses(Number(e.target.value))}
                          className="mt-1 tabular-nums"
                        />
                      </label>
                      <label>
                        <span className="text-[12px] font-medium text-ink-secondary">{lang === 'hu' ? 'Létrehoz' : 'Makes'}</span>
                        <Input
                          compact
                          type="number"
                          min={0}
                          max={3}
                          value={csMakes}
                          onChange={(e) => setCsMakes(Number(e.target.value))}
                          className="mt-1 tabular-nums"
                        />
                      </label>
                    </div>
                    <Button variant="primary" size="sm" onClick={handleAddCustomStitch} className="w-full">
                      {lang === 'hu' ? 'Hozzáadás' : 'Add stitch'}
                    </Button>
                    {csMsg && <p className="text-xs font-medium text-ink-secondary">{csMsg}</p>}
                  </div>
                </details>
              )}
            </div>
          </aside>
        )}

        {/* CENTER STAGE: Docked Yarn Swatches + Drafting Dot-Grid Canvas */}
        <div className="order-1 lg:order-2 flex flex-col min-w-0">
          {/* Yarn Color Palette Strip + Magic Marker Quick Filter */}
          {!knitMode && (
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-1.5">
              <div className="flex items-center gap-2 pr-2.5 border-r border-line">
                <div
                  className="w-7 h-7 rounded-kw-sm border border-line-strong flex items-center justify-center font-mono font-bold text-sm shrink-0"
                  style={{
                    backgroundColor: brushMode === 's' ? 'transparent' : doc.pal[curYarn],
                    color: brushMode === 's' ? 'inherit' : contrastInk(doc.pal[curYarn] ?? DEFAULT_PALETTE[0]),
                  }}
                >
                  {brushMode !== 'c' && curSym > 0 ? allStitches[curSym]?.glyph : ''}
                </div>
                <span className="text-xs font-medium text-ink-secondary whitespace-nowrap">
                  {brushMode !== 's' ? `${lang === 'hu' ? 'Fonal' : 'Yarn'} ${YARN_LETTERS[curYarn]}` : ''}
                  {brushMode === 'b' ? ' · ' : ''}
                  {brushMode !== 'c' ? (allStitches[curSym]?.code ?? 'k') : ''}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {doc.pal.map((hex, idx) => {
                  const st = yarnStats[idx];
                  const active = curYarn === idx;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-kw-sm border px-1.5 py-0.5 transition-colors',
                        active ? 'border-accent-line bg-accent-soft' : 'border-line bg-surface-subtle/60 hover:bg-surface-hover'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCurYarn(idx);
                          if (['e', 'n', 'h', 'i'].includes(tool)) setTool('p');
                        }}
                        aria-pressed={active}
                        title={`${lang === 'hu' ? 'Fonal' : 'Yarn'} ${YARN_LETTERS[idx]} (${st.count} ${lang === 'hu' ? 'szem' : 'sts'})`}
                        className="inline-flex items-center gap-1.5 min-h-[28px] px-1 rounded-kw-sm cursor-pointer"
                      >
                        <span className="font-mono text-xs font-semibold text-ink">{YARN_LETTERS[idx]}</span>
                        <span className="font-mono text-[11px] text-ink-muted tabular-nums">{st.count}</span>
                      </button>
                      <label
                        title={lang === 'hu' ? `${YARN_LETTERS[idx]} fonal színének módosítása` : `Change Yarn ${YARN_LETTERS[idx]} color`}
                        className="relative w-5 h-5 rounded-full border border-black/25 dark:border-white/30 cursor-pointer shrink-0 overflow-hidden"
                        style={{ backgroundColor: hex }}
                      >
                        <input
                          type="color"
                          value={hex}
                          aria-label={`Color of yarn ${YARN_LETTERS[idx]}`}
                          onChange={(e) => {
                            const nextPal = doc.pal.slice();
                            nextPal[idx] = e.target.value;
                            onChangeDoc({ ...doc, pal: nextPal, updatedAt: Date.now() });
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </label>
                      {doc.pal.length > 1 && st.count === 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            pushUndo(doc);
                            const nextPal = doc.pal.filter((_, j) => j !== idx);
                            const nextGrid = doc.grid.map((r) => r.map((v) => (v > idx ? v - 1 : v)));
                            onChangeDoc({ ...doc, pal: nextPal, grid: nextGrid, updatedAt: Date.now() });
                          }}
                          aria-label={`Remove yarn ${YARN_LETTERS[idx]}`}
                          className="w-6 h-6 rounded-kw-sm flex items-center justify-center text-danger hover:bg-danger-bg cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {doc.pal.length < 12 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      pushUndo(doc);
                      const nextCol = DEFAULT_PALETTE.find((c) => !doc.pal.includes(c)) || DEFAULT_PALETTE[0];
                      onChangeDoc({ ...doc, pal: [...doc.pal, nextCol], updatedAt: Date.now() });
                    }}
                  >
                    {t.panels.addYarn}
                  </Button>
                )}
              </div>

              {(highlightSym !== null || highlightYarn !== null) && (
                <button
                  type="button"
                  onClick={() => {
                    setHighlightSym(null);
                    setHighlightYarn(null);
                  }}
                  className="inline-flex items-center gap-1.5 min-h-[30px] px-2.5 rounded-kw-sm border border-accent-line bg-accent-soft text-xs font-medium text-ink cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{lang === 'hu' ? 'Kiemelés kikapcsolása' : 'Clear spotlight'}</span>
                </button>
              )}
            </div>
          )}

          {/* Tier-2 Contextual Bar: Pending Stamp Placement OR Active Grid Selection */}
          {pendingStamp && !knitMode && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-subtle px-3 py-1.5">
              <span className="text-xs font-medium text-ink">
                {lang === 'hu'
                  ? `Bélyegző letétele: „${pendingStamp.name}” (${pendingStamp.w}×${pendingStamp.h}) — vidd az egeret a rács fölé és kattints a helyére`
                  : `Place stamp "${pendingStamp.name}" (${pendingStamp.w}×${pendingStamp.h}) — hover grid and click to place`}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    placeStampAt(pendingStamp, cursor.r, cursor.k);
                    setPendingStamp(null);
                  }}
                >
                  {lang === 'hu' ? 'Letétel a kurzorhoz' : 'Place at cursor'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setPendingStamp(null)}>
                  <X className="w-3.5 h-3.5" />
                  <span>Esc</span>
                </Button>
              </div>
            </div>
          )}

          {selection && !knitMode && !pendingStamp && (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface px-3 py-1.5">
              <span className="text-sm font-bold text-ink mr-2 tabular-nums">
                {selection.k1 - selection.k0 + 1} × {selection.r1 - selection.r0 + 1}
              </span>
              <Button variant="secondary" size="sm" onClick={() => runSelectionOp('c')} title="Copy (Ctrl+C)">
                <Copy className="w-4 h-4" />
                {lang === 'hu' ? 'Másolás' : 'Copy'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => runSelectionOp('x')} title="Cut (Ctrl+X)">
                <Scissors className="w-4 h-4" />
                {lang === 'hu' ? 'Kivágás' : 'Cut'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!clipboard}
                onClick={() => runSelectionOp('p')}
                title="Paste (Ctrl+V)"
              >
                <ClipboardPaste className="w-4 h-4" />
                {lang === 'hu' ? 'Beillesztés' : 'Paste'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => runSelectionOp('h')} aria-label={t.size.flipH}>
                <FlipHorizontal2 className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => runSelectionOp('v')} aria-label="Flip vertical">
                <FlipVertical2 className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => runSelectionOp('f')}>
                <PaintBucket className="w-4 h-4" />
                {lang === 'hu' ? 'Kitöltés' : 'Fill'}
              </Button>
              <Button variant="danger" size="sm" onClick={() => runSelectionOp('d')} aria-label="Clear selection">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelection(null)} className="ml-auto">
                <X className="w-4 h-4" />
                <span>Esc</span>
              </Button>
            </div>
          )}

          {/* Mobile / Tablet Quick-Access Toolbelt (prevents scrolling down past canvas on small viewports) */}
          {!knitMode && (
            <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto border-b border-line bg-surface px-2.5 py-1.5">
              {(['p', 'e', 'h', 's'] as ToolType[]).map((tid) => {
                const meta = toolButtons.find((x) => x.id === tid)!;
                const Icon = meta.icon;
                return (
                  <button
                    key={`mob-${tid}`}
                    type="button"
                    aria-pressed={effectiveTool === tid}
                    onClick={() => setTool(tid)}
                    className={cn(
                      'inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-kw-sm border text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer',
                      effectiveTool === tid ? 'border-transparent bg-accent text-accent-fg' : 'border-line bg-surface-subtle text-ink'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
              <span className="h-4 w-px bg-line shrink-0" aria-hidden="true" />
              {allStitches.slice(0, 6).map((st) => (
                <button
                  key={`mob-st-${st.idx}`}
                  type="button"
                  aria-pressed={curSym === st.idx}
                  onClick={() => {
                    setCurSym(st.idx);
                    if (['e', 'n', 'h', 'i'].includes(tool)) setTool('p');
                  }}
                  className={cn(
                    'min-h-[40px] min-w-[40px] px-2 rounded-kw-sm border font-semibold text-xs whitespace-nowrap shrink-0 cursor-pointer',
                    curSym === st.idx ? 'border-transparent bg-accent text-accent-fg' : 'border-line bg-surface-subtle text-ink'
                  )}
                >
                  {st.glyph} {st.code}
                </button>
              ))}
            </div>
          )}

          {/* MAIN DRAFTING STAGE (White Pattern Paper; Dot-Grid Studio Surround; Black in Dark Mode) */}
          <div
            ref={paperRef}
            onWheel={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                setZoom((z) => {
                  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
                  return Math.max(0.15, Math.min(3, z * factor));
                });
              }
            }}
            className={cn(
              'w-full flex-1 overflow-auto kw-stage-bg p-4 sm:p-8',
              knitMode
                ? 'max-h-[64vh] min-h-[400px]'
                : zenMode
                ? 'h-[calc(100vh-148px)] min-h-[520px]'
                : 'h-[calc(100vh-148px)] min-h-[500px]'
            )}
          >
            <canvas
              ref={canvasRef}
              tabIndex={0}
              role="application"
              aria-label="Knitting chart canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUpOrCancel}
              onPointerCancel={handlePointerUpOrCancel}
              onPointerLeave={() => {
                if (!isDrawingRef.current) setHoverHud(null);
              }}
              onKeyDown={handleCanvasKeyDown}
              onContextMenu={(e) => {
                e.preventDefault();
                if (knitMode) return;
                const cell = getCellFromPointer(e.clientX, e.clientY);
                if (cell) {
                  setSelection({ r0: cell[0], r1: cell[0], k0: cell[1], k1: cell[1] });
                }
              }}
              className={cn(
                'block mx-auto border border-black/15 dark:border-white/20 bg-paper shadow-kw-md focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2',
                knitMode
                  ? 'touch-pan-x touch-pan-y'
                  : effectiveTool === 'h'
                  ? isPanning
                    ? 'cursor-grabbing touch-pan-x touch-pan-y'
                    : 'cursor-grab touch-pan-x touch-pan-y'
                  : 'cursor-crosshair touch-none'
              )}
            />
          </div>
        </div>

        {/* RIGHT STUDIO INSPECTOR: Seamless Docked Panel (Live Text / Checks / Legend) */}
        {!knitMode && !zenMode && (
          <aside className="order-3 border-t lg:border-t-0 lg:border-l border-line bg-surface lg:sticky lg:top-12 lg:max-h-[calc(100vh-97px)] lg:overflow-y-auto">
            <div className="space-y-3 p-3.5">
              {/* Always-Visible 1-Line Health & Active Row Strip */}
              <div className="space-y-1.5 border-b border-line pb-2.5">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setRightTab('checks')}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-extrabold cursor-pointer',
                      analysis.mismatchRows.length > 0
                        ? 'text-danger'
                        : analysis.floatRows.length > 0
                        ? 'text-warning'
                        : 'text-success'
                    )}
                  >
                    {analysis.mismatchRows.length > 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          {lang === 'hu'
                            ? `${analysis.mismatchRows.length} szemszám-hiba`
                            : `${analysis.mismatchRows.length} row count error(s)`}
                        </span>
                      </>
                    ) : analysis.floatRows.length > 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          {lang === 'hu'
                            ? `${analysis.floatRows.length} sorban hosszú szál`
                            : `${analysis.floatRows.length} long float row(s)`}
                        </span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{lang === 'hu' ? 'Minden sor szemszáma rendben' : 'All row stitch counts OK'}</span>
                      </>
                    )}
                  </button>
                  <span className="font-mono text-xs font-semibold text-ink-muted tabular-nums">
                    {doc.cols} × {doc.rows}
                  </span>
                </div>

                {activeLiveRow && (
                  <div className="rounded-kw-sm border border-line bg-surface-subtle/80 px-2.5 py-2 font-mono text-xs text-ink break-words leading-snug">
                    <span className="font-semibold text-ink mr-1.5">
                      {lang === 'hu' ? `${activeLiveRow.rowNum}. sor (${activeLiveRow.tag}):` : `R${activeLiveRow.rowNum} (${activeLiveRow.tag}):`}
                    </span>
                    <span className="text-ink-secondary">{activeLiveRow.text}</span>
                  </div>
                )}
              </div>

              {/* Clean Segmented Tabs: Live Text / Checks / Legend */}
              <SegmentedControl className="w-full grid grid-cols-3 gap-0.5">
                <ToggleButton
                  layout="seg"
                  tone="neutral"
                  pressed={rightTab === 'live'}
                  onClick={() => setRightTab('live')}
                  className="px-1.5 text-xs"
                >
                  {lang === 'hu' ? 'Élő szöveg' : 'Live Text'}
                </ToggleButton>
                <ToggleButton
                  layout="seg"
                  tone="neutral"
                  pressed={rightTab === 'checks'}
                  onClick={() => setRightTab('checks')}
                  className="px-1.5 text-xs"
                >
                  {lang === 'hu' ? 'Ellenőrzés' : 'Checks'}
                  {analysis.mismatchRows.length > 0 ? ` (${analysis.mismatchRows.length})` : ''}
                </ToggleButton>
                <ToggleButton
                  layout="seg"
                  tone="neutral"
                  pressed={rightTab === 'legend'}
                  onClick={() => setRightTab('legend')}
                  className="px-1.5 text-xs"
                >
                  {lang === 'hu' ? 'Jelmagyarázat' : 'Legend'}
                </ToggleButton>
              </SegmentedControl>

              {/* TAB 1: LIVE WRITTEN PATTERN */}
              {rightTab === 'live' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-ink-secondary">
                      {lang === 'hu' ? 'Kattints egy sorra az ugráshoz' : 'Click a row to jump'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard?.writeText(fullLiveText).catch(() => {});
                          setStatusMsg(lang === 'hu' ? 'Szöveges leírás másolva.' : 'Pattern instructions copied.');
                        }}
                        className="min-h-[34px] px-2.5 text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'hu' ? 'Másolás' : 'Copy'}</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          triggerBlobDownload(new Blob([fullLiveText], { type: 'text/plain' }), `${safeFilename(doc.nm)}.txt`)
                        }
                        className="min-h-[34px] px-2.5 text-xs"
                      >
                        TXT
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-390px)] min-h-[220px] overflow-y-auto rounded-kw-sm border border-line bg-surface-subtle/50 divide-y divide-line font-mono text-xs">
                    {livePatternRows.map((item) => {
                      const isActive = item.rowNum === activeCursorRow;
                      const rowMismatch = mismatchSet.has(item.rowNum);
                      return (
                        <button
                          key={item.rowNum}
                          type="button"
                          onClick={() =>
                            setCursor((prev) => ({ ...prev, r: Math.max(0, Math.min(doc.rows - 1, doc.rows - item.rowNum)) }))
                          }
                          className={cn(
                            'w-full text-left px-2.5 py-2 flex items-start gap-2 cursor-pointer',
                            isActive ? 'bg-accent-soft font-bold text-ink' : 'hover:bg-surface-hover text-ink-secondary',
                            rowMismatch && 'text-danger'
                          )}
                        >
                          <span className="shrink-0 font-bold tabular-nums w-12">
                            {lang === 'hu' ? `${item.rowNum}.` : `R${item.rowNum}`}
                          </span>
                          <span className="break-words flex-1">{item.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-line pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!showTextImport && !instructionsText.trim()) generateRowInstructions();
                        setShowTextImport((v) => !v);
                      }}
                      className="text-xs font-bold text-accent hover:underline cursor-pointer"
                    >
                      {showTextImport
                        ? lang === 'hu'
                          ? 'Szövegbeviteli mező elrejtése'
                          : 'Hide text-to-grid editor'
                        : lang === 'hu'
                        ? 'Szöveg szerkesztése → rácsra alkalmazás'
                        : 'Edit text → apply to grid'}
                    </button>

                    {showTextImport && (
                      <div className="space-y-2">
                        <Textarea
                          rows={4}
                          value={instructionsText}
                          onChange={(e) => setInstructionsText(e.target.value)}
                          placeholder="Row 1: k5, p2, k2tog..."
                          className="p-2 font-mono text-xs"
                        />
                        {parseErrors.length > 0 && (
                          <ul className="text-xs font-medium text-danger space-y-0.5">
                            {parseErrors.map((err, idx) => (
                              <li key={idx}>• {err}</li>
                            ))}
                          </ul>
                        )}
                        <div className="grid grid-cols-2 gap-1.5">
                          <Button variant="secondary" size="sm" onClick={generateRowInstructions}>
                            {lang === 'hu' ? 'Frissítés rácsról' : 'Load from grid'}
                          </Button>
                          <Button variant="primary" size="sm" onClick={applyInstructionsToGrid}>
                            {t.export.fromTxt}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: STITCH & FLOAT CHECKER (Plain Human Language) */}
              {rightTab === 'checks' && (
                <div className="space-y-2.5">
                  {(analysis.mismatchRows.length > 0 || analysis.floatRows.length > 0 || analysis.multiColorRows.length > 0) && (
                    <Alert tone="warning" className="px-3 py-2.5 text-xs space-y-1">
                      {analysis.mismatchRows.length > 0 && (
                        <div className="font-bold text-danger">
                          {t.checks.mismatch} {analysis.mismatchRows.join(', ')}
                        </div>
                      )}
                      {analysis.floatRows.length > 0 && (
                        <div className="text-ink">
                          {t.checks.floatWarn} {analysis.floatRows.slice(0, 8).join(', ')}
                          {analysis.floatRows.length > 8 ? '…' : ''}
                        </div>
                      )}
                      {analysis.multiColorRows.length > 0 && (
                        <div className="text-ink">
                          {t.checks.colorWarn} {analysis.multiColorRows.slice(0, 8).join(', ')}
                          {analysis.multiColorRows.length > 8 ? '…' : ''}
                        </div>
                      )}
                    </Alert>
                  )}

                  <div className="flex items-center justify-between gap-2 text-xs bg-surface-subtle rounded-kw-sm px-2.5 py-2 border border-line tabular-nums">
                    <div className="font-semibold text-ink">
                      {activeRowAnalysis ? (
                        activeRowAnalysis.status === 'mismatch' ? (
                          <span className="text-danger">{activeRowAnalysis.message}</span>
                        ) : (
                          <span>
                            {lang === 'hu'
                              ? `${activeCursorRow}. sor: ${activeRowAnalysis.uses} szemből ${activeRowAnalysis.made} lesz`
                              : `Row ${activeCursorRow}: uses ${activeRowAnalysis.uses}, makes ${activeRowAnalysis.made}`}
                          </span>
                        )
                      ) : (
                        <span>
                          {doc.cols} → {doc.cols}
                        </span>
                      )}
                    </div>
                    <label className="inline-flex items-center gap-1.5 text-ink-secondary font-semibold shrink-0">
                      <span>{lang === 'hu' ? 'Max szál' : 'Max float'}</span>
                      <Input
                        compact
                        type="number"
                        min={3}
                        max={20}
                        value={floatLimit}
                        onChange={(e) => setFloatLimit(Math.max(3, Math.min(20, Number(e.target.value) || 5)))}
                        className="w-14 min-h-[32px] py-1 px-1.5 text-right text-xs tabular-nums"
                      />
                    </label>
                  </div>

                  <TableWrap className="max-h-[calc(100vh-400px)] min-h-[200px] overflow-y-auto">
                    <table className="w-full text-xs tabular-nums">
                      <thead className="bg-surface-subtle text-ink-secondary sticky top-0">
                        <tr>
                          <th className="px-2 py-1.5 text-left">{lang === 'hu' ? 'Sor' : 'Row'}</th>
                          <th className="px-2 py-1.5 text-right">{lang === 'hu' ? 'Indul' : 'Uses'}</th>
                          <th className="px-2 py-1.5 text-right">{lang === 'hu' ? 'Lesz' : 'Makes'}</th>
                          <th className="px-2 py-1.5 text-right">{lang === 'hu' ? 'Max szál' : 'Float'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {analysis.rows.map((r) => {
                          const isActive = r.rowNum === activeCursorRow;
                          return (
                            <tr
                              key={r.rowNum}
                              onClick={() => {
                                setCursor((prev) => ({ ...prev, r: Math.max(0, Math.min(doc.rows - 1, doc.rows - r.rowNum)) }));
                              }}
                              className={cn(
                                'cursor-pointer',
                                r.status === 'mismatch'
                                  ? 'bg-danger-bg text-danger font-bold'
                                  : r.maxFloat > floatLimit
                                  ? 'bg-warning-bg text-warning font-semibold'
                                  : isActive
                                  ? 'bg-accent-soft text-ink font-bold'
                                  : 'hover:bg-surface-hover'
                              )}
                            >
                              <td className="px-2 py-1.5">
                                {isActive ? '▸ ' : ''}
                                {r.rowNum}
                              </td>
                              <td className="px-2 py-1.5 text-right">{r.uses}</td>
                              <td className="px-2 py-1.5 text-right">{r.made}</td>
                              <td className="px-2 py-1.5 text-right">{r.maxFloat || '–'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </TableWrap>
                </div>
              )}

              {/* TAB 3: LEGEND / KEY + MAGIC MARKER HIGHLIGHT */}
              {rightTab === 'legend' && (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-0.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-ink-secondary">
                      <span>{lang === 'hu' ? 'Fonalak (kattints a kiemeléshez)' : 'Yarns (click to spotlight)'}</span>
                      <span className="font-mono tabular-nums">{formatDimensionsCm(doc.cols, doc.rows, doc.gauge)}</span>
                    </div>
                    <div className="space-y-1.5">
                      {doc.pal.map((hex, idx) => {
                        const st = yarnStats[idx];
                        const highlighted = highlightYarn === idx;
                        return (
                          <button
                            key={`leg-y-${idx}`}
                            type="button"
                            aria-pressed={highlighted}
                            onClick={() => setHighlightYarn((prev) => (prev === idx ? null : idx))}
                            className={cn(
                              'w-full flex items-center justify-between gap-2 rounded-kw-sm border px-2.5 py-2 text-xs cursor-pointer tabular-nums transition-colors',
                              highlighted
                                ? 'border-accent-line bg-accent-soft font-semibold text-ink'
                                : 'border-transparent bg-surface-subtle/70 text-ink hover:bg-surface-hover'
                            )}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded-full border border-black/20 dark:border-white/25 flex items-center justify-center font-mono text-[11px] font-bold"
                                style={{ backgroundColor: hex, color: contrastInk(hex) }}
                              >
                                {YARN_LETTERS[idx]}
                              </span>
                              <span className="font-medium">
                                {lang === 'hu' ? `Fonal ${YARN_LETTERS[idx]}` : `Yarn ${YARN_LETTERS[idx]}`}
                              </span>
                            </span>
                            <span className="font-mono text-[11px] text-ink-muted">
                              {st.pct}% · ~{st.meters}m · ~{st.grams}g
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-line pt-2.5 space-y-1.5">
                    <div className="text-xs font-semibold text-ink-secondary">
                      {lang === 'hu' ? 'Használt szemjelek (kattints a kiemeléshez)' : 'Used stitches (click to spotlight)'}
                    </div>
                    <div className="space-y-1">
                      {usedLegendStitches.map((st) => {
                        const highlighted = highlightSym === st.idx;
                        return (
                          <button
                            key={`leg-s-${st.idx}`}
                            type="button"
                            aria-pressed={highlighted}
                            onClick={() => setHighlightSym((prev) => (prev === st.idx ? null : st.idx))}
                            className={cn(
                              'w-full flex items-center gap-2 rounded-kw-sm border px-2.5 py-1.5 text-left text-xs cursor-pointer transition-colors',
                              highlighted
                                ? 'border-accent-line bg-accent-soft font-semibold text-ink'
                                : 'border-transparent bg-surface-subtle/70 text-ink hover:bg-surface-hover'
                            )}
                          >
                            <span className="w-6 h-6 rounded-[5px] border border-line bg-surface flex items-center justify-center font-semibold text-sm shrink-0">
                              {st.glyph}
                            </span>
                            <span className="font-mono font-semibold shrink-0">{st.code}</span>
                            <span className="text-ink-muted truncate">
                              {(lang === 'hu' ? st.titleHu : st.titleEn).split('(')[0].trim()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Cursor-Attached Studio Ghost HUD (Row, Stitch, Drag Size / Stamp Hint) */}
      {hoverHud && !knitMode && !activeDrawer && !commandOpen && (
        <div
          aria-hidden="true"
          className="fixed pointer-events-none z-40 rounded-kw-sm border border-line-strong bg-surface/95 backdrop-blur-md shadow-kw-md px-2.5 py-1 font-mono text-[11px] font-medium text-ink tabular-nums"
          style={{
            left: Math.min(typeof window !== 'undefined' ? window.innerWidth - 190 : 900, hoverHud.clientX + 16),
            top: Math.min(typeof window !== 'undefined' ? window.innerHeight - 56 : 700, hoverHud.clientY + 18),
          }}
        >
          <div>
            {lang === 'hu' ? 'Sor' : 'Row'} {doc.rows - hoverHud.r} · {lang === 'hu' ? 'Szem' : 'St'} {doc.cols - hoverHud.k}
            {dragDims ? ` · ${dragDims.w}×${dragDims.h}` : ''}
          </div>
          {pendingStamp ? (
            <div className="text-[11px] text-accent">
              {pendingStamp.name} ({pendingStamp.w}×{pendingStamp.h})
            </div>
          ) : effectiveTool === 'i' ? (
            <div className="text-[11px] text-accent">
              {doc.grid[hoverHud.r]?.[hoverHud.k] >= 0 ? `${YARN_LETTERS[doc.grid[hoverHud.r][hoverHud.k]]} · ` : ''}
              {allStitches[doc.sy[hoverHud.r]?.[hoverHud.k] ?? 0]?.code ?? 'k'}
            </div>
          ) : null}
        </div>
      )}

      {/* Searchable Command Palette (Ctrl/Cmd + K) */}
      <Modal open={commandOpen} onClose={() => setCommandOpen(false)} maxWidthClass="max-w-lg max-h-[80vh]">
        <div className="border-b border-line px-4 py-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-ink-muted shrink-0" />
          <input
            autoFocus
            type="text"
            value={commandQuery}
            onChange={(e) => setCommandQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredCommands[0]) {
                e.preventDefault();
                filteredCommands[0].run();
                setCommandOpen(false);
              }
            }}
            placeholder={lang === 'hu' ? 'Parancs vagy eszköz keresése...' : 'Type a command or action...'}
            className="w-full bg-transparent text-sm font-medium text-ink focus:outline-none"
          />
          <Button variant="secondary" size="sm" onClick={() => setCommandOpen(false)}>
            Esc
          </Button>
        </div>
        <div className="overflow-y-auto divide-y divide-line p-2 max-h-96">
          {filteredCommands.length === 0 ? (
            <p className="p-4 text-sm text-ink-muted text-center">
              {lang === 'hu' ? 'Nincs találat.' : 'No matching command.'}
            </p>
          ) : (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => {
                  cmd.run();
                  setCommandOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-kw-sm text-left text-sm hover:bg-accent-soft cursor-pointer"
              >
                <span className="font-semibold text-ink">{cmd.label}</span>
                <span className="font-mono text-xs text-ink-muted shrink-0">{cmd.group}</span>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Transient Floating Status Toast (only rendered when statusMsg is non-empty) */}
      {statusMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-18 md:bottom-5 right-5 z-[var(--kw-z-toast)] max-w-sm rounded-kw-md border border-line-strong bg-surface shadow-kw-lg px-4 py-2.5 flex items-center gap-3 text-[13px] font-medium text-ink"
        >
          <span className="flex-1 tabular-nums">{statusMsg}</span>
          <button
            type="button"
            onClick={() => setStatusMsg('')}
            aria-label={lang === 'hu' ? 'Értesítés bezárása' : 'Dismiss notification'}
            className="w-7 h-7 rounded-kw-sm flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-hover cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SECONDARY OVERLAY DRAWERS (Fills/Stamps & Pattern Setup/Resize/Export) */}
      {activeDrawer !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            activeDrawer === 'fills'
              ? lang === 'hu'
                ? 'Kitöltés és bélyegzők'
                : 'Fills and Stamps'
              : lang === 'hu'
              ? 'Minta, méret és export'
              : 'Pattern, Size and Export'
          }
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveDrawer(null);
          }}
          className="fixed inset-0 z-[var(--kw-z-modal)] flex bg-black/50 backdrop-blur-xs"
        >
          {activeDrawer === 'fills' && (
            <div className="ml-auto w-full max-w-md h-full bg-surface border-l border-line shadow-kw-lg flex flex-col">
              <div className="sticky top-0 z-10 bg-surface border-b border-line px-5 py-3.5 flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-semibold text-ink">
                  {lang === 'hu' ? 'Kitöltés és bélyegzők' : 'Fills and Stamps'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveDrawer(null)}>
                  <X className="w-4 h-4" />
                  <span>{lang === 'hu' ? 'Bezárás' : 'Close'}</span>
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <CollapsiblePanel title={t.panels.fills} defaultOpen>
                  <div className="mt-3 space-y-2.5 text-sm">
                    <Select compact value={fillType} onChange={(e) => setFillType(e.target.value as typeof fillType)}>
                      <option value="hound">{lang === 'hu' ? 'Tyúklábminta' : 'Houndstooth'}</option>
                      <option value="hstripe">{lang === 'hu' ? 'Vízszintes csíkok' : 'Horizontal stripes'}</option>
                      <option value="vstripe">{lang === 'hu' ? 'Függőleges csíkok' : 'Vertical stripes'}</option>
                      <option value="check">{lang === 'hu' ? 'Sakktábla' : 'Checkerboard'}</option>
                      <option value="zig">{lang === 'hu' ? 'Cikkcakk' : 'Zigzag'}</option>
                      <option value="diam">{lang === 'hu' ? 'Rombusz' : 'Diamond'}</option>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                      <Select compact value={fillYarn1} onChange={(e) => setFillYarn1(Number(e.target.value))}>
                        {doc.pal.map((_, i) => (
                          <option key={i} value={i}>
                            {lang === 'hu' ? 'Fonal' : 'Yarn'} {YARN_LETTERS[i]}
                          </option>
                        ))}
                      </Select>
                      <Select compact value={fillYarn2} onChange={(e) => setFillYarn2(Number(e.target.value))}>
                        {doc.pal.map((_, i) => (
                          <option key={i} value={i}>
                            {lang === 'hu' ? 'Fonal' : 'Yarn'} {YARN_LETTERS[i]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    {fillType !== 'hound' && (
                      <label className="block">
                        <span className="text-[13px] font-medium text-ink-secondary">
                          {lang === 'hu' ? 'Méret (cella)' : 'Size (cells)'}
                        </span>
                        <Input
                          compact
                          type="number"
                          min={1}
                          max={12}
                          value={fillSize}
                          onChange={(e) => setFillSize(Number(e.target.value))}
                          className="mt-1 tabular-nums"
                        />
                      </label>
                    )}
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleApplyFillPattern();
                        setActiveDrawer(null);
                      }}
                      className="w-full"
                    >
                      {t.panels.applyFill}
                    </Button>
                  </div>
                </CollapsiblePanel>

                <CollapsiblePanel title={`${t.panels.stamps} (${stamps.length})`} defaultOpen>
                  <div className="mt-3 space-y-2.5 text-sm">
                    {selection ? (
                      <div className="space-y-1.5">
                        <Input
                          compact
                          type="text"
                          placeholder={lang === 'hu' ? 'Motívum neve...' : 'Motif name...'}
                          value={stampName}
                          onChange={(e) => setStampName(e.target.value)}
                        />
                        <Button variant="primary" onClick={handleSaveStamp} className="w-full">
                          {t.panels.saveStamp}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-[13px] text-ink-secondary leading-relaxed">
                        {lang === 'hu'
                          ? 'Jelölj ki egy területet a rácson a bélyegzőként való mentéshez.'
                          : 'Select a region on the grid to save it as a reusable motif stamp.'}
                      </p>
                    )}

                    {stamps.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {stamps.map((st) => (
                          <div key={st.id} className="flex items-center gap-1.5">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setPendingStamp(st);
                                setActiveDrawer(null);
                              }}
                              className="flex-1 justify-start text-left truncate px-2.5"
                            >
                              <span className="font-medium text-ink truncate">{st.name}</span>{' '}
                              <span className="text-ink-muted tabular-nums">
                                ({st.w}×{st.h})
                              </span>
                            </Button>
                            <Button
                              variant="icon"
                              size="icon"
                              onClick={() => onChangeStamps(stamps.filter((x) => x.id !== st.id))}
                              aria-label="Delete stamp"
                              className="text-danger"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsiblePanel>
              </div>
            </div>
          )}

          {activeDrawer === 'pattern' && (
            <div className="ml-auto w-full max-w-md h-full bg-surface border-l border-line shadow-kw-lg flex flex-col">
              <div className="sticky top-0 z-10 bg-surface border-b border-line px-5 py-3.5 flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-semibold text-ink">
                  {lang === 'hu' ? 'Minta, méret és export' : 'Pattern, Size and Export'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveDrawer(null)}>
                  <X className="w-4 h-4" />
                  <span>{lang === 'hu' ? 'Bezárás' : 'Close'}</span>
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <CollapsiblePanel title={t.panels.pattern} defaultOpen>
                  <div className="mt-3 space-y-3 text-sm">
                    <label className="block">
                      <FieldLabel className="mb-1">{t.panels.patternName}</FieldLabel>
                      <Input
                        compact
                        type="text"
                        maxLength={80}
                        value={doc.nm}
                        onChange={(e) => onChangeDoc({ ...doc, nm: e.target.value, updatedAt: Date.now() })}
                        className="text-sm py-2"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <FieldLabel className="mb-1">{t.panels.stitches10}</FieldLabel>
                        <Input
                          compact
                          type="number"
                          min={5}
                          max={60}
                          value={doc.gauge.s}
                          onChange={(e) =>
                            onChangeDoc({
                              ...doc,
                              gauge: { ...doc.gauge, s: Math.min(60, Math.max(5, Number(e.target.value) || 22)) },
                              updatedAt: Date.now(),
                            })
                          }
                          className="tabular-nums"
                        />
                      </label>
                      <label className="block">
                        <FieldLabel className="mb-1">{t.panels.rows10}</FieldLabel>
                        <Input
                          compact
                          type="number"
                          min={5}
                          max={80}
                          value={doc.gauge.r}
                          onChange={(e) =>
                            onChangeDoc({
                              ...doc,
                              gauge: { ...doc.gauge, r: Math.min(80, Math.max(5, Number(e.target.value) || 30)) },
                              updatedAt: Date.now(),
                            })
                          }
                          className="tabular-nums"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <FieldLabel className="mb-1">{t.panels.method}</FieldLabel>
                      <Select
                        compact
                        value={doc.mode}
                        onChange={(e) => {
                          pushUndo(doc);
                          onChangeDoc({ ...doc, mode: e.target.value === 'round' ? 'round' : 'flat', updatedAt: Date.now() });
                        }}
                        className="py-2"
                      >
                        <option value="flat">{t.panels.flat}</option>
                        <option value="round">{t.panels.round}</option>
                      </Select>
                    </label>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button variant="secondary" onClick={handleSaveKnitFile}>
                        {t.panels.saveBackup}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setActiveDrawer(null);
                          onNewBlank();
                        }}
                      >
                        {t.panels.newPattern}
                      </Button>
                    </div>
                  </div>
                </CollapsiblePanel>

                <CollapsiblePanel title={t.panels.preview} defaultOpen>
                  <div className="mt-3 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-ink-secondary font-medium">{lang === 'hu' ? 'Ismétlődés' : 'Repeat'}</span>
                      <Select compact value={repCount} onChange={(e) => setRepCount(Number(e.target.value))} className="w-24">
                        <option value={1}>1×</option>
                        <option value={2}>2×</option>
                        <option value={3}>3×</option>
                      </Select>
                    </div>
                    <div className="overflow-auto rounded-kw-sm border border-line bg-knit-bed p-1 flex justify-center">
                      <canvas ref={previewCanvasRef} className="max-w-full rounded" />
                    </div>
                    <p className="text-ink-secondary font-medium tabular-nums">
                      {doc.cols} × {doc.rows} = {formatDimensionsCm(doc.cols, doc.rows, doc.gauge)}
                    </p>
                  </div>
                </CollapsiblePanel>

                <CollapsiblePanel title={t.panels.size}>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <label>
                        <span className="text-[13px] font-medium text-ink-secondary">{t.size.cols}</span>
                        <Input
                          compact
                          type="number"
                          min={2}
                          max={300}
                          value={sizeCols}
                          onChange={(e) => setSizeCols(Number(e.target.value))}
                          className="mt-1 tabular-nums"
                        />
                      </label>
                      <label>
                        <span className="text-[13px] font-medium text-ink-secondary">{t.size.rows}</span>
                        <Input
                          compact
                          type="number"
                          min={2}
                          max={400}
                          value={sizeRows}
                          onChange={(e) => setSizeRows(Number(e.target.value))}
                          className="mt-1 tabular-nums"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button variant="primary" onClick={handleResize}>
                        {t.size.resize}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          pushUndo(doc);
                          onChangeDoc({
                            ...doc,
                            grid: doc.grid.map((r) => r.slice().reverse()),
                            sy: doc.sy.map((r) => r.slice().reverse().map(swapHorizontalStitch)),
                            updatedAt: Date.now(),
                          });
                        }}
                      >
                        {t.size.flipH}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 border-t border-line pt-2.5">
                      <Button variant="secondary" onClick={handleInsertRow}>
                        <Rows className="w-3.5 h-3.5" />
                        {t.size.insertRow}
                      </Button>
                      <Button variant="secondary" onClick={handleDeleteRow}>
                        <Minus className="w-3.5 h-3.5" />
                        {t.size.delRow}
                      </Button>
                      <Button variant="secondary" onClick={handleInsertCol}>
                        <Columns className="w-3.5 h-3.5" />
                        {t.size.insertCol}
                      </Button>
                      <Button variant="secondary" onClick={handleDeleteCol}>
                        <Minus className="w-3.5 h-3.5" />
                        {t.size.delCol}
                      </Button>
                    </div>

                    <div className="border-t border-line pt-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink-muted">{t.size.shift}</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shiftWrap}
                            onChange={(e) => setShiftWrap(e.target.checked)}
                            className="w-5 h-5 accent-neutral-800 dark:accent-neutral-300"
                          />
                          <span>{t.size.wrap}</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        <Button variant="icon" size="icon" onClick={() => handleShift(0, -1)} aria-label="Shift left" className="w-full">
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="icon" size="icon" onClick={() => handleShift(-1, 0)} aria-label="Shift up" className="w-full">
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button variant="icon" size="icon" onClick={() => handleShift(1, 0)} aria-label="Shift down" className="w-full">
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button variant="icon" size="icon" onClick={() => handleShift(0, 1)} aria-label="Shift right" className="w-full">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-line pt-2.5 flex items-end gap-2">
                      <label className="flex-1">
                        <span className="text-[13px] font-medium text-ink-secondary">{t.size.stretchLabel}</span>
                        <Input
                          compact
                          type="number"
                          min={2}
                          max={20}
                          value={stretchEvery}
                          onChange={(e) => setStretchEvery(Number(e.target.value))}
                          className="mt-1 tabular-nums"
                        />
                      </label>
                      <Button variant="secondary" onClick={handleStretchRows}>
                        {t.size.stretchBtn}
                      </Button>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => {
                        pushUndo(doc);
                        onChangeDoc({
                          ...doc,
                          grid: Array.from({ length: doc.rows }, () => Array(doc.cols).fill(0)),
                          sy: Array.from({ length: doc.rows }, () => Array(doc.cols).fill(0)),
                          updatedAt: Date.now(),
                        });
                      }}
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t.size.reset}
                    </Button>
                  </div>
                </CollapsiblePanel>

                <CollapsiblePanel title={t.panels.export} defaultOpen>
                  <div className="mt-3 space-y-2.5 text-sm">
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button variant="primary" onClick={() => setPngPreviewUrl(exportPNGDataUrl(doc, allStitches, lang))}>
                        {t.export.png}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const svg = buildSVGChart(doc, false, allStitches, lang);
                          triggerBlobDownload(new Blob([svg], { type: 'image/svg+xml' }), `${safeFilename(doc.nm)}.svg`);
                        }}
                      >
                        {t.export.svg}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          const blob = await buildPdfBlob(doc, false, false, allStitches, lang);
                          triggerBlobDownload(blob, `${safeFilename(doc.nm)}.pdf`);
                        }}
                      >
                        {t.export.pdfColor}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          const blob = await buildPdfBlob(doc, true, false, allStitches, lang);
                          triggerBlobDownload(blob, `${safeFilename(doc.nm)}-bw.pdf`);
                        }}
                      >
                        {t.export.pdfBw}
                      </Button>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={async () => {
                        const blob = await buildPdfBlob(doc, false, true, allStitches, lang);
                        triggerBlobDownload(blob, `${safeFilename(doc.nm)}-tiled.pdf`);
                      }}
                      className="w-full"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      {t.export.pdfTiled}
                    </Button>

                    {pngPreviewUrl && (
                      <div className="space-y-1.5 pt-1">
                        <img src={pngPreviewUrl} alt="Chart PNG export" className="w-full rounded-kw-sm border border-line-strong" />
                        <a
                          href={pngPreviewUrl}
                          download={`${safeFilename(doc.nm)}.png`}
                          className="inline-flex items-center justify-center gap-1.5 min-h-10 px-3.5 py-2 rounded-kw-sm border border-line-strong bg-accent hover:bg-accent-hover text-accent-fg font-display font-bold text-xs w-full"
                        >
                          {lang === 'hu' ? 'PNG letöltése' : 'Download PNG'}
                        </a>
                      </div>
                    )}

                    <div className="border-t border-line pt-2.5 grid grid-cols-2 gap-1.5">
                      <Button variant="secondary" onClick={() => imgFileInputRef.current?.click()}>
                        <ImageIcon className="w-3.5 h-3.5" />
                        {t.export.imgImport}
                      </Button>
                      <Button variant="secondary" onClick={() => knitFileInputRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5" />
                        {t.export.openKnit}
                      </Button>
                    </div>
                  </div>
                </CollapsiblePanel>
              </div>
            </div>
          )}
        </div>
      )}

      <ImageImportModal
        imageElement={pendingImageEl}
        onClose={() => setPendingImageEl(null)}
        cols={doc.cols}
        rows={doc.rows}
        gauge={doc.gauge}
        currentPalette={doc.pal}
        onApply={(newGrid, newPal, replacedPal) => {
          pushUndo(doc);
          onChangeDoc({
            ...doc,
            pal: replacedPal ? newPal : doc.pal,
            grid: newGrid,
            sy: Array.from({ length: doc.rows }, () => Array(doc.cols).fill(0)),
            updatedAt: Date.now(),
          });
        }}
        lang={lang}
      />
    </div>
  );
};

/* --------------------------------------------------------------------------
   Pattern Library Modal
   -------------------------------------------------------------------------- */

export const PatternLibraryModal: React.FC<{
  open: boolean;
  onClose: () => void;
  patterns: KnitDocument[];
  activeId: string;
  onSelectPattern: (id: string) => void;
  onNewPattern: () => void;
  onDuplicatePattern: (id: string) => void;
  onDeletePattern: (id: string) => void;
  onImportPattern: (doc: KnitDocument) => void;
  lang: Lang;
}> = ({
  open,
  onClose,
  patterns,
  activeId,
  onSelectPattern,
  onNewPattern,
  onDuplicatePattern,
  onDeletePattern,
  onImportPattern,
  lang,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5_000_000) {
      setImportError(lang === 'hu' ? 'A fájl túl nagy (maximum 5 MB).' : 'File too large (5 MB max).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        if (!(raw && typeof raw.app === 'string' && (raw.v === 1 || raw.v === 2))) {
          throw new Error('Invalid header');
        }
        const doc = validDoc(raw);
        if (!doc) throw new Error('Invalid schema');
        doc.id = crypto.randomUUID ? crypto.randomUUID() : `pat-${Date.now()}`;
        setImportError(null);
        onImportPattern(doc);
        onClose();
      } catch {
        setImportError(lang === 'hu' ? 'Érvénytelen vagy nem támogatott .knit fájl.' : 'Invalid or unsupported .knit file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportOne = (doc: KnitDocument) => {
    const payload = {
      app: 'knitworkshop',
      v: 2,
      id: doc.id,
      nm: doc.nm,
      cols: doc.cols,
      rows: doc.rows,
      pal: doc.pal,
      grid: doc.grid,
      sy: doc.sy,
      mode: doc.mode,
      gauge: doc.gauge,
      trk: doc.trk,
      cus: doc.cus,
    };
    triggerBlobDownload(new Blob([JSON.stringify(payload)], { type: 'application/json' }), `${safeFilename(doc.nm)}.knit`);
  };

  return (
    <Modal open={open} onClose={onClose} maxWidthClass="max-w-2xl max-h-[85vh]">
      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
        <div>
          <SectionTitle>{lang === 'hu' ? 'Mintakönyvtár' : 'Pattern Library'}</SectionTitle>
          <p className="text-xs text-ink-muted mt-0.5">
            {lang === 'hu'
              ? `${patterns.length} mentett minta helyben a böngészőben`
              : `${patterns.length} saved patterns stored locally in this browser`}
          </p>
        </div>
        <Button variant="icon" size="icon" onClick={onClose} aria-label={lang === 'hu' ? 'Bezárás' : 'Close'} className="text-ink-muted">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-subtle px-6 py-3">
        <Button
          variant="primary"
          onClick={() => {
            onNewPattern();
            onClose();
          }}
        >
          <FilePlus2 className="w-4 h-4" />
          {lang === 'hu' ? 'Új üres minta' : 'New blank pattern'}
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4" />
          {lang === 'hu' ? '.knit importálása' : 'Import .knit'}
        </Button>
        <input ref={fileRef} type="file" accept=".knit,application/json" hidden onChange={handleFile} />
        {importError && <span className="text-xs font-medium text-danger">{importError}</span>}
      </div>

      <div className="overflow-y-auto divide-y divide-line px-6 py-2">
        {patterns.map((p) => {
          const isActive = p.id === activeId;
          return (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <button
                type="button"
                onClick={() => {
                  onSelectPattern(p.id);
                  onClose();
                }}
                className="flex-1 min-w-[200px] text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-ink group-hover:text-accent transition-colors">{p.nm}</span>
                  {isActive && (
                    <span className="text-xs font-semibold text-accent">
                      · {lang === 'hu' ? 'Aktív' : 'Active'}
                    </span>
                  )}
                </div>
                <div className="text-xs text-ink-muted mt-0.5 tabular-nums">
                  {p.cols} × {p.rows} · {formatDimensionsCm(p.cols, p.rows, p.gauge)} · {p.pal.length}{' '}
                  {lang === 'hu' ? 'fonal' : 'yarns'} ·{' '}
                  {p.mode === 'round' ? (lang === 'hu' ? 'körben' : 'round') : lang === 'hu' ? 'síkban' : 'flat'}
                </div>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => handleExportOne(p)}
                  title={lang === 'hu' ? '.knit mentése' : 'Download .knit'}
                  aria-label={lang === 'hu' ? '.knit mentése' : 'Download .knit'}
                  className="text-ink-muted hover:text-ink"
                >
                  <Upload className="w-4 h-4 rotate-180" />
                </Button>
                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => onDuplicatePattern(p.id)}
                  title={lang === 'hu' ? 'Másolat készítése' : 'Duplicate'}
                  aria-label={lang === 'hu' ? 'Másolat készítése' : 'Duplicate'}
                  className="text-ink-muted hover:text-ink"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="icon"
                  size="icon"
                  disabled={patterns.length <= 1}
                  onClick={() => onDeletePattern(p.id)}
                  title={lang === 'hu' ? 'Törlés' : 'Delete'}
                  aria-label={lang === 'hu' ? 'Törlés' : 'Delete'}
                  className="text-danger border-danger-line"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

/* --------------------------------------------------------------------------
   Image Import Modal
   -------------------------------------------------------------------------- */

const ImageImportModal: React.FC<{
  imageElement: HTMLImageElement | null;
  onClose: () => void;
  cols: number;
  rows: number;
  gauge: Gauge;
  currentPalette: string[];
  onApply: (grid: number[][], palette: string[], replacedPalette: boolean) => void;
  lang: Lang;
}> = ({ imageElement, onClose, cols, rows, gauge, currentPalette, onApply, lang }) => {
  const t = tFor(lang);
  const [useImagePal, setUseImagePal] = useState(true);
  const [palCount, setPalCount] = useState(4);
  const [dither, setDither] = useState(true);
  const [alphaNoStitch, setAlphaNoStitch] = useState(true);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [result, setResult] = useState<{ grid: number[][]; palette: string[] } | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageElement) return;
    const res = convertImageToGrid(imageElement, {
      cols,
      rows,
      gauge,
      useImagePalette: useImagePal,
      paletteCount: palCount,
      currentPalette,
      dither,
      alphaToNoStitch: alphaNoStitch,
      brightness,
      contrast,
    });
    setResult(res);
  }, [imageElement, cols, rows, gauge, useImagePal, palCount, currentPalette, dither, alphaNoStitch, brightness, contrast]);

  useEffect(() => {
    if (!result || !previewRef.current) return;
    const printTheme = resolveChartTheme('print');
    const canvas = previewRef.current;
    const w = Math.max(2, Math.min(12, Math.floor(320 / cols)));
    const h = (w * gauge.s) / gauge.r;
    canvas.width = Math.ceil(cols * w);
    canvas.height = Math.ceil(rows * h);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = printTheme.paperBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const emptySy = Array.from({ length: rows }, () => Array(cols).fill(0));
    drawCells(ctx, result.grid, emptySy, result.palette, cols, rows, w, h, 'g', BUILTIN_STITCHES, printTheme);
  }, [result, cols, rows, gauge]);

  if (!imageElement) return null;

  return (
    <Modal open={!!imageElement} onClose={onClose} maxWidthClass="max-w-2xl max-h-[90vh]">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <SectionTitle>{t.export.imgImport}</SectionTitle>
        <Button variant="icon" size="icon" onClick={onClose} aria-label={lang === 'hu' ? 'Bezárás' : 'Close'} className="text-ink-muted">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="overflow-y-auto p-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="flex flex-col items-center justify-center rounded-kw-md border border-line-strong bg-surface-subtle p-4 min-h-[240px]">
          <canvas ref={previewRef} className="max-w-full max-h-[340px] rounded-kw-sm border border-line-strong" />
          <p className="mt-2 font-mono text-xs text-ink-muted tabular-nums">
            {cols} × {rows} {lang === 'hu' ? 'szem' : 'stitches'}
          </p>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <FieldLabel>{lang === 'hu' ? 'Színkezelés' : 'Color source'}</FieldLabel>
            <Select value={useImagePal ? 'img' : 'pal'} onChange={(e) => setUseImagePal(e.target.value === 'img')}>
              <option value="img">{lang === 'hu' ? 'Kép színeiből (új fonalak)' : 'From image (new yarns)'}</option>
              <option value="pal">{lang === 'hu' ? 'Jelenlegi fonalakra' : 'Map to current yarns'}</option>
            </Select>
          </div>

          {useImagePal && (
            <div>
              <FieldLabel>
                {lang === 'hu' ? `Fonalak száma: ${palCount}` : `Number of yarns: ${palCount}`}
              </FieldLabel>
              <input
                type="range"
                min={2}
                max={12}
                value={palCount}
                onChange={(e) => setPalCount(Number(e.target.value))}
                className="w-full accent-neutral-800 dark:accent-neutral-300"
              />
            </div>
          )}

          <div>
            <FieldLabel>
              {t.export.brightness}: {brightness > 0 ? `+${brightness}` : brightness}
            </FieldLabel>
            <input
              type="range"
              min={-40}
              max={40}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-neutral-800 dark:accent-neutral-300"
            />
          </div>

          <div>
            <FieldLabel>
              {t.export.contrast}: {contrast > 0 ? `+${contrast}` : contrast}
            </FieldLabel>
            <input
              type="range"
              min={-40}
              max={40}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-neutral-800 dark:accent-neutral-300"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={dither} onChange={(e) => setDither(e.target.checked)} className="w-5 h-5 accent-neutral-800 dark:accent-neutral-300" />
            <span className="text-sm font-medium text-ink">{t.export.dither}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={alphaNoStitch}
              onChange={(e) => setAlphaNoStitch(e.target.checked)}
              className="w-5 h-5 accent-neutral-800 dark:accent-neutral-300"
            />
            <span className="text-sm font-medium text-ink">{t.export.alphaNoStitch}</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
        <Button variant="secondary" onClick={onClose}>
          {lang === 'hu' ? 'Mégse' : 'Cancel'}
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (!result) return;
            onApply(result.grid, result.palette, useImagePal);
            onClose();
          }}
        >
          {t.export.applyImg}
        </Button>
      </div>
    </Modal>
  );
};
