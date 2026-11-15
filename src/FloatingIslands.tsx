import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  AlignLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  ClipboardCheck,
  Command,
  Copy,
  Eye,
  FileCode2,
  FlipHorizontal2,
  FlipVertical2,
  Grid3x3,
  Layers,
  Maximize2,
  Minimize2,
  Moon,
  Palette,
  PenTool,
  Plus,
  PlusCircle,
  Redo2,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  Trash2,
  Type,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type {
  BrushMode,
  KnitDocument,
  Lang,
  StitchInfo,
  ToolType,
  ViewMode,
} from './core';
import { DEFAULT_PALETTE, tFor } from './core';
import { YARN_LETTERS, analyzePattern, contrastInk, formatDimensionsCm, safeFilename, triggerBlobDownload } from './knitEngine';
import { Alert, Button, Input, SegmentedControl, TableWrap, ToggleButton, cn } from './ui';

/* ==========================================================================
   Knit Workshop — Responsive Touch Studio
   - Phone (< 768px): 4 Streamlined Floating Islands + 1-Tap Undo/Redo Capsule
   - Tablet (768px–1023px): Docked Left & Right Compact Studio Rails
   - Shared Swipe-Dismissible Bottom Sheet (< sm) / Side Sheet (sm+)
   ========================================================================== */

export type IslandId =
  | 'tools'
  | 'stitches'
  | 'yarn'
  | 'history'
  | 'viewZoom'
  | 'inspector';

export type SheetId = 'stitches' | 'yarn' | 'inspector';

interface IslandPos {
  x: number;
  y: number;
}

const STORAGE_KEY = 'kw-mobile-islands-v2';
const BTN_SIZE = 46;
const HISTORY_W = 92;
const BTN_GAP = 10;
const EDGE_SAFE_X = 16; // Keep clear of iOS / Android system edge-swipe back zone

function getIslandWidth(id: IslandId): number {
  return id === 'history' ? HISTORY_W : BTN_SIZE;
}

function getSafeViewportBounds(id: IslandId, vw: number, vh: number) {
  const w = getIslandWidth(id);
  const minX = EDGE_SAFE_X;
  const maxX = Math.max(minX, vw - w - EDGE_SAFE_X);
  const minY = 98;
  const bottomBarH = vw < 768 ? 64 : 12;
  const maxY = Math.max(minY, vh - bottomBarH - BTN_SIZE - 8);
  return { minX, maxX, minY, maxY };
}

function clampPos(id: IslandId, pos: IslandPos, vw: number, vh: number): IslandPos {
  const { minX, maxX, minY, maxY } = getSafeViewportBounds(id, vw, vh);
  return {
    x: Math.round(Math.max(minX, Math.min(maxX, pos.x))),
    y: Math.round(Math.max(minY, Math.min(maxY, pos.y))),
  };
}

function buildDefaultPositions(vw: number, vh: number): Record<IslandId, IslandPos> {
  const leftBounds = getSafeViewportBounds('tools', vw, vh);
  const rightBtnBounds = getSafeViewportBounds('inspector', vw, vh);
  const rightHistBounds = getSafeViewportBounds('history', vw, vh);
  const step = BTN_SIZE + BTN_GAP;
  const row2 = Math.max(leftBounds.minY, leftBounds.maxY);
  const row1 = Math.max(leftBounds.minY, row2 - step);
  const row0 = Math.max(leftBounds.minY, row1 - step);

  return {
    tools: clampPos('tools', { x: leftBounds.minX, y: row0 }, vw, vh),
    stitches: clampPos('stitches', { x: leftBounds.minX, y: row1 }, vw, vh),
    yarn: clampPos('yarn', { x: leftBounds.minX, y: row2 }, vw, vh),
    history: clampPos('history', { x: rightHistBounds.maxX, y: row0 }, vw, vh),
    viewZoom: clampPos('viewZoom', { x: rightBtnBounds.maxX, y: row1 }, vw, vh),
    inspector: clampPos('inspector', { x: rightBtnBounds.maxX, y: row2 }, vw, vh),
  };
}

function loadSavedPositions(vw: number, vh: number): Record<IslandId, IslandPos> {
  const defaults = buildDefaultPositions(vw, vh);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Record<IslandId, IslandPos>>;
    const merged = { ...defaults };
    (Object.keys(defaults) as IslandId[]).forEach((id) => {
      const p = parsed[id];
      if (p && typeof p.x === 'number' && typeof p.y === 'number' && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        merged[id] = clampPos(id, p, vw, vh);
      }
    });
    return merged;
  } catch {
    return defaults;
  }
}

export interface MobileFloatingStudioProps {
  doc: KnitDocument;
  onChangeDoc: (next: KnitDocument) => void;
  pushUndo: (d: KnitDocument) => void;
  lang: Lang;
  onToggleLang: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  zenMode: boolean;
  onToggleZen: () => void;
  stylusOnly: boolean;
  onToggleStylusOnly: () => void;
  toolButtons: Array<{ id: ToolType; icon: React.ComponentType<{ className?: string }>; label: string; keyHint: string }>;
  effectiveTool: ToolType;
  setTool: (t: ToolType) => void;
  allStitches: StitchInfo[];
  curSym: number;
  setCurSym: (idx: number) => void;
  onSelectToolAfterStitchOrYarn: () => void;
  curYarn: number;
  setCurYarn: (idx: number) => void;
  yarnStats: Array<{ count: number; pct: number; meters: number; grams: number }>;
  showYarnLetters: boolean;
  onToggleYarnLetters: () => void;
  brushMode: BrushMode;
  setBrushMode: (m: BrushMode) => void;
  symX: boolean;
  onToggleSymX: () => void;
  symY: boolean;
  onToggleSymY: () => void;
  highlightYarn: number | null;
  setHighlightYarn: React.Dispatch<React.SetStateAction<number | null>>;
  highlightSym: number | null;
  setHighlightSym: React.Dispatch<React.SetStateAction<number | null>>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  computeFitZoom: () => number;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  analysis: ReturnType<typeof analyzePattern>;
  activeCursorRow: number;
  activeLiveRow?: { rowNum: number; tag: string; text: string };
  activeRowAnalysis?: { status: string; message: string; uses: number; made: number };
  livePatternRows: Array<{ rowNum: number; text: string }>;
  mismatchSet: Set<number>;
  fullLiveText: string;
  floatLimit: number;
  setFloatLimit: (n: number) => void;
  usedLegendStitches: StitchInfo[];
  rightTab: 'live' | 'checks' | 'legend';
  setRightTab: (tab: 'live' | 'checks' | 'legend') => void;
  onJumpToRow: (rowNum: number) => void;
  onOpenCustomStitch: () => void;
  onOpenGridEditor: () => void;
  onOpenDrawer: (drawer: 'fills' | 'pattern') => void;
  onOpenCommandPalette: () => void;
  setStatusMsg: (msg: string) => void;
  resetSignal: number;
  activeSheet: SheetId | null;
  setActiveSheet: React.Dispatch<React.SetStateAction<SheetId | null>>;
}

export const TouchStudioSheet: React.FC<
  Pick<
    MobileFloatingStudioProps,
    | 'doc'
    | 'onChangeDoc'
    | 'pushUndo'
    | 'lang'
    | 'allStitches'
    | 'curSym'
    | 'setCurSym'
    | 'onSelectToolAfterStitchOrYarn'
    | 'curYarn'
    | 'setCurYarn'
    | 'yarnStats'
    | 'showYarnLetters'
    | 'onToggleYarnLetters'
    | 'highlightYarn'
    | 'setHighlightYarn'
    | 'highlightSym'
    | 'setHighlightSym'
    | 'analysis'
    | 'activeCursorRow'
    | 'activeLiveRow'
    | 'activeRowAnalysis'
    | 'livePatternRows'
    | 'mismatchSet'
    | 'fullLiveText'
    | 'floatLimit'
    | 'setFloatLimit'
    | 'usedLegendStitches'
    | 'rightTab'
    | 'setRightTab'
    | 'onJumpToRow'
    | 'onOpenCustomStitch'
    | 'onOpenGridEditor'
    | 'setStatusMsg'
  > & {
    sheet: SheetId | null;
    onClose: () => void;
  }
> = ({
  sheet,
  onClose,
  doc,
  onChangeDoc,
  pushUndo,
  lang,
  allStitches,
  curSym,
  setCurSym,
  onSelectToolAfterStitchOrYarn,
  curYarn,
  setCurYarn,
  yarnStats,
  showYarnLetters,
  onToggleYarnLetters,
  highlightYarn,
  setHighlightYarn,
  highlightSym,
  setHighlightSym,
  analysis,
  activeCursorRow,
  activeLiveRow,
  activeRowAnalysis,
  livePatternRows,
  mismatchSet,
  fullLiveText,
  floatLimit,
  setFloatLimit,
  usedLegendStitches,
  rightTab,
  setRightTab,
  onJumpToRow,
  onOpenCustomStitch,
  onOpenGridEditor,
  setStatusMsg,
}) => {
  const t = tFor(lang);
  const [dragY, setDragY] = useState(0);
  const dragStartYRef = useRef<number | null>(null);
  const dragStartTimeRef = useRef<number>(0);

  useEffect(() => {
    setDragY(0);
    dragStartYRef.current = null;
  }, [sheet]);

  useEffect(() => {
    if (!sheet) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sheet, onClose]);

  if (!sheet) return null;

  const activeStitch = allStitches[curSym] ?? allStitches[0];
  const hasHealthError = analysis.mismatchRows.length > 0;
  const hasHealthWarn = analysis.floatRows.length > 0;
  const sheetTitle =
    sheet === 'stitches'
      ? t.panels.symbols
      : sheet === 'yarn'
      ? t.panels.yarns
      : t.toolbar.rightPanel;

  const onSwipeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 640) return;
    if ((e.target as HTMLElement).closest('button')) return;
    dragStartYRef.current = e.clientY;
    dragStartTimeRef.current = performance.now();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore synthetic pointer errors
    }
  };

  const onSwipeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    const dy = Math.max(0, e.clientY - dragStartYRef.current);
    setDragY(dy);
  };

  const onSwipeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    const dy = Math.max(0, e.clientY - dragStartYRef.current);
    const dt = Math.max(1, performance.now() - dragStartTimeRef.current);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    dragStartYRef.current = null;
    if (dy > 85 || (dy > 32 && dy / dt > 0.45)) {
      setDragY(0);
      onClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <div className="lg:hidden">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={sheetTitle}
        style={
          dragY > 0
            ? { transform: `translateY(${dragY}px)`, transition: 'none' }
            : { transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)' }
        }
        className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-full sm:max-w-md z-[var(--kw-z-modal)] bg-surface border-t sm:border-t-0 sm:border-l border-line-strong rounded-t-2xl sm:rounded-none shadow-kw-lg flex flex-col max-h-[82dvh] sm:max-h-none pb-safe"
      >
        {/* Swipe-Dismissible Grab Handle & Header (< sm) */}
        <div
          onPointerDown={onSwipeDown}
          onPointerMove={onSwipeMove}
          onPointerUp={onSwipeEnd}
          onPointerCancel={onSwipeEnd}
          className="shrink-0 touch-none sm:touch-auto select-none"
        >
          <div className="sm:hidden pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
            <span className="w-10 h-1.5 rounded-full bg-line-strong" aria-hidden="true" />
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-display text-sm font-semibold text-ink truncate">{sheetTitle}</h2>
              {sheet === 'stitches' && (
                <span className="font-mono text-xs text-ink-muted shrink-0">{activeStitch?.code ?? 'k'}</span>
              )}
              {sheet === 'inspector' && (
                <span className="font-mono text-xs text-ink-muted tabular-nums shrink-0">
                  {doc.cols} × {doc.rows}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="min-h-[38px]">
              <X className="w-4 h-4" />
              <span>{lang === 'hu' ? 'Bezárás' : 'Close'}</span>
            </Button>
          </div>
        </div>

        {/* SHEET 1: STITCH SYMBOLS */}
        {sheet === 'stitches' && (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5">
              <div className="grid grid-cols-2 gap-1.5">
                {allStitches.map((st) => {
                  const active = curSym === st.idx;
                  const shortTitle = (lang === 'hu' ? st.titleHu : st.titleEn).split('(')[0].trim();
                  return (
                    <button
                      key={`sh-sym-${st.idx}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setCurSym(st.idx);
                        onSelectToolAfterStitchOrYarn();
                        onClose();
                      }}
                      className={cn(
                        'flex items-center gap-2.5 min-h-[44px] rounded-kw-sm border px-2 py-1.5 text-left cursor-pointer',
                        active
                          ? 'border-transparent bg-accent text-accent-fg font-semibold shadow-kw-sm'
                          : 'border-line bg-surface-subtle/70 text-ink hover:bg-surface-hover'
                      )}
                    >
                      <span
                        className={cn(
                          'w-7 h-7 rounded-[5px] flex items-center justify-center font-semibold text-sm shrink-0',
                          active ? 'bg-white/20 dark:bg-black/20' : 'bg-surface border border-line'
                        )}
                      >
                        {st.glyph}
                      </span>
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
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="shrink-0 border-t border-line bg-surface p-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCustomStitch();
                }}
                className="w-full flex items-center justify-between gap-2 min-h-[44px] px-3 py-2 rounded-kw-sm border border-line bg-surface-subtle/80 hover:bg-surface-hover hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <PlusCircle className="w-4 h-4 shrink-0 text-ink-muted" />
                  <span className="truncate">{t.panels.addCustomStitch}</span>
                </span>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-ink-muted" />
              </button>
            </div>
          </>
        )}

        {/* SHEET 2: YARN PALETTE AND A/B LETTERS */}
        {sheet === 'yarn' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-line">
              <Button
                variant={showYarnLetters ? 'primary' : 'secondary'}
                size="sm"
                aria-pressed={showYarnLetters}
                onClick={onToggleYarnLetters}
                className="min-h-[44px]"
              >
                <span className="font-mono font-semibold text-xs">A/B</span>
                <span>{lang === 'hu' ? 'Fonalbetűk a rácson' : 'Yarn letters on grid'}</span>
              </Button>
              {doc.pal.length < 12 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    pushUndo(doc);
                    const nextCol = DEFAULT_PALETTE.find((c) => !doc.pal.includes(c)) || DEFAULT_PALETTE[0];
                    onChangeDoc({ ...doc, pal: [...doc.pal, nextCol], updatedAt: Date.now() });
                  }}
                  className="min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.panels.addYarn}</span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {doc.pal.map((hex, idx) => {
                const st = yarnStats[idx];
                const active = curYarn === idx;
                return (
                  <div
                    key={`sh-y-${idx}`}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-kw-sm border px-2.5 py-2 transition-colors',
                      active ? 'border-accent-line bg-accent-soft' : 'border-line bg-surface-subtle/60'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCurYarn(idx);
                        onSelectToolAfterStitchOrYarn();
                        onClose();
                      }}
                      aria-pressed={active}
                      className="flex-1 flex items-center gap-3 min-h-[44px] text-left cursor-pointer"
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-black/25 dark:border-white/30 flex items-center justify-center font-mono text-xs font-bold shrink-0"
                        style={{ backgroundColor: hex, color: contrastInk(hex) }}
                      >
                        {YARN_LETTERS[idx]}
                      </span>
                      <span className="text-xs font-semibold text-ink">
                        {lang === 'hu' ? `Fonal ${YARN_LETTERS[idx]}` : `Yarn ${YARN_LETTERS[idx]}`}
                      </span>
                      <span className="font-mono text-xs text-ink-muted tabular-nums ml-auto">
                        {st.count} {lang === 'hu' ? 'szem' : 'sts'} ({st.pct}%)
                      </span>
                    </button>

                    <label
                      title={lang === 'hu' ? `${YARN_LETTERS[idx]} színe` : `Color ${YARN_LETTERS[idx]}`}
                      className="relative w-10 h-10 rounded-kw-sm border border-line-strong cursor-pointer shrink-0 overflow-hidden"
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
                        className="min-w-[44px] min-h-[44px] rounded-kw-sm flex items-center justify-center text-danger hover:bg-danger-bg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SHEET 3: STUDIO INSPECTOR */}
        {sheet === 'inspector' && (
          <>
            <div className="shrink-0 space-y-2.5 px-4 py-3 border-b border-line">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setRightTab('checks')}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-bold rounded-kw-sm px-1.5 py-1 -mx-1.5 cursor-pointer',
                    hasHealthError ? 'text-danger' : hasHealthWarn ? 'text-warning' : 'text-success'
                  )}
                >
                  {hasHealthError ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {lang === 'hu'
                          ? `${analysis.mismatchRows.length} szemszám-hiba`
                          : `${analysis.mismatchRows.length} row count error(s)`}
                      </span>
                    </>
                  ) : hasHealthWarn ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {lang === 'hu'
                          ? `${analysis.floatRows.length} sorban hosszú szál`
                          : `${analysis.floatRows.length} long float row(s)`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>{lang === 'hu' ? 'Minden sor szemszáma rendben' : 'All row stitch counts OK'}</span>
                    </>
                  )}
                </button>
              </div>

              {activeLiveRow && (
                <div className="rounded-kw-sm border border-line bg-surface-subtle/80 px-2.5 py-2 font-mono text-xs text-ink break-words leading-snug">
                  <span className="font-semibold mr-1.5">
                    {lang === 'hu' ? `${activeLiveRow.rowNum}. sor (${activeLiveRow.tag}):` : `R${activeLiveRow.rowNum} (${activeLiveRow.tag}):`}
                  </span>
                  <span className="text-ink-secondary">{activeLiveRow.text}</span>
                </div>
              )}

              <SegmentedControl className="w-full grid grid-cols-3 gap-0.5">
                <ToggleButton
                  layout="seg"
                  tone="neutral"
                  pressed={rightTab === 'live'}
                  onClick={() => setRightTab('live')}
                  className="min-h-[38px] text-xs"
                >
                  <AlignLeft className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span className="truncate">{lang === 'hu' ? 'Élő szöveg' : 'Live Text'}</span>
                </ToggleButton>
                <ToggleButton
                  layout="seg"
                  tone="neutral"
                  pressed={rightTab === 'checks'}
                  onClick={() => setRightTab('checks')}
                  className="min-h-[38px] text-xs"
                >
                  <span className="truncate">
                    {lang === 'hu' ? 'Ellenőrzés' : 'Checks'}
                    {analysis.mismatchRows.length > 0 ? ` (${analysis.mismatchRows.length})` : ''}
                  </span>
                </ToggleButton>
                <ToggleButton
                  layout="seg"
                  tone="neutral"
                  pressed={rightTab === 'legend'}
                  onClick={() => setRightTab('legend')}
                  className="min-h-[38px] text-xs"
                >
                  <Bookmark className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span className="truncate">{lang === 'hu' ? 'Jelmagyarázat' : 'Legend'}</span>
                </ToggleButton>
              </SegmentedControl>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3">
              {rightTab === 'live' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-ink-secondary">
                      {lang === 'hu' ? 'Koppints egy sorra az ugráshoz' : 'Tap a row to jump'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard?.writeText(fullLiveText).catch(() => {});
                          setStatusMsg(lang === 'hu' ? 'Szöveges leírás másolva.' : 'Pattern instructions copied.');
                        }}
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
                      >
                        TXT
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-kw-sm border border-line bg-surface-subtle/50 divide-y divide-line font-mono text-xs">
                    {livePatternRows.map((item) => {
                      const isActive = item.rowNum === activeCursorRow;
                      const rowMismatch = mismatchSet.has(item.rowNum);
                      return (
                        <button
                          key={`sh-lr-${item.rowNum}`}
                          type="button"
                          onClick={() => {
                            onJumpToRow(item.rowNum);
                            onClose();
                          }}
                          className={cn(
                            'w-full text-left px-2.5 py-2.5 min-h-[44px] flex items-start gap-2 cursor-pointer',
                            isActive ? 'bg-accent-soft font-bold text-ink' : 'hover:bg-surface-hover text-ink-secondary',
                            rowMismatch && 'text-danger'
                          )}
                        >
                          <span className="shrink-0 font-bold tabular-nums w-10">
                            {lang === 'hu' ? `${item.rowNum}.` : `R${item.rowNum}`}
                          </span>
                          <span className="break-words flex-1">{item.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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
                        className="w-14 min-h-[34px] py-1 px-1.5 text-right text-xs tabular-nums"
                      />
                    </label>
                  </div>

                  <TableWrap>
                    <table className="w-full text-xs tabular-nums">
                      <thead className="bg-surface-subtle text-ink-secondary sticky top-0">
                        <tr>
                          <th className="px-2 py-2 text-left">{lang === 'hu' ? 'Sor' : 'Row'}</th>
                          <th className="px-2 py-2 text-right">{lang === 'hu' ? 'Indul' : 'Uses'}</th>
                          <th className="px-2 py-2 text-right">{lang === 'hu' ? 'Lesz' : 'Makes'}</th>
                          <th className="px-2 py-2 text-right">{lang === 'hu' ? 'Max szál' : 'Float'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {analysis.rows.map((r) => {
                          const isActive = r.rowNum === activeCursorRow;
                          return (
                            <tr
                              key={`sh-ck-${r.rowNum}`}
                              onClick={() => {
                                onJumpToRow(r.rowNum);
                                onClose();
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
                              <td className="px-2 py-2.5">
                                {isActive ? '▸ ' : ''}
                                {r.rowNum}
                              </td>
                              <td className="px-2 py-2.5 text-right">{r.uses}</td>
                              <td className="px-2 py-2.5 text-right">{r.made}</td>
                              <td className="px-2 py-2.5 text-right">{r.maxFloat || '–'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </TableWrap>
                </div>
              )}

              {rightTab === 'legend' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-ink-secondary">
                      <span>{lang === 'hu' ? 'Fonalak (koppints a kiemeléshez)' : 'Yarns (tap to spotlight)'}</span>
                      <span className="font-mono tabular-nums">{formatDimensionsCm(doc.cols, doc.rows, doc.gauge)}</span>
                    </div>
                    <div className="space-y-1.5">
                      {doc.pal.map((hex, idx) => {
                        const st = yarnStats[idx];
                        const highlighted = highlightYarn === idx;
                        return (
                          <button
                            key={`sh-ly-${idx}`}
                            type="button"
                            aria-pressed={highlighted}
                            onClick={() => setHighlightYarn((prev) => (prev === idx ? null : idx))}
                            className={cn(
                              'w-full flex items-center justify-between gap-2 min-h-[44px] rounded-kw-sm border px-2.5 py-2 text-xs cursor-pointer tabular-nums',
                              highlighted
                                ? 'border-accent-line bg-accent-soft font-semibold text-ink'
                                : 'border-line bg-surface-subtle/70 text-ink hover:bg-surface-hover'
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
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-muted">
                              <span>{st.pct}% · ~{st.meters}m · ~{st.grams}g</span>
                              <Eye className={cn('w-3.5 h-3.5', highlighted ? 'opacity-100 text-ink' : 'opacity-45')} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-line pt-2.5 space-y-1.5">
                    <div className="text-xs font-semibold text-ink-secondary">
                      {lang === 'hu' ? 'Használt szemjelek (koppints a kiemeléshez)' : 'Used stitches (tap to spotlight)'}
                    </div>
                    <div className="space-y-1">
                      {usedLegendStitches.map((st) => {
                        const highlighted = highlightSym === st.idx;
                        return (
                          <button
                            key={`sh-ls-${st.idx}`}
                            type="button"
                            aria-pressed={highlighted}
                            onClick={() => setHighlightSym((prev) => (prev === st.idx ? null : st.idx))}
                            className={cn(
                              'w-full flex items-center gap-2 min-h-[44px] rounded-kw-sm border px-2.5 py-1.5 text-left text-xs cursor-pointer',
                              highlighted
                                ? 'border-accent-line bg-accent-soft font-semibold text-ink'
                                : 'border-line bg-surface-subtle/70 text-ink hover:bg-surface-hover'
                            )}
                          >
                            <span className="w-6 h-6 rounded-[5px] border border-line bg-surface flex items-center justify-center font-semibold text-sm shrink-0">
                              {st.glyph}
                            </span>
                            <span className="font-mono font-semibold shrink-0">{st.code}</span>
                            <span className="text-ink-muted truncate flex-1">
                              {(lang === 'hu' ? st.titleHu : st.titleEn).split('(')[0].trim()}
                            </span>
                            <Eye className={cn('w-3.5 h-3.5 shrink-0', highlighted ? 'opacity-100 text-ink' : 'opacity-45')} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-line bg-surface p-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGridEditor();
                }}
                className="w-full flex items-center justify-between gap-2 min-h-[44px] px-3 py-2 rounded-kw-sm border border-line bg-surface-subtle/80 hover:bg-surface-hover hover:border-line-strong text-xs font-semibold text-ink cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FileCode2 className="w-4 h-4 shrink-0 text-ink-muted" />
                  <span className="truncate">{lang === 'hu' ? 'Rácsszerkesztő' : 'Grid editor'}</span>
                </span>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-ink-muted" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const MobileFloatingStudio: React.FC<MobileFloatingStudioProps> = ({
  doc,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  zenMode,
  onToggleZen,
  stylusOnly,
  onToggleStylusOnly,
  toolButtons,
  effectiveTool,
  setTool,
  allStitches,
  curSym,
  curYarn,
  brushMode,
  setBrushMode,
  symX,
  onToggleSymX,
  symY,
  onToggleSymY,
  highlightYarn,
  setHighlightYarn,
  highlightSym,
  setHighlightSym,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  setZoom,
  computeFitZoom,
  view,
  setView,
  analysis,
  onOpenDrawer,
  onOpenCommandPalette,
  setStatusMsg,
  resetSignal,
  activeSheet,
  setActiveSheet,
}) => {
  const t = tFor(lang);
  const [viewport, setViewport] = useState<{ vw: number; vh: number }>(() =>
    typeof window !== 'undefined' ? { vw: window.innerWidth, vh: window.innerHeight } : { vw: 390, vh: 844 }
  );
  const [positions, setPositions] = useState<Record<IslandId, IslandPos>>(() =>
    typeof window !== 'undefined'
      ? loadSavedPositions(window.innerWidth, window.innerHeight)
      : buildDefaultPositions(390, 844)
  );
  const [openPopover, setOpenPopover] = useState<'tools' | 'viewZoom' | null>(null);
  const [draggingId, setDraggingId] = useState<IslandId | null>(null);

  const dragMetaRef = useRef<{
    id: IslandId;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef<IslandId | null>(null);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popoverSize, setPopoverSize] = useState<{ w: number; h: number }>({ w: 268, h: 280 });

  useEffect(() => {
    if (resetSignal === 0) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const next = buildDefaultPositions(vw, vh);
    setPositions(next);
    setOpenPopover(null);
    setActiveSheet(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }, [resetSignal, setActiveSheet]);

  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setViewport({ vw, vh });
      setPositions((prev) => {
        const clamped = { ...prev };
        (Object.keys(clamped) as IslandId[]).forEach((id) => {
          clamped[id] = clampPos(id, clamped[id], vw, vh);
        });
        return clamped;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!openPopover) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPopover(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openPopover]);

  useEffect(() => {
    if (!openPopover || !popoverRef.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setPopoverSize({ w: rect.width, h: rect.height });
    }
  }, [openPopover, viewport, positions, highlightSym, highlightYarn, symX, symY, brushMode, zoom, view, stylusOnly]);

  const handleResetLayout = useCallback(() => {
    const next = buildDefaultPositions(viewport.vw, viewport.vh);
    setPositions(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
    setOpenPopover(null);
    setStatusMsg(lang === 'hu' ? 'Lebegő gombok visszaállítva.' : 'Floating islands reset.');
  }, [viewport, lang, setStatusMsg]);

  const onIslandPointerDown = (id: IslandId, e: React.PointerEvent<HTMLElement>) => {
    const pos = positions[id];
    dragMetaRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    };
  };

  const onIslandPointerMove = (id: IslandId, e: React.PointerEvent<HTMLElement>) => {
    const meta = dragMetaRef.current;
    if (!meta || meta.id !== id) return;
    const dx = e.clientX - meta.startX;
    const dy = e.clientY - meta.startY;
    if (!meta.moved && Math.hypot(dx, dy) > 8) {
      meta.moved = true;
      suppressClickRef.current = id;
      try {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      } catch {
        // ignore pointer capture issues
      }
      setDraggingId(id);
      setOpenPopover(null);
    }
    if (meta.moved) {
      const nextPos = clampPos(id, { x: meta.origX + dx, y: meta.origY + dy }, viewport.vw, viewport.vh);
      setPositions((prev) => ({ ...prev, [id]: nextPos }));
    }
  };

  const onIslandPointerUpOrCancel = (id: IslandId, e: React.PointerEvent<HTMLElement>) => {
    const meta = dragMetaRef.current;
    if (!meta || meta.id !== id) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore pointer capture issues
    }
    if (meta.moved) {
      setPositions((prev) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
        } catch {
          // ignore storage errors
        }
        return prev;
      });
      window.setTimeout(() => {
        if (suppressClickRef.current === id) suppressClickRef.current = null;
      }, 150);
    }
    dragMetaRef.current = null;
    setDraggingId(null);
  };

  const onIslandClick = (id: Exclude<IslandId, 'history'>) => {
    if (suppressClickRef.current === id) {
      suppressClickRef.current = null;
      return;
    }
    if (id === 'stitches' || id === 'yarn' || id === 'inspector') {
      setOpenPopover(null);
      setActiveSheet((prev) => (prev === id ? null : id));
    } else {
      setActiveSheet(null);
      setOpenPopover((prev) => (prev === id ? null : id));
    }
  };

  if (zenMode) {
    return (
      <div className="lg:hidden fixed bottom-18 md:bottom-4 right-4 z-[var(--kw-z-modal)]">
        <button
          type="button"
          onClick={onToggleZen}
          aria-label={lang === 'hu' ? 'Kilépés a Zen módból' : 'Exit Zen mode'}
          title={lang === 'hu' ? 'Kilépés a Zen módból' : 'Exit Zen mode'}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-kw-md border border-line-strong bg-surface/95 backdrop-blur-md text-xs font-semibold text-ink shadow-kw-md cursor-pointer"
        >
          <Minimize2 className="w-4 h-4" />
          <span>{lang === 'hu' ? 'Zen ki' : 'Exit Zen'}</span>
        </button>
      </div>
    );
  }

  const ActiveToolIcon = toolButtons.find((x) => x.id === effectiveTool)?.icon ?? Layers;
  const activeStitch = allStitches[curSym] ?? allStitches[0];
  const hasMirror = symX || symY;
  const hasHealthError = analysis.mismatchRows.length > 0;
  const hasHealthWarn = analysis.floatRows.length > 0;

  const popoverStyle = (() => {
    if (!openPopover) return undefined;
    const anchor = positions[openPopover];
    const vw = viewport.vw;
    const vh = viewport.vh;
    const pad = 12;
    const bottomSafe = 68;
    const maxW = Math.min(288, vw - pad * 2);
    const estW = Math.min(maxW, Math.max(240, popoverSize.w));
    const estH = Math.min(vh - 110 - bottomSafe, popoverSize.h || 280);

    const openLeftSide = anchor.x > vw / 2;
    let left = openLeftSide ? anchor.x - estW - 8 : anchor.x + BTN_SIZE + 8;
    if (left < pad || left + estW > vw - pad) {
      left = Math.max(pad, Math.min(vw - estW - pad, anchor.x + BTN_SIZE / 2 - estW / 2));
    }

    let top = anchor.y + BTN_SIZE - estH;
    if (top < 94) top = anchor.y;
    top = Math.max(94, Math.min(vh - bottomSafe - estH - 8, top));

    return { left, top, maxWidth: maxW };
  })();

  const singleIslands: Array<{
    id: Exclude<IslandId, 'history'>;
    label: string;
    renderIcon: () => React.ReactNode;
    isOpen: boolean;
    activeState?: boolean;
    badgeTone?: 'danger' | 'warning' | 'accent';
  }> = [
    {
      id: 'tools',
      label: lang === 'hu' ? 'Eszközök és ecset' : 'Tools and brush',
      renderIcon: () => <ActiveToolIcon className="w-5 h-5" />,
      isOpen: openPopover === 'tools',
      badgeTone: hasMirror || stylusOnly ? 'accent' : undefined,
    },
    {
      id: 'stitches',
      label: t.panels.symbols,
      renderIcon: () => <span className="font-semibold text-base leading-none">{activeStitch?.glyph ?? '■'}</span>,
      isOpen: activeSheet === 'stitches',
    },
    {
      id: 'yarn',
      label: t.panels.yarns,
      renderIcon: () => (
        <span
          className="w-6 h-6 rounded-kw-sm border border-black/25 dark:border-white/30 flex items-center justify-center font-mono text-xs font-bold"
          style={{
            backgroundColor: doc.pal[curYarn] ?? DEFAULT_PALETTE[0],
            color: contrastInk(doc.pal[curYarn] ?? DEFAULT_PALETTE[0]),
          }}
        >
          {YARN_LETTERS[curYarn]}
        </span>
      ),
      isOpen: activeSheet === 'yarn',
    },
    {
      id: 'viewZoom',
      label: lang === 'hu' ? 'Nézet és műveletek' : 'View and actions',
      renderIcon: () => <ZoomIn className="w-5 h-5" />,
      isOpen: openPopover === 'viewZoom',
      activeState: view === 'k',
    },
    {
      id: 'inspector',
      label: t.toolbar.rightPanel,
      renderIcon: () =>
        hasHealthError || hasHealthWarn ? (
          <AlertTriangle className={cn('w-5 h-5', hasHealthError ? 'text-danger' : 'text-warning')} />
        ) : (
          <ClipboardCheck className="w-5 h-5" />
        ),
      isOpen: activeSheet === 'inspector',
      badgeTone: hasHealthError ? 'danger' : hasHealthWarn ? 'warning' : undefined,
    },
  ];

  const histPos = positions.history;

  return (
    <div className="md:hidden">
      {/* Direct 1-Tap Undo / Redo Floating Capsule (Draggable as a pair) */}
      <div
        onPointerDown={(e) => onIslandPointerDown('history', e)}
        onPointerMove={(e) => onIslandPointerMove('history', e)}
        onPointerUp={(e) => onIslandPointerUpOrCancel('history', e)}
        onPointerCancel={(e) => onIslandPointerUpOrCancel('history', e)}
        style={{ left: histPos.x, top: histPos.y, width: HISTORY_W, height: BTN_SIZE }}
        className={cn(
          'fixed z-30 rounded-kw-md border border-line-strong bg-surface/95 backdrop-blur-md shadow-kw-md grid grid-cols-2 divide-x divide-line overflow-hidden touch-none select-none',
          draggingId === 'history' && 'scale-105 opacity-90'
        )}
      >
        <button
          type="button"
          disabled={!canUndo}
          onClick={() => {
            if (suppressClickRef.current === 'history') {
              suppressClickRef.current = null;
              return;
            }
            onUndo();
          }}
          aria-label={t.toolbar.undo}
          title={t.toolbar.undo}
          className="flex items-center justify-center text-ink hover:bg-surface-hover disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={() => {
            if (suppressClickRef.current === 'history') {
              suppressClickRef.current = null;
              return;
            }
            onRedo();
          }}
          aria-label={t.toolbar.redo}
          title={t.toolbar.redo}
          className="flex items-center justify-center text-ink hover:bg-surface-hover disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* 5 Focused Floating Island Buttons */}
      {singleIslands.map(({ id, label, renderIcon, isOpen, activeState, badgeTone }) => {
        const pos = positions[id];
        const isDragging = draggingId === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onIslandClick(id)}
            onPointerDown={(e) => onIslandPointerDown(id, e)}
            onPointerMove={(e) => onIslandPointerMove(id, e)}
            onPointerUp={(e) => onIslandPointerUpOrCancel(id, e)}
            onPointerCancel={(e) => onIslandPointerUpOrCancel(id, e)}
            aria-expanded={isOpen}
            aria-label={label}
            title={label}
            style={{ left: pos.x, top: pos.y, width: BTN_SIZE, height: BTN_SIZE }}
            className={cn(
              'fixed rounded-kw-md border flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing transition-colors',
              openPopover === id ? 'z-[45]' : 'z-30',
              isDragging && 'scale-105 opacity-90',
              isOpen || activeState
                ? 'border-accent-line bg-accent text-accent-fg shadow-kw-md'
                : 'border-line-strong bg-surface/95 backdrop-blur-md text-ink hover:bg-surface-hover shadow-kw-md'
            )}
          >
            {renderIcon()}
            {badgeTone && !isOpen && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-1.5 right-1.5 w-2 h-2 rounded-full',
                  badgeTone === 'danger' ? 'bg-danger' : badgeTone === 'warning' ? 'bg-warning' : 'bg-ink'
                )}
              />
            )}
          </button>
        );
      })}

      {/* Subtle Scrim Backdrop for Popovers so Modal State Is Clear */}
      {openPopover && (
        <div
          aria-hidden="true"
          onClick={() => setOpenPopover(null)}
          className="fixed inset-0 z-40 bg-black/20"
        />
      )}

      {/* Viewport-Clamped Grouped Popover */}
      {openPopover && popoverStyle && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={singleIslands.find((i) => i.id === openPopover)?.label}
          style={popoverStyle}
          className="fixed z-[var(--kw-z-modal)] rounded-kw-md border border-line-strong bg-surface shadow-kw-lg p-3 max-h-[calc(100dvh-160px)] overflow-y-auto space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-line">
            <span className="text-xs font-semibold text-ink">
              {singleIslands.find((i) => i.id === openPopover)?.label}
            </span>
            <button
              type="button"
              onClick={() => setOpenPopover(null)}
              aria-label={lang === 'hu' ? 'Bezárás' : 'Close'}
              className="min-h-[34px] min-w-[34px] rounded-kw-sm flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-hover cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {openPopover === 'tools' && (
            <div className="space-y-2.5 w-[252px]">
              <div className="grid grid-cols-3 gap-1.5">
                {toolButtons.map(({ id, icon: Icon, label }) => (
                  <ToggleButton
                    key={`isl-tool-${id}`}
                    layout="tile"
                    tone="accent"
                    pressed={effectiveTool === id}
                    onClick={() => {
                      setTool(id);
                      setOpenPopover(null);
                    }}
                    className="min-h-[50px]"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate max-w-full">{label}</span>
                  </ToggleButton>
                ))}
              </div>

              <div className="pt-2 border-t border-line space-y-2">
                <div className="text-[11px] font-semibold text-ink-muted">{t.panels.pencil}</div>
                <SegmentedControl className="w-full grid grid-cols-3 gap-0.5">
                  {(
                    [
                      ['b', t.panels.both],
                      ['c', t.panels.yarnOnly],
                      ['s', t.panels.stitchOnly],
                    ] as const
                  ).map(([m, label]) => (
                    <ToggleButton
                      key={`isl-bm-${m}`}
                      layout="seg"
                      tone="neutral"
                      pressed={brushMode === m}
                      onClick={() => setBrushMode(m)}
                      className="min-h-[38px] px-1 text-[11px]"
                    >
                      {label}
                    </ToggleButton>
                  ))}
                </SegmentedControl>

                <div className="grid grid-cols-2 gap-1.5">
                  <ToggleButton
                    layout="inline"
                    tone="symmetry"
                    pressed={symX}
                    onClick={onToggleSymX}
                    className="min-h-[42px]"
                  >
                    <FlipHorizontal2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {symX ? (lang === 'hu' ? 'Tükör ↔ be' : 'Mirror ↔ on') : lang === 'hu' ? 'Tükör ↔ ki' : 'Mirror ↔ off'}
                    </span>
                  </ToggleButton>
                  <ToggleButton
                    layout="inline"
                    tone="symmetry"
                    pressed={symY}
                    onClick={onToggleSymY}
                    className="min-h-[42px]"
                  >
                    <FlipVertical2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {symY ? (lang === 'hu' ? 'Tükör ↕ be' : 'Mirror ↕ on') : lang === 'hu' ? 'Tükör ↕ ki' : 'Mirror ↕ off'}
                    </span>
                  </ToggleButton>
                </div>

                <ToggleButton
                  layout="inline"
                  tone="accent"
                  pressed={stylusOnly}
                  onClick={onToggleStylusOnly}
                  className="w-full justify-between min-h-[42px] px-2.5"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <PenTool className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {lang === 'hu' ? 'Csak tollal rajzol (ujj görget)' : 'Stylus draw only (finger pans)'}
                    </span>
                  </span>
                </ToggleButton>

                {(highlightSym !== null || highlightYarn !== null) && (
                  <button
                    type="button"
                    onClick={() => {
                      setHighlightSym(null);
                      setHighlightYarn(null);
                      setOpenPopover(null);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 min-h-[40px] px-2.5 rounded-kw-sm border border-accent-line bg-accent-soft text-xs font-medium text-ink cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lang === 'hu' ? 'Kiemelés kikapcsolása' : 'Clear spotlight'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {openPopover === 'viewZoom' && (
            <div className="space-y-2.5 w-[248px]">
              <div className="flex items-center justify-between gap-1">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setZoom((z) => Math.max(0.15, z / 1.25))}
                  aria-label={t.toolbar.zoomOut}
                  className="min-h-[42px] min-w-[42px]"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="font-mono text-xs font-semibold tabular-nums text-ink">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setZoom((z) => Math.min(3, z * 1.25))}
                  aria-label={t.toolbar.zoomIn}
                  className="min-h-[42px] min-w-[42px]"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setZoom(computeFitZoom());
                    setOpenPopover(null);
                  }}
                  className="min-h-[42px]"
                >
                  {t.toolbar.fit}
                </Button>
              </div>

              <SegmentedControl className="w-full grid grid-cols-2 gap-0.5">
                <ToggleButton
                  layout="seg"
                  tone="neutral"
                  pressed={view === 'g'}
                  onClick={() => setView('g')}
                  className="min-h-[40px]"
                >
                  <Grid3x3 className="w-3.5 h-3.5 mr-1" />
                  {t.toolbar.grid}
                </ToggleButton>
                <ToggleButton
                  layout="seg"
                  tone="neutral"
                  pressed={view === 'k'}
                  onClick={() => setView('k')}
                  className="min-h-[40px]"
                >
                  {t.toolbar.knitted}
                </ToggleButton>
              </SegmentedControl>

              <Button
                variant="secondary"
                onClick={() => {
                  setOpenPopover(null);
                  onToggleZen();
                }}
                className="w-full min-h-[42px] justify-between"
              >
                <span className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  <span>{lang === 'hu' ? 'Zen mód (teljes vászon)' : 'Zen mode (full canvas)'}</span>
                </span>
              </Button>

              <div className="border-t border-line pt-2 space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpenPopover(null);
                    onOpenDrawer('fills');
                  }}
                  className="w-full flex items-center justify-between gap-2 min-h-[42px] px-2.5 rounded-kw-sm border border-line bg-surface-subtle/75 hover:bg-surface-hover text-xs font-medium text-ink cursor-pointer"
                >
                  <span>{lang === 'hu' ? 'Kitöltés és bélyegzők' : 'Fills and Stamps'}</span>
                  <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpenPopover(null);
                    onOpenDrawer('pattern');
                  }}
                  className="w-full flex items-center justify-between gap-2 min-h-[42px] px-2.5 rounded-kw-sm border border-line bg-surface-subtle/75 hover:bg-surface-hover text-xs font-medium text-ink cursor-pointer"
                >
                  <span>{lang === 'hu' ? 'Minta, méret és export' : 'Pattern, Size and Export'}</span>
                  <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpenPopover(null);
                    onOpenCommandPalette();
                  }}
                  className="w-full flex items-center justify-between gap-2 min-h-[42px] px-2.5 rounded-kw-sm border border-line bg-surface-subtle/75 hover:bg-surface-hover text-xs font-medium text-ink cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Command className="w-4 h-4 text-ink-muted shrink-0" />
                    <span>{lang === 'hu' ? 'Parancspaletta' : 'Command Palette'}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-ink-muted shrink-0" />
                </button>

                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <Button variant="secondary" onClick={onToggleTheme} className="min-h-[42px]">
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span>{theme === 'dark' ? t.toolbar.lightMode : t.toolbar.darkMode}</span>
                  </Button>
                  <Button variant="secondary" onClick={onToggleLang} className="min-h-[42px] font-mono">
                    {t.toolbar.langLabel}
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={handleResetLayout}
                  className="w-full flex items-center justify-center gap-1.5 min-h-[40px] px-2.5 rounded-kw-sm border border-line text-xs font-medium text-ink-secondary hover:text-ink hover:bg-surface-hover cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'hu' ? 'Lebegő gombok visszaállítása' : 'Reset floating islands'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
