import type { CustomStitch, Gauge, KnittingMode, Lang, KnitDocument, RowAnalysis, SelectionRect, StitchInfo, ViewMode } from './core';

/* ==========================================================================
   Knit Workshop — Knit Engine, CSS↔Canvas Token Bridge, Rendering, Export & Image Import
   ========================================================================== */

export const YARN_LETTERS = 'ABCDEFGHIJKL';

export const BUILTIN_STITCHES: StitchInfo[] = [
  { idx: 0, code: 'k', glyph: '■', titleEn: 'Knit stitch (k)', titleHu: 'Sima szem (k)', uses: 1, makes: 1 },
  { idx: 1, code: 'p', glyph: '•', titleEn: 'Purl stitch (p)', titleHu: 'Fordított szem (p)', uses: 1, makes: 1 },
  { idx: 2, code: 'yo', glyph: '○', titleEn: 'Yarn over (yo)', titleHu: 'Ráhajtás (yo)', uses: 0, makes: 1 },
  { idx: 3, code: 'k2tog', glyph: '/', titleEn: 'Knit 2 together (k2tog)', titleHu: '2 szem simán összekötve jobbra (k2tog)', uses: 2, makes: 1 },
  { idx: 4, code: 'skp', glyph: '\\', titleEn: 'Slip, knit, pass over (skp)', titleHu: 'Átemelt fogyasztás balra (skp)', uses: 2, makes: 1 },
  { idx: 5, code: 'ssk', glyph: '⟍', titleEn: 'Slip, slip, knit (ssk)', titleHu: 'Két átemelt szem simán össze (ssk)', uses: 2, makes: 1 },
  { idx: 6, code: 'kfb', glyph: '⋁', titleEn: 'Knit front and back (kfb, +1)', titleHu: 'Szaporítás 1 szemből 2 (kfb)', uses: 1, makes: 2 },
  { idx: 7, code: 'm1', glyph: 'M', titleEn: 'Make one (m1, +1)', titleHu: 'Keresztszálas szaporítás (m1)', uses: 0, makes: 1 },
  { idx: 8, code: 'sl', glyph: 'V', titleEn: 'Slip stitch (sl)', titleHu: 'Leemelt szem (sl)', uses: 1, makes: 1 },
  { idx: 9, code: 'k3tog', glyph: '∧', titleEn: 'Knit 3 together (k3tog)', titleHu: '3 szem simán összekötve (k3tog)', uses: 3, makes: 1 },
  { idx: 10, code: 'cdd', glyph: '↑', titleEn: 'Centered double decrease (cdd)', titleHu: 'Középre állított dupla fogyasztás (cdd)', uses: 3, makes: 1 },
  { idx: 11, code: 'c4f', glyph: '⟪', titleEn: 'Cable 4 front / 2×2 LC (c4f)', titleHu: '4-szemes balra csavarás (c4f)', uses: 1, makes: 1, span: 4 },
  { idx: 12, code: 'c4b', glyph: '⟫', titleEn: 'Cable 4 back / 2×2 RC (c4b)', titleHu: '4-szemes jobbra csavarás (c4b)', uses: 1, makes: 1, span: 4 },
];

export const GLOSSARY_ENTRIES: Array<{ code: string; en: string; hu: string }> = [
  { code: 'k', en: 'Knit stitch', hu: 'Sima szem' },
  { code: 'p', en: 'Purl stitch', hu: 'Fordított szem' },
  { code: 'yo', en: 'Yarn over (increase +1)', hu: 'Ráhajtás (szaporítás +1)' },
  { code: 'k2tog', en: 'Knit 2 together (right-leaning decrease -1)', hu: 'Két szem simán összekötve (jobbra dőlő fogyasztás -1)' },
  { code: 'skp', en: 'Slip 1, knit 1, pass slipped stitch over (left-leaning decrease -1)', hu: '1 leemel, 1 sima, leemeltet áthúz (balra dőlő fogyasztás -1)' },
  { code: 'ssk', en: 'Slip, slip, knit together through back loops (left-leaning decrease -1)', hu: 'Két szem átemelése után simán összekötve hátulról (balra dőlő fogyasztás -1)' },
  { code: 'p2tog', en: 'Purl 2 together (wrong-side decrease)', hu: 'Két szem fordítottan összekötve (visszáján)' },
  { code: 'ssp', en: 'Slip, slip, purl together through back loops (wrong-side left-leaning decrease)', hu: 'Két szem átemelése és fordítottan összekötése hátulról' },
  { code: 'kfb', en: 'Knit into front and back of same stitch (uses 1, makes 2)', hu: 'Szem elülső és hátsó szárába kötés (1 szemből 2 lesz)' },
  { code: 'm1', en: 'Make one: lift strand between stitches and knit twisted (uses 0, makes 1)', hu: 'Keresztszál felvétele és csavart sima kötése (0-ból 1 szem)' },
  { code: 'sl', en: 'Slip stitch without knitting it', hu: 'Szem leemelése lekötés nélkül' },
  { code: 'k3tog', en: 'Knit 3 together (uses 3, makes 1)', hu: 'Három szem simán összekötve (3-ból 1 szem)' },
  { code: 'cdd', en: 'Centered double decrease: slip 2 together, k1, pass 2 slipped over (uses 3, makes 1)', hu: 'Középre állított dupla fogyasztás (3-ból 1 szem)' },
  { code: 'c4f', en: '2/2 Left Cable (place 2 sts on cable needle in front, k2, k2 from CN)', hu: '2/2 balra dőlő csavarás (2 szem segédtűn előre, 2 sima, majd a segédtűről 2 sima)' },
  { code: 'c4b', en: '2/2 Right Cable (place 2 sts on cable needle in back, k2, k2 from CN)', hu: '2/2 jobbra dőlő csavarás (2 szem segédtűn hátra, 2 sima, majd a segédtűről 2 sima)' },
  { code: 'CO / BO', en: 'Cast on / Bind off', hu: 'Szemfelszedés / Láncolás (levarrás)' },
  { code: 'RS / WS', en: 'Right side / Wrong side', hu: 'Színe / Visszája' },
  { code: 'empty', en: 'No stitch: hatched cell, not knitted', hu: 'Nincs szem: sraffozott cella, nem kerül kötésre' },
];

/* --------------------------------------------------------------------------
   CSS <-> JS Token Bridge (Single Source of Truth from index.css)
   -------------------------------------------------------------------------- */

export interface ChartTheme {
  paperBg: string;
  knittedBedBg: string;
  noStitchBg: string;
  noStitchHatch: string;
  stitchShadow: string;
  gridLine: string;
  gridLineSvg: string;
  boldGridLine: string;
  labelInk: string;
  completedDimOverlay: string;
  symmetryGuide: string;
  floatBadge: string;
  mismatchRowBg: string;
  mismatchBadge: string;
  trackerFill: string;
  trackerStroke: string;
  selectionFill: string;
  selectionStroke: string;
  cursorOuter: string;
  cursorInner: string;
  darkInk: string;
  lightInk: string;
}

const PRINT_DEFAULTS = {
  paper: '#ffffff',
  knitBed: '#EBEBEB',
  accent: '#171717',
  symmetry: '#404040',
  danger: '#B91C1C',
  warning: '#D97706',
  canvas: '#F4F4F5',
  labelInk: '#000000',
  gridSvg: '#525252',
  noStitchBg: '#E5E5E5',
  noStitchHatch: '#404040',
  darkInk: '#000000',
  lightInk: '#ffffff',
} as const;

function parseRgbTuple(cssColor: string): [number, number, number] | null {
  const c = cssColor.trim();
  if (/^#[0-9a-f]{6}$/i.test(c)) {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  if (/^#[0-9a-f]{3}$/i.test(c)) {
    return [parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16)];
  }
  const m = c.match(/^rgba?\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)/i);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return null;
}

function colorWithAlpha(cssColor: string, alpha: number, fallbackRgba: string): string {
  const rgb = parseRgbTuple(cssColor);
  if (rgb) return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
  if (typeof document !== 'undefined') {
    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    const pctx = probe.getContext('2d');
    if (pctx) {
      pctx.fillStyle = cssColor;
      pctx.fillRect(0, 0, 1, 1);
      const d = pctx.getImageData(0, 0, 1, 1).data;
      return `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${alpha})`;
    }
  }
  return fallbackRgba;
}

function readCssToken(varName: string, fallback: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val || fallback;
}

export function resolveChartTheme(mode: 'screen' | 'print' = 'screen'): ChartTheme {
  // Print / SVG / PDF always enforces a clean white-paper profile for yarn color accuracy
  if (mode === 'print') {
    const accent = PRINT_DEFAULTS.accent;
    const danger = PRINT_DEFAULTS.danger;
    return {
      paperBg: PRINT_DEFAULTS.paper,
      knittedBedBg: PRINT_DEFAULTS.knitBed,
      noStitchBg: PRINT_DEFAULTS.noStitchBg,
      noStitchHatch: PRINT_DEFAULTS.noStitchHatch,
      stitchShadow: 'rgba(0, 0, 0, 0.34)',
      gridLine: colorWithAlpha(PRINT_DEFAULTS.gridSvg, 0.55, 'rgba(82, 82, 82, 0.55)'),
      gridLineSvg: PRINT_DEFAULTS.gridSvg,
      boldGridLine: PRINT_DEFAULTS.labelInk,
      labelInk: PRINT_DEFAULTS.labelInk,
      completedDimOverlay: colorWithAlpha(PRINT_DEFAULTS.canvas, 0.62, 'rgba(244, 244, 245, 0.62)'),
      symmetryGuide: PRINT_DEFAULTS.symmetry,
      floatBadge: PRINT_DEFAULTS.warning,
      mismatchRowBg: colorWithAlpha(danger, 0.16, 'rgba(185, 28, 28, 0.16)'),
      mismatchBadge: danger,
      trackerFill: colorWithAlpha(accent, 0.14, 'rgba(23, 23, 23, 0.14)'),
      trackerStroke: accent,
      selectionFill: colorWithAlpha(accent, 0.12, 'rgba(23, 23, 23, 0.12)'),
      selectionStroke: accent,
      cursorOuter: danger,
      cursorInner: PRINT_DEFAULTS.lightInk,
      darkInk: PRINT_DEFAULTS.darkInk,
      lightInk: PRINT_DEFAULTS.lightInk,
    };
  }

  // On screen, the chart paper itself is always white, so paper-drawn strokes/guides stay black/dark-gray even in UI dark mode.
  const paperBg = PRINT_DEFAULTS.paper;
  const knittedBedBg = readCssToken('--kw-knit-bed', '#EBEBEB');
  const paperAccent = '#000000';
  const paperSymmetry = '#404040';
  const danger = readCssToken('--kw-danger', '#BE123C');
  const warning = readCssToken('--kw-warning', '#B45309');

  return {
    paperBg,
    knittedBedBg,
    noStitchBg: '#E5E5E5',
    noStitchHatch: '#404040',
    stitchShadow: 'rgba(0, 0, 0, 0.34)',
    gridLine: 'rgba(0, 0, 0, 0.28)',
    gridLineSvg: PRINT_DEFAULTS.gridSvg,
    boldGridLine: '#171717',
    labelInk: '#000000',
    completedDimOverlay: 'rgba(255, 255, 255, 0.65)',
    symmetryGuide: paperSymmetry,
    floatBadge: warning,
    mismatchRowBg: colorWithAlpha(danger, 0.16, 'rgba(190, 18, 60, 0.16)'),
    mismatchBadge: danger,
    trackerFill: 'rgba(0, 0, 0, 0.14)',
    trackerStroke: paperAccent,
    selectionFill: 'rgba(0, 0, 0, 0.12)',
    selectionStroke: paperAccent,
    cursorOuter: danger,
    cursorInner: PRINT_DEFAULTS.lightInk,
    darkInk: PRINT_DEFAULTS.darkInk,
    lightInk: PRINT_DEFAULTS.lightInk,
  };
}

/* --------------------------------------------------------------------------
   Stitch Logic & Analysis
   -------------------------------------------------------------------------- */

export function getAllStitches(custom: CustomStitch[]): StitchInfo[] {
  const list: StitchInfo[] = [...BUILTIN_STITCHES];
  custom.forEach((c, i) => {
    list.push({
      idx: BUILTIN_STITCHES.length + i,
      code: c.n,
      glyph: c.g,
      titleEn: `${c.t} (uses ${c.u}, makes ${c.m})`,
      titleHu: `${c.t} (felhasznál: ${c.u}, ad: ${c.m})`,
      uses: c.u,
      makes: c.m,
      isCustom: true,
    });
  });
  return list;
}

export function isWrongSide(rowNum: number, mode: KnittingMode): boolean {
  return mode === 'flat' && rowNum % 2 === 0;
}

export function isRightToLeft(rowNum: number, mode: KnittingMode): boolean {
  return mode === 'round' || rowNum % 2 === 1;
}

export function stitchCodeForRow(q: number, rowNum: number, mode: KnittingMode, stitches: StitchInfo[]): string {
  const ws = isWrongSide(rowNum, mode);
  if (ws) {
    if (q === 0) return 'p';
    if (q === 1) return 'k';
    if (q === 2) return 'yo';
    if (q === 3) return 'p2tog';
    if (q === 4 || q === 5) return 'ssp';
  }
  return stitches[q]?.code ?? 'k';
}

export function codeToStitchIndex(code: string, rowNum: number, mode: KnittingMode, stitches: StitchInfo[]): number {
  const lc = code.toLowerCase();
  const ws = isWrongSide(rowNum, mode);
  if (ws) {
    if (lc === 'p') return 0;
    if (lc === 'k') return 1;
    if (lc === 'yo') return 2;
    if (lc === 'p2tog') return 3;
    if (lc === 'ssp') return 4;
  }
  const found = stitches.find((s) => s.code.toLowerCase() === lc);
  if (found) return found.idx;
  if (lc === 'p2tog') return 3;
  if (lc === 'ssp') return 4;
  return 0;
}

export function swapHorizontalStitch(q: number): number {
  if (q === 3) return 4;
  if (q === 4) return 3;
  if (q === 5) return 3;
  if (q === 11) return 12;
  if (q === 12) return 11;
  return q;
}

export function rowToInstructions(
  rowNum: number,
  grid: number[][],
  sy: number[][],
  cols: number,
  rows: number,
  mode: KnittingMode,
  stitches: StitchInfo[],
  soloYarn: boolean
): { text: string; usedCodes: Set<string> } {
  const r = rows - rowNum;
  const indices = Array.from({ length: cols }, (_, i) => i);
  if (isRightToLeft(rowNum, mode)) indices.reverse();

  const parts: string[] = [];
  const usedCodes = new Set<string>();
  let i = 0;

  while (i < indices.length) {
    const colIdx = indices[i];
    const v = grid[r][colIdx];
    const q = sy[r][colIdx];
    const st = stitches[q];
    let j = i;
    while (j < indices.length && grid[r][indices[j]] === v && sy[r][indices[j]] === q) {
      j++;
    }
    const runLen = j - i;
    const isNoStitch = v < 0 && q === 0;
    if (isNoStitch) {
      parts.push(`skip${runLen}`);
    } else {
      const code = stitchCodeForRow(q, rowNum, mode, stitches);
      usedCodes.add(code);
      const yarnTag = v < 0 ? ' empty' : soloYarn ? '' : ` ${YARN_LETTERS[v]}`;
      if (st?.span && st.span > 1 && runLen % st.span === 0) {
        const repeats = runLen / st.span;
        parts.push(`${repeats > 1 ? `${repeats}× ` : ''}${code}${yarnTag}`);
      } else {
        parts.push(`${code}${runLen}${yarnTag}`);
      }
    }
    i = j;
  }

  return { text: parts.join(', '), usedCodes };
}

export interface RowStepChunk {
  yarnIdx: number;
  count: number;
  code: string;
  labelHu: string;
  labelEn: string;
  isNoStitch: boolean;
  isCableRepeat?: boolean;
}

const PLAIN_STITCH_LABELS: Record<string, { hu: string; en: string }> = {
  k: { hu: 'sima', en: 'knit' },
  p: { hu: 'fordított', en: 'purl' },
  yo: { hu: 'ráhajtás', en: 'yarn over' },
  k2tog: { hu: '2 simán össze', en: 'k2tog' },
  p2tog: { hu: '2 ford. össze', en: 'p2tog' },
  skp: { hu: 'átemelt fogy.', en: 'skp' },
  ssk: { hu: '2 átemelt össze', en: 'ssk' },
  ssp: { hu: '2 ford. átem. össze', en: 'ssp' },
  kfb: { hu: 'szap. (1→2)', en: 'kfb (+1)' },
  m1: { hu: 'keresztszál (+1)', en: 'm1 (+1)' },
  sl: { hu: 'leemelt', en: 'slip' },
  k3tog: { hu: '3 simán össze', en: 'k3tog' },
  cdd: { hu: 'dupla fogy.', en: 'cdd' },
  c4f: { hu: '4-es bal csav.', en: 'c4f cable' },
  c4b: { hu: '4-es jobb csav.', en: 'c4b cable' },
};

export function rowToStepChunks(
  rowNum: number,
  grid: number[][],
  sy: number[][],
  cols: number,
  rows: number,
  mode: KnittingMode,
  stitches: StitchInfo[]
): RowStepChunk[] {
  const r = rows - rowNum;
  if (r < 0 || r >= rows) return [];
  const indices = Array.from({ length: cols }, (_, i) => i);
  if (isRightToLeft(rowNum, mode)) indices.reverse();

  const chunks: RowStepChunk[] = [];
  let i = 0;

  while (i < indices.length) {
    const colIdx = indices[i];
    const v = grid[r][colIdx];
    const q = sy[r][colIdx];
    const st = stitches[q];
    let j = i;
    while (j < indices.length && grid[r][indices[j]] === v && sy[r][indices[j]] === q) {
      j++;
    }
    const runLen = j - i;
    const isNoStitch = v < 0 && q === 0;
    if (isNoStitch) {
      chunks.push({
        yarnIdx: -1,
        count: runLen,
        code: 'skip',
        labelHu: 'kihagyva',
        labelEn: 'no stitch',
        isNoStitch: true,
      });
    } else {
      const code = stitchCodeForRow(q, rowNum, mode, stitches);
      const mapped = PLAIN_STITCH_LABELS[code];
      const isCableRepeat = Boolean(st?.span && st.span > 1 && runLen % st.span === 0);
      chunks.push({
        yarnIdx: v,
        count: isCableRepeat && st?.span ? runLen / st.span : runLen,
        code,
        labelHu: mapped ? mapped.hu : code,
        labelEn: mapped ? mapped.en : code,
        isNoStitch: false,
        isCableRepeat,
      });
    }
    i = j;
  }

  return chunks;
}

export function analyzePattern(
  grid: number[][],
  sy: number[][],
  cols: number,
  rows: number,
  mode: KnittingMode,
  stitches: StitchInfo[],
  lang: Lang,
  floatLimit = 5
): {
  rows: RowAnalysis[];
  mismatchRows: number[];
  floatRows: number[];
  multiColorRows: number[];
  totalStitches: number;
} {
  const madeArr: number[] = [];
  const usesArr: number[] = [];
  const maxFloatArr: number[] = [];
  const colorsUsedArr: number[] = [];

  for (let n = 1; n <= rows; n++) {
    const r = rows - n;
    let made = 0;
    let uses = 0;
    let maxFloat = 0;
    let curYarn = -2;
    let curRun = 0;
    const rowYarns = new Set<number>();

    for (let k = 0; k < cols; k++) {
      const v = grid[r][k];
      const q = sy[r][k];
      if (v < 0 && q === 0) {
        curRun = 0;
        curYarn = -2;
        continue;
      }
      const st = stitches[q] ?? stitches[0];
      made += st.makes;
      uses += st.uses;
      if (v >= 0) {
        rowYarns.add(v);
        if (v === curYarn) {
          curRun++;
        } else {
          curYarn = v;
          curRun = 1;
        }
        if (curRun > maxFloat) maxFloat = curRun;
      }
    }

    madeArr.push(made);
    usesArr.push(uses);
    maxFloatArr.push(rowYarns.size > 1 ? maxFloat : 0);
    colorsUsedArr.push(rowYarns.size);
  }

  const rowWord = mode === 'round' ? (lang === 'hu' ? 'kör' : 'round') : (lang === 'hu' ? 'sor' : 'row');
  const analysis: RowAnalysis[] = [];
  const mismatchRows: number[] = [];
  const floatRows: number[] = [];
  const multiColorRows: number[] = [];
  let totalStitches = 0;

  for (let n = 1; n <= rows; n++) {
    const made = madeArr[n - 1];
    const uses = usesArr[n - 1];
    const maxFloat = maxFloatArr[n - 1];
    const colorsUsed = colorsUsedArr[n - 1];
    totalStitches += made;

    let status: RowAnalysis['status'] = 'ok';
    let message = lang === 'hu' ? 'Rendben' : 'OK';

    if (made === 0 && uses === 0) {
      status = 'empty';
      message = lang === 'hu' ? `üres ${rowWord}` : `empty ${rowWord}`;
    } else if (n > 1 && madeArr[n - 2] > 0 && uses !== madeArr[n - 2]) {
      status = 'mismatch';
      mismatchRows.push(n);
      message =
        lang === 'hu'
          ? `${uses} szemet használ, de az alatta lévő ${rowWord} ${madeArr[n - 2]} szemet adott`
          : `needs ${uses} sts, below ${rowWord} made ${madeArr[n - 2]}`;
    }

    if (maxFloat > floatLimit) floatRows.push(n);
    if (colorsUsed >= 3) multiColorRows.push(n);

    analysis.push({ rowNum: n, made, uses, status, message, maxFloat, colorsUsed });
  }

  return { rows: analysis, mismatchRows, floatRows, multiColorRows, totalStitches };
}

export function parseInstructionsToGrid(
  text: string,
  cols: number,
  rows: number,
  palLength: number,
  mode: KnittingMode,
  stitches: StitchInfo[]
): { parsed: Array<{ rowNum: number; cells: Array<[number, number]> }>; errors: string[] } {
  const knownCodes = new Set(stitches.map((s) => s.code.toLowerCase()));
  knownCodes.add('p2tog');
  knownCodes.add('ssp');

  const expandSegment = (str: string, rowNum: number): Array<[number, number]> => {
    let s = str.replace(/\s+/g, ' ');
    let changed = true;
    while (changed) {
      changed = false;
      s = s.replace(/\[([^\[\]]*)\]\s*(?:x|\u00d7|times)\s*(\d+)/gi, (_, body, countStr) => {
        changed = true;
        const n = Math.min(Number(countStr), 300);
        if (body.length * n > 200000) throw new Error('Repeat is too long');
        return Array(n).fill(body).join(',');
      });
    }

    const out: Array<[number, number]> = [];
    for (const token of s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)) {
      let sym: string | null = null;
      let col = 0;
      let cnt = 1;

      const mulMatch = token.match(/^(\d+)\s*[×x]\s*([a-z][a-z0-9]*)(?:\s+(empty|[A-L]))?$/i);
      const explicitMul = token.match(/^(?:([a-z][a-z0-9]*)\u00b7)?(empty|[A-L])\s*[\u00d7x]\s*(\d+)$/i);

      if (mulMatch) {
        const repeatTimes = Number(mulMatch[1]);
        sym = mulMatch[2].toLowerCase();
        if (!knownCodes.has(sym)) throw new Error(`Unknown stitch "${sym}"`);
        const stObj = stitches.find((st) => st.code.toLowerCase() === sym);
        cnt = repeatTimes * (stObj?.span || 1);
        if (mulMatch[3]) {
          col = mulMatch[3].toLowerCase() === 'empty' ? -1 : YARN_LETTERS.indexOf(mulMatch[3].toUpperCase());
        }
      } else if (explicitMul) {
        sym = explicitMul[1] ? explicitMul[1].toLowerCase() : null;
        col = explicitMul[2].toLowerCase() === 'empty' ? -1 : YARN_LETTERS.indexOf(explicitMul[2].toUpperCase());
        cnt = Number(explicitMul[3]);
      } else {
        const words = token.toLowerCase().split(/\s+/);
        const head = words[0];
        const skipMatch = head.match(/^skip(\d+)$/);
        if (skipMatch) {
          col = -1;
          cnt = Number(skipMatch[1]);
        } else {
          const numMatch = head.match(/^([a-z][a-z0-9]*?)(\d+)$/);
          if (knownCodes.has(head)) {
            sym = head;
            const stObj = stitches.find((st) => st.code.toLowerCase() === head);
            cnt = stObj?.span || 1;
          } else if (numMatch && knownCodes.has(numMatch[1])) {
            sym = numMatch[1];
            cnt = Number(numMatch[2]);
          } else {
            throw new Error(`Unknown command "${token}"`);
          }
          col = 0;
          if (words[1]) {
            if (words[1] === 'empty') col = -1;
            else if (/^[a-l]$/.test(words[1])) col = YARN_LETTERS.indexOf(words[1].toUpperCase());
            else throw new Error(`Unknown yarn "${words[1]}"`);
          }
          if (words.length > 2) throw new Error(`Unexpected tokens in "${token}"`);
        }
      }

      if (sym && !knownCodes.has(sym)) throw new Error(`Unknown stitch "${sym}"`);
      if (col >= palLength) throw new Error(`Yarn ${YARN_LETTERS[col]} does not exist in current palette`);

      const syIdx = sym ? codeToStitchIndex(sym, rowNum, mode, stitches) : 0;
      for (let q = 0; q < cnt && out.length < 400; q++) {
        out.push([col, syIdx]);
      }
    }
    return out;
  };

  const parsed: Array<{ rowNum: number; cells: Array<[number, number]> }> = [];
  const errors: string[] = [];

  for (const line of text.split('\n').slice(0, 2000)) {
    if (line.length > 4000) {
      if (/^\s*(?:row|round|sor|k[oö]r)\b/i.test(line)) {
        errors.push('A line exceeds 4000 characters.');
      }
      continue;
    }
    const m = line.match(/^\s*(?:row|round|sor|k[oö]r)\s+(\d+)\s*(?:\([^)]*\))?\s*:(.*)$/i);
    if (!m) continue;
    const rowNum = Number(m[1]);
    if (rowNum < 1 || rowNum > rows) {
      errors.push(`Row ${rowNum}: grid only has ${rows} rows.`);
      continue;
    }

    try {
      let cells: Array<[number, number]>;
      const starMatch = m[2].match(/^(.*?)\*(.*?)[;,]?\s*rep(?:eat)?\s+from\s*\*(?:\s*to end)?\s*,?(.*)$/i);
      if (starMatch) {
        const pre = expandSegment(starMatch[1], rowNum);
        const rep = expandSegment(starMatch[2], rowNum);
        const post = expandSegment(starMatch[3], rowNum);
        const need = cols - pre.length - post.length;
        if (!rep.length || need < 0 || need % rep.length !== 0) {
          throw new Error(`Repeat of ${rep.length} sts does not fit into ${need} remaining sts`);
        }
        cells = pre.concat(...Array(need / rep.length).fill(rep), post);
      } else {
        cells = expandSegment(m[2], rowNum);
      }

      if (cells.length !== cols) {
        errors.push(`Row ${rowNum} adds up to ${cells.length} stitches, grid width is ${cols}.`);
      } else {
        if (isRightToLeft(rowNum, mode)) cells.reverse();
        parsed.push({ rowNum, cells });
      }
    } catch (err) {
      errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { parsed, errors };
}

export function estimateYarnUsage(
  stitchCounts: number[],
  gauge: Gauge
): Array<{ stitches: number; meters: number; grams: number }> {
  const stWidthMm = 100 / Math.max(5, gauge.s);
  const rowHeightMm = 100 / Math.max(5, gauge.r);
  const mmPerStitch = 2.6 * (stWidthMm + rowHeightMm);
  const metersPerGram = Math.max(1.2, Math.min(8, (gauge.s / 22) * 2.5));

  return stitchCounts.map((count) => {
    const meters = (count * mmPerStitch) / 1000;
    const grams = meters / metersPerGram;
    return {
      stitches: count,
      meters: Number(meters.toFixed(1)),
      grams: Number(grams.toFixed(1)),
    };
  });
}

export function checkStandaloneRow(
  rowText: string,
  onNeedle: number,
  customStitches: CustomStitch[]
): { ok: boolean; error?: string; used: number; made: number } {
  const stitches = getAllStitches(customStitches);
  const opMap = new Map<string, [number, number]>();
  stitches.forEach((s) => opMap.set(s.code.toLowerCase(), [s.uses, s.makes]));
  opMap.set('p2tog', [2, 1]);
  opMap.set('ssp', [2, 1]);
  const keys = [...opMap.keys()].sort((a, b) => b.length - a.length);

  let used = 0;
  let made = 0;
  const bad: string[] = [];

  for (const token of rowText
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)) {
    if (opMap.has(token)) {
      const [u, m] = opMap.get(token)!;
      used += u;
      made += m;
    } else {
      const match = keys.find((k) => token.startsWith(k) && /^\d+$/.test(token.slice(k.length)));
      if (match) {
        const n = Number(token.slice(match.length));
        const [u, m] = opMap.get(match)!;
        used += u * n;
        made += m * n;
      } else {
        bad.push(token);
      }
    }
  }

  if (bad.length) return { ok: false, error: `Unknown symbol(s): ${bad.join(', ')}`, used, made };
  if (used !== onNeedle) {
    return {
      ok: false,
      error: `Consumes ${used} stitches, but ${onNeedle} are on the needle (${Math.abs(used - onNeedle)} ${used > onNeedle ? 'short' : 'left over'}).`,
      used,
      made,
    };
  }
  return { ok: true, used, made };
}

/* --------------------------------------------------------------------------
   Canvas Rendering
   -------------------------------------------------------------------------- */

export const CHART_MARGIN = 84;

export function contrastInk(hex: string, darkInk: string = PRINT_DEFAULTS.darkInk, lightInk: string = PRINT_DEFAULTS.lightInk): string {
  const rgb = parseRgbTuple(hex);
  if (!rgb) return darkInk;
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
  return lum > 0.179 ? darkInk : lightInk;
}

export function calcCellDims(cols: number, rows: number, gauge: Gauge, zoom: number, margin: number): [number, number] {
  const w = Math.max(4, 24 * zoom);
  const h = (w * gauge.s) / gauge.r;
  const k = Math.min(1, Math.sqrt(1.4e7 / ((cols * w + 2 * margin) * (rows * h + 2 * margin))));
  return [w * k, h * k];
}

function drawKnittedStitch(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  col: string,
  s: number,
  stitches: StitchInfo[],
  theme: ChartTheme
) {
  if (s >= 13) {
    c.fillStyle = col;
    c.font = `bold ${Math.round(Math.min(w, h) * 0.65)}px sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(stitches[s]?.glyph ?? '?', x + w / 2, y + h / 2);
    return;
  }

  c.lineCap = 'round';
  c.lineJoin = 'round';
  const trace = () => {
    c.beginPath();
    if (s === 1) {
      c.moveTo(x + w * 0.18, y + h * 0.5);
      c.quadraticCurveTo(x + w * 0.5, y + h * 0.34, x + w * 0.82, y + h * 0.5);
    } else if (s === 2) {
      c.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.26, 0, Math.PI * 2);
    } else if (s === 3) {
      c.moveTo(x + w * 0.2, y + h * 0.86);
      c.lineTo(x + w * 0.8, y + h * 0.14);
    } else if (s === 4 || s === 5) {
      c.moveTo(x + w * 0.2, y + h * 0.14);
      c.lineTo(x + w * 0.8, y + h * 0.86);
    } else if (s === 6) {
      c.moveTo(x + w * 0.2, y + h * 0.15);
      c.lineTo(x + w * 0.5, y + h * 0.88);
      c.lineTo(x + w * 0.8, y + h * 0.15);
      c.moveTo(x + w * 0.5, y + h * 0.88);
      c.lineTo(x + w * 0.5, y + h * 0.2);
    } else if (s === 7) {
      c.moveTo(x + w * 0.25, y + h * 0.82);
      c.lineTo(x + w * 0.5, y + h * 0.2);
      c.lineTo(x + w * 0.75, y + h * 0.82);
    } else if (s === 8) {
      c.moveTo(x + w * 0.26, y + h * 0.05);
      c.lineTo(x + w * 0.5, y + h * 0.95);
      c.lineTo(x + w * 0.74, y + h * 0.05);
    } else if (s === 9 || s === 10) {
      c.moveTo(x + w * 0.2, y + h * 0.84);
      c.lineTo(x + w * 0.5, y + h * 0.14);
      c.lineTo(x + w * 0.8, y + h * 0.84);
      c.moveTo(x + w * 0.5, y + h * 0.14);
      c.lineTo(x + w * 0.5, y + h * 0.88);
    } else {
      c.moveTo(x + w * 0.2, y + h * 0.12);
      c.lineTo(x + w * 0.5, y + h * 0.88);
      c.lineTo(x + w * 0.8, y + h * 0.12);
    }
  };
  trace();
  c.strokeStyle = theme.stitchShadow;
  c.lineWidth = Math.max(1.2, w * 0.42);
  c.stroke();
  trace();
  c.strokeStyle = col;
  c.lineWidth = Math.max(1, w * 0.3);
  c.stroke();
}

function drawCableCrossings(
  c: CanvasRenderingContext2D,
  sy: number[][],
  grid: number[][],
  pal: string[],
  cols: number,
  rows: number,
  w: number,
  h: number,
  mode: ViewMode,
  theme: ChartTheme
) {
  for (let r = 0; r < rows; r++) {
    let k = 0;
    while (k < cols) {
      const q = sy[r][k];
      if ((q === 11 || q === 12) && k + 3 < cols && sy[r][k + 1] === q && sy[r][k + 2] === q && sy[r][k + 3] === q) {
        const x = k * w;
        const y = r * h;
        const spanW = 4 * w;
        const yarnIdx = grid[r][k];
        const bgColor = yarnIdx >= 0 ? pal[yarnIdx] : theme.paperBg;
        const fgColor = mode === 'g' ? (yarnIdx >= 0 ? contrastInk(bgColor, theme.darkInk, theme.lightInk) : theme.labelInk) : bgColor;

        if (mode === 'g') {
          c.fillStyle = bgColor;
          c.fillRect(x, y, spanW, h);
        } else {
          c.fillStyle = theme.knittedBedBg;
          c.fillRect(x, y, spanW, h);
        }

        c.save();
        c.lineCap = 'round';
        const lw = Math.max(1.5, Math.min(w, h) * 0.16);
        const padX = w * 0.35;
        const padY = h * 0.18;

        const drawUnder = () => {
          c.strokeStyle = fgColor;
          c.globalAlpha = 0.45;
          c.lineWidth = lw;
          c.beginPath();
          if (q === 11) {
            c.moveTo(x + padX, y + h - padY);
            c.lineTo(x + spanW - padX, y + padY);
          } else {
            c.moveTo(x + spanW - padX, y + h - padY);
            c.lineTo(x + padX, y + padY);
          }
          c.stroke();
          c.globalAlpha = 1;
        };

        const drawOver = () => {
          c.strokeStyle = mode === 'g' ? bgColor : theme.knittedBedBg;
          c.lineWidth = lw * 2.2;
          c.beginPath();
          if (q === 11) {
            c.moveTo(x + spanW - padX, y + h - padY);
            c.lineTo(x + padX, y + padY);
          } else {
            c.moveTo(x + padX, y + h - padY);
            c.lineTo(x + spanW - padX, y + padY);
          }
          c.stroke();

          c.strokeStyle = fgColor;
          c.lineWidth = lw;
          c.beginPath();
          if (q === 11) {
            c.moveTo(x + spanW - padX, y + h - padY);
            c.lineTo(x + padX, y + padY);
          } else {
            c.moveTo(x + padX, y + h - padY);
            c.lineTo(x + spanW - padX, y + padY);
          }
          c.stroke();
        };

        drawUnder();
        drawOver();
        c.restore();
        k += 4;
      } else {
        k++;
      }
    }
  }
}

export function drawCells(
  c: CanvasRenderingContext2D,
  grid: number[][],
  sy: number[][],
  pal: string[],
  cols: number,
  rows: number,
  w: number,
  h: number,
  mode: ViewMode,
  stitches: StitchInfo[],
  theme: ChartTheme = resolveChartTheme('screen'),
  showYarnLetters = false
) {
  c.font = `bold ${Math.round(Math.min(w, h) * 0.6)}px Arial, Helvetica, sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';

  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const v = grid[r][k];
      const s = sy[r][k];
      const x = k * w;
      const y = r * h;
      if (mode === 'g') {
        if (v < 0 && s === 0) {
          c.fillStyle = theme.noStitchBg;
          c.fillRect(x, y, w, h);
          if (w >= 8) {
            c.strokeStyle = theme.noStitchHatch;
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(x + 2, y + h - 2);
            c.lineTo(x + w - 2, y + 2);
            c.stroke();
          }
        } else {
          const cellBg = v < 0 ? theme.paperBg : pal[v] ?? theme.paperBg;
          const ink = v < 0 ? theme.labelInk : contrastInk(cellBg, theme.darkInk, theme.lightInk);
          c.fillStyle = cellBg;
          c.fillRect(x, y, w, h);
          if (s > 0) {
            c.fillStyle = ink;
            c.font = `bold ${Math.round(Math.min(w, h) * 0.6)}px Arial, Helvetica, sans-serif`;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(stitches[s]?.glyph ?? '?', x + w / 2, y + h / 2 + 1);
            if (showYarnLetters && v >= 0 && w >= 18 && h >= 16) {
              c.save();
              c.globalAlpha = 0.85;
              c.font = `bold ${Math.max(8, Math.round(Math.min(w, h) * 0.28))}px "JetBrains Mono", monospace`;
              c.textAlign = 'left';
              c.textBaseline = 'top';
              c.fillText(YARN_LETTERS[v] ?? '', x + 2, y + 1.5);
              c.restore();
            }
          } else if (showYarnLetters && v >= 0 && w >= 14 && h >= 12) {
            c.save();
            c.globalAlpha = 0.82;
            c.fillStyle = ink;
            c.font = `bold ${Math.max(9, Math.round(Math.min(w, h) * 0.44))}px "JetBrains Mono", monospace`;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(YARN_LETTERS[v] ?? '', x + w / 2, y + h / 2 + 0.5);
            c.restore();
          }
        }
      } else if (v >= 0) {
        drawKnittedStitch(c, x, y, w, h, pal[v] ?? theme.labelInk, s, stitches, theme);
      }
    }
  }

  drawCableCrossings(c, sy, grid, pal, cols, rows, w, h, mode, theme);
}

export interface GhostPreviewData {
  r0: number;
  k0: number;
  g: number[][];
  s: number[][];
}

export interface RenderChartOptions {
  grid: number[][];
  sy: number[][];
  pal: string[];
  cols: number;
  rows: number;
  w: number;
  h: number;
  mode: ViewMode;
  margin: number;
  knittedMode: KnittingMode;
  stitches: StitchInfo[];
  cursor?: { r: number; k: number } | null;
  selection?: SelectionRect | null;
  trackerRow?: number;
  dimCompleted?: boolean;
  mismatchRows?: Set<number>;
  floatRows?: Set<number>;
  symX?: boolean;
  symY?: boolean;
  showGuides?: boolean;
  showYarnLetters?: boolean;
  highlightSym?: number | null;
  highlightYarn?: number | null;
  ghostPreview?: GhostPreviewData | null;
  chartTheme?: ChartTheme;
}

export function renderChartToCanvas(c: CanvasRenderingContext2D, opts: RenderChartOptions) {
  const {
    grid,
    sy,
    pal,
    cols,
    rows,
    w,
    h,
    mode,
    margin,
    knittedMode,
    stitches,
    cursor,
    selection,
    trackerRow = 0,
    dimCompleted = false,
    mismatchRows = new Set(),
    floatRows = new Set(),
    symX = false,
    symY = false,
    showGuides = true,
    showYarnLetters = false,
    highlightSym = null,
    highlightYarn = null,
    ghostPreview = null,
    chartTheme = resolveChartTheme('screen'),
  } = opts;

  c.fillStyle = chartTheme.paperBg;
  c.fillRect(0, 0, cols * w + 2 * margin, rows * h + 2 * margin);
  c.save();
  c.translate(margin, margin);

  if (mode === 'k') {
    c.fillStyle = chartTheme.knittedBedBg;
    c.fillRect(0, 0, cols * w, rows * h);
  }

  drawCells(c, grid, sy, pal, cols, rows, w, h, mode, stitches, chartTheme, showYarnLetters);

  if (ghostPreview && mode === 'g') {
    c.save();
    c.globalAlpha = 0.72;
    const gh = ghostPreview.g.length;
    const gw = ghostPreview.g[0]?.length ?? 0;
    for (let gr = 0; gr < gh; gr++) {
      for (let gk = 0; gk < gw; gk++) {
        const rr = ghostPreview.r0 + gr;
        const kk = ghostPreview.k0 + gk;
        if (rr < 0 || kk < 0 || rr >= rows || kk >= cols) continue;
        const gv = ghostPreview.g[gr][gk];
        const gs = ghostPreview.s[gr]?.[gk] ?? 0;
        const gx = kk * w;
        const gy = rr * h;
        const gBg = gv >= 0 && gv < pal.length ? pal[gv] : chartTheme.paperBg;
        c.fillStyle = gBg;
        c.fillRect(gx, gy, w, h);
        if (gs > 0) {
          c.fillStyle = gv < 0 ? chartTheme.labelInk : contrastInk(gBg, chartTheme.darkInk, chartTheme.lightInk);
          c.font = `bold ${Math.round(Math.min(w, h) * 0.6)}px Arial, Helvetica, sans-serif`;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(stitches[gs]?.glyph ?? '?', gx + w / 2, gy + h / 2 + 1);
        }
      }
    }
    c.globalAlpha = 1;
    c.setLineDash([4, 3]);
    c.strokeStyle = chartTheme.trackerStroke;
    c.lineWidth = 2.5;
    const visW = Math.min(gw, cols - ghostPreview.k0) * w;
    const visH = Math.min(gh, rows - ghostPreview.r0) * h;
    if (visW > 0 && visH > 0) {
      c.strokeRect(ghostPreview.k0 * w + 1, ghostPreview.r0 * h + 1, visW - 2, visH - 2);
    }
    c.restore();
  }

  if (highlightSym !== null || highlightYarn !== null) {
    c.save();
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const matchSym = highlightSym === null || sy[r][k] === highlightSym;
        const matchYarn = highlightYarn === null || grid[r][k] === highlightYarn;
        if (matchSym && matchYarn) {
          c.strokeStyle = chartTheme.trackerStroke;
          c.lineWidth = 2.4;
          c.strokeRect(k * w + 1.5, r * h + 1.5, Math.max(2, w - 3), Math.max(2, h - 3));
        } else {
          c.fillStyle = 'rgba(255, 255, 255, 0.56)';
          c.fillRect(k * w, r * h, w, h);
        }
      }
    }
    c.restore();
  }

  if (dimCompleted && trackerRow > 1 && trackerRow <= rows) {
    const startRowIdx = rows - trackerRow + 1;
    if (startRowIdx < rows) {
      c.fillStyle = chartTheme.completedDimOverlay;
      c.fillRect(0, startRowIdx * h, cols * w, (rows - startRowIdx) * h);
    }
  }

  if (mode === 'g') {
    c.strokeStyle = chartTheme.gridLine;
    c.lineWidth = 1;
    c.beginPath();
    for (let k = 0; k <= cols; k++) {
      c.moveTo(k * w + 0.5, 0);
      c.lineTo(k * w + 0.5, rows * h);
    }
    for (let r = 0; r <= rows; r++) {
      c.moveTo(0, r * h + 0.5);
      c.lineTo(cols * w, r * h + 0.5);
    }
    c.stroke();

    c.strokeStyle = chartTheme.boldGridLine;
    c.lineWidth = 1.5;
    c.beginPath();
    for (let n = 0; n <= cols; n += 5) {
      if (n % 10 === 0) continue;
      c.moveTo((cols - n) * w, 0);
      c.lineTo((cols - n) * w, rows * h);
    }
    for (let n = 0; n <= rows; n += 5) {
      if (n % 10 === 0) continue;
      c.moveTo(0, (rows - n) * h);
      c.lineTo(cols * w, (rows - n) * h);
    }
    c.stroke();

    c.strokeStyle = chartTheme.boldGridLine;
    c.lineWidth = 2.5;
    c.beginPath();
    for (let n = 0; n <= cols; n += 10) {
      c.moveTo((cols - n) * w, 0);
      c.lineTo((cols - n) * w, rows * h);
    }
    for (let n = 0; n <= rows; n += 10) {
      c.moveTo(0, (rows - n) * h);
      c.lineTo(cols * w, (rows - n) * h);
    }
    c.stroke();

    c.fillStyle = chartTheme.labelInk;
    c.font = 'bold 14px "JetBrains Mono", monospace';
    c.textBaseline = 'middle';
    c.textAlign = 'center';
    for (let k = 0; k < cols; k++) {
      const n = cols - k;
      if (n === 1 || n % 5 === 0) {
        c.fillText(String(n), k * w + w / 2, rows * h + 20);
      }
    }
    for (let r = 0; r < rows; r++) {
      const n = rows - r;
      if (h < 15 && n % 5 !== 0 && n !== 1) continue;
      if (isRightToLeft(n, knittedMode)) {
        c.textAlign = 'left';
        c.fillText(`← ${n}`, cols * w + 9, r * h + h / 2);
      } else {
        c.textAlign = 'right';
        c.fillText(`${n} →`, -9, r * h + h / 2);
      }
    }
  }

  if (showGuides) {
    if (symX) {
      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = chartTheme.symmetryGuide;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo((cols * w) / 2, 0);
      c.lineTo((cols * w) / 2, rows * h);
      c.stroke();
      c.restore();
    }
    if (symY) {
      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = chartTheme.symmetryGuide;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, (rows * h) / 2);
      c.lineTo(cols * w, (rows * h) / 2);
      c.stroke();
      c.restore();
    }

    floatRows.forEach((n) => {
      if (mismatchRows.has(n)) return;
      const y = (rows - n) * h + h / 2;
      const badgeX = -margin + 15;
      c.fillStyle = chartTheme.floatBadge;
      c.beginPath();
      c.arc(badgeX, y, 9, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = chartTheme.lightInk;
      c.font = 'bold 12px "JetBrains Mono", monospace';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('F', badgeX, y + 0.5);
    });

    if (mode === 'g') {
      mismatchRows.forEach((n) => {
        const y = (rows - n) * h + h / 2;
        const badgeX = -margin + 15;
        c.fillStyle = chartTheme.mismatchRowBg;
        c.fillRect(0, (rows - n) * h, cols * w, h);
        c.fillStyle = chartTheme.mismatchBadge;
        c.beginPath();
        c.arc(badgeX, y, 9.5, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = chartTheme.lightInk;
        c.font = 'bold 12.5px "JetBrains Mono", monospace';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('!', badgeX, y + 0.5);
      });
    }

    if (trackerRow > 0 && trackerRow <= rows) {
      const y = (rows - trackerRow) * h;
      c.fillStyle = chartTheme.trackerFill;
      c.fillRect(0, y, cols * w, h);
      c.strokeStyle = chartTheme.trackerStroke;
      c.lineWidth = 3;
      c.strokeRect(1.5, y + 1.5, cols * w - 3, h - 3);
    }

    if (selection) {
      c.save();
      c.setLineDash([6, 4]);
      c.fillStyle = chartTheme.selectionFill;
      c.strokeStyle = chartTheme.selectionStroke;
      c.lineWidth = 2;
      const X = selection.k0 * w;
      const Y = selection.r0 * h;
      const W = (selection.k1 - selection.k0 + 1) * w;
      const H = (selection.r1 - selection.r0 + 1) * h;
      c.fillRect(X, Y, W, H);
      c.strokeRect(X + 1, Y + 1, W - 2, H - 2);
      c.restore();
    }

    if (cursor) {
      c.strokeStyle = chartTheme.cursorOuter;
      c.lineWidth = 3;
      c.strokeRect(cursor.k * w + 1.5, cursor.r * h + 1.5, w - 3, h - 3);
      c.strokeStyle = chartTheme.cursorInner;
      c.lineWidth = 1.2;
      c.strokeRect(cursor.k * w + 4, cursor.r * h + 4, w - 8, h - 8);
    }
  }

  c.restore();
}

export function renderRepeatPreview(
  canvas: HTMLCanvasElement,
  grid: number[][],
  sy: number[][],
  pal: string[],
  cols: number,
  rows: number,
  gauge: Gauge,
  repeat: number,
  stitches: StitchInfo[],
  theme: ChartTheme = resolveChartTheme('screen')
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = Math.max(1.5, Math.min(14, 270 / (cols * repeat)));
  const h = (w * gauge.s) / gauge.r;
  canvas.width = Math.ceil(cols * w * repeat);
  canvas.height = Math.ceil(rows * h * repeat);
  ctx.fillStyle = theme.knittedBedBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let a = 0; a < repeat; a++) {
    for (let b = 0; b < repeat; b++) {
      ctx.save();
      ctx.translate(b * cols * w, a * rows * h);
      drawCells(ctx, grid, sy, pal, cols, rows, w, h, 'k', stitches, theme);
      ctx.restore();
    }
  }
}

export function formatDimensionsCm(cols: number, rows: number, gauge: Gauge): string {
  const wCm = ((cols * 10) / gauge.s).toFixed(1);
  const hCm = ((rows * 10) / gauge.r).toFixed(1);
  return `${wCm} × ${hCm} cm`;
}

export function buildFillPattern(
  type: 'hound' | 'hstripe' | 'vstripe' | 'check' | 'zig' | 'diam',
  rowFromBottom: number,
  colFromRight: number,
  size: number
): boolean {
  const i = rowFromBottom;
  const j = colFromRight;
  switch (type) {
    case 'hound': {
      const a = j % 8 < 4 ? 0 : 1;
      const b = i % 8 < 4 ? 0 : 1;
      return ((i + j) % 4 < 2 ? a : b) === 1;
    }
    case 'hstripe':
      return Math.floor(i / size) % 2 === 1;
    case 'vstripe':
      return Math.floor(j / size) % 2 === 1;
    case 'check':
      return (Math.floor(i / size) + Math.floor(j / size)) % 2 === 1;
    case 'zig': {
      const t = j % (2 * size);
      const h = t < size ? t : 2 * size - 1 - t;
      return (i + h) % (2 * size) < size;
    }
    case 'diam': {
      const q = 2 * size;
      const d = Math.abs((j % q) - (size - 0.5)) + Math.abs((i % q) - (size - 0.5));
      return d <= size - 0.5;
    }
  }
}

/* --------------------------------------------------------------------------
   Exporters (PNG, SVG, PDF) — Print Theme Profile
   -------------------------------------------------------------------------- */

function escXml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function safeFilename(name: string): string {
  return (name.trim() || 'pattern').replace(/[^\p{L}\p{N}_-]+/gu, '-');
}

function getUsedYarnsAndSymbols(doc: KnitDocument) {
  const yarns = new Set<number>();
  const syms = new Set<number>();
  let hasHoles = false;
  for (let r = 0; r < doc.rows; r++) {
    for (let k = 0; k < doc.cols; k++) {
      const v = doc.grid[r][k];
      const q = doc.sy[r][k];
      if (v >= 0) yarns.add(v);
      if (q > 0) syms.add(q);
      if (v < 0 && q === 0) hasHoles = true;
    }
  }
  return {
    yarns: [...yarns].sort((a, b) => a - b),
    syms: [...syms].sort((a, b) => a - b),
    hasHoles,
  };
}

function buildLegend(doc: KnitDocument, bw: boolean, stitches: StitchInfo[], lang: Lang) {
  const { yarns, syms, hasHoles } = getUsedYarnsAndSymbols(doc);
  const items: Array<{ yarnIdx?: number; glyph?: string; hole?: boolean; text: string }> = [];
  yarns.forEach((i) => {
    items.push({
      yarnIdx: i,
      text: `${lang === 'hu' ? 'Fonal' : 'Yarn'} ${YARN_LETTERS[i]}${bw ? '' : ` – ${doc.pal[i]}`}`,
    });
  });
  syms.forEach((i) => {
    const st = stitches[i];
    if (st) {
      items.push({
        glyph: st.glyph,
        text: lang === 'hu' ? st.titleHu : st.titleEn,
      });
    }
  });
  if (hasHoles) {
    items.push({
      hole: true,
      text: lang === 'hu' ? 'Sraffozott cella: nincs szem (kihagyva)' : 'Hatched cell: no stitch',
    });
  }
  return items;
}

function buildNotes(doc: KnitDocument, lang: Lang): string[] {
  if (lang === 'hu') {
    return [
      `Kötéspróba: ${doc.gauge.s} szem × ${doc.gauge.r} sor / 10 cm (${formatDimensionsCm(doc.cols, doc.rows, doc.gauge)}).`,
      doc.mode === 'round'
        ? 'Körben kötve: minden kör jobbról balra halad, a munka színén.'
        : 'Síkban kötve: páratlan sorok jobbról balra (színén), páros sorok balról jobbra (visszáján).',
      'Jel nélküli színes cella = sima szem.',
    ];
  }
  return [
    `Gauge: ${doc.gauge.s} stitches × ${doc.gauge.r} rows / 10 cm (${formatDimensionsCm(doc.cols, doc.rows, doc.gauge)}).`,
    doc.mode === 'round'
      ? 'Knitted in the round: every round runs right to left, right side.'
      : 'Knitted flat: odd rows right to left (RS), even rows left to right (WS).',
    'Colored cell with no symbol = plain knit stitch.',
  ];
}

export function exportPNGDataUrl(doc: KnitDocument, stitches: StitchInfo[], lang: Lang): string {
  const printTheme = resolveChartTheme('print');
  const w = Math.max(8, Math.min(28, Math.sqrt(1.4e7 / ((doc.cols * doc.rows * doc.gauge.s) / doc.gauge.r))));
  const h = (w * doc.gauge.s) / doc.gauge.r;
  const m = 44;
  const legend = buildLegend(doc, false, stitches, lang);
  const notes = buildNotes(doc, lang);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(doc.cols * w + 2 * m, 580);
  canvas.height = Math.ceil(doc.rows * h + 2 * m + legend.length * 30 + notes.length * 22 + 24);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = printTheme.paperBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  renderChartToCanvas(ctx, {
    grid: doc.grid,
    sy: doc.sy,
    pal: doc.pal,
    cols: doc.cols,
    rows: doc.rows,
    w,
    h,
    mode: 'g',
    margin: m,
    knittedMode: doc.mode,
    stitches,
    showGuides: false,
    chartTheme: printTheme,
  });

  ctx.fillStyle = printTheme.labelInk;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 18px Arial, Helvetica, sans-serif';
  ctx.fillText(`${doc.nm} – ${doc.cols} × ${doc.rows}`, m, 28);

  let y = doc.rows * h + 2 * m - 4;
  ctx.font = '14px Arial, Helvetica, sans-serif';
  legend.forEach((item) => {
    if (item.yarnIdx !== undefined) {
      ctx.fillStyle = doc.pal[item.yarnIdx];
      ctx.fillRect(m, y, 22, 22);
      ctx.strokeStyle = printTheme.labelInk;
      ctx.strokeRect(m, y, 22, 22);
      ctx.fillStyle = printTheme.labelInk;
      ctx.fillText(item.text, m + 32, y + 16);
    } else if (item.hole) {
      ctx.fillStyle = printTheme.noStitchBg;
      ctx.fillRect(m, y, 22, 22);
      ctx.strokeStyle = printTheme.noStitchHatch;
      ctx.beginPath();
      ctx.moveTo(m + 2, y + 20);
      ctx.lineTo(m + 20, y + 2);
      ctx.stroke();
      ctx.strokeStyle = printTheme.labelInk;
      ctx.strokeRect(m, y, 22, 22);
      ctx.fillStyle = printTheme.labelInk;
      ctx.fillText(item.text, m + 32, y + 16);
    } else {
      ctx.fillStyle = printTheme.labelInk;
      ctx.fillText(`${item.glyph}  ${item.text}`, m + 4, y + 16);
    }
    y += 30;
  });

  ctx.font = '13px Arial, Helvetica, sans-serif';
  notes.forEach((n) => {
    ctx.fillText(n, m, y + 14);
    y += 20;
  });

  return canvas.toDataURL('image/png');
}

export function buildSVGChart(
  doc: KnitDocument,
  bw: boolean,
  stitches: StitchInfo[],
  lang: Lang,
  slice?: { r0: number; r1: number; k0: number; k1: number; includeLegend?: boolean; subtitle?: string }
): string {
  const printTheme = resolveChartTheme('print');
  const r0 = slice?.r0 ?? 0;
  const r1 = slice?.r1 ?? doc.rows - 1;
  const k0 = slice?.k0 ?? 0;
  const k1 = slice?.k1 ?? doc.cols - 1;
  const includeLegend = slice?.includeLegend ?? true;

  const subCols = k1 - k0 + 1;
  const subRows = r1 - r0 + 1;
  const w = 26;
  const h = (26 * doc.gauge.s) / doc.gauge.r;
  const m = 44;
  const legend = includeLegend ? buildLegend(doc, bw, stitches, lang) : [];
  const notes = includeLegend ? buildNotes(doc, lang) : [];
  const lh = 26;

  const W = Math.max(subCols * w + 2 * m, 560);
  const H = subRows * h + 2 * m + legend.length * lh + notes.length * 20 + 30;

  const grayOf = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    const g = Math.round(lum * 0.45 + 140);
    return `rgb(${g},${g},${g})`;
  };

  const fs = Math.round(Math.min(w, h) * 0.54);
  const smallFs = Math.max(7, Math.round(fs * 0.52));
  let hatchPaths = '';
  const titleText = slice?.subtitle ? `${doc.nm} – ${slice.subtitle}` : `${doc.nm} – ${doc.cols} × ${doc.rows}`;

  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Arial,Helvetica,sans-serif">`;
  out += `<rect width="100%" height="100%" fill="${printTheme.paperBg}"/>`;
  out += `<text x="${m}" y="28" font-size="18" font-weight="bold" fill="${printTheme.labelInk}">${escXml(titleText)}</text>`;
  out += `<g transform="translate(${m},${m})" text-anchor="middle" font-size="${fs}" font-weight="bold">`;

  for (let lr = 0; lr < subRows; lr++) {
    const r = r0 + lr;
    for (let lk = 0; lk < subCols; lk++) {
      const k = k0 + lk;
      const v = doc.grid[r][k];
      const q = doc.sy[r][k];
      const x = lk * w;
      const y = lr * h;

      if (v < 0 && q === 0) {
        out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${printTheme.noStitchBg}"/>`;
        hatchPaths += `M${x + 2} ${y + h - 2}L${x + w - 2} ${y + 2}`;
        continue;
      }

      const fill = v < 0 ? printTheme.paperBg : bw ? grayOf(doc.pal[v]) : doc.pal[v];
      const inkCol = bw || v < 0 ? printTheme.darkInk : contrastInk(doc.pal[v], printTheme.darkInk, printTheme.lightInk);
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;

      if (q > 0) {
        const glyph = stitches[q]?.glyph ?? '?';
        out += `<text x="${x + w / 2}" y="${y + h / 2 + fs * 0.35}" fill="${inkCol}">${escXml(glyph)}</text>`;
        if (bw && v > 0) {
          out += `<text x="${x + w - 3}" y="${y + smallFs + 1}" font-size="${smallFs}" text-anchor="end" fill="${printTheme.darkInk}">${escXml(YARN_LETTERS[v])}</text>`;
        }
      } else if (bw && v >= 0) {
        out += `<text x="${x + w / 2}" y="${y + h / 2 + fs * 0.35}" fill="${printTheme.darkInk}">${escXml(YARN_LETTERS[v])}</text>`;
      }
    }
  }

  if (hatchPaths) {
    out += `<path d="${hatchPaths}" stroke="${printTheme.noStitchHatch}" stroke-width="1" fill="none"/>`;
  }

  let thinLines = '';
  let boldLines = '';
  for (let lk = 0; lk <= subCols; lk++) thinLines += `M${lk * w} 0V${subRows * h}`;
  for (let lr = 0; lr <= subRows; lr++) thinLines += `M0 ${lr * h}H${subCols * w}`;
  for (let lk = 0; lk <= subCols; lk++) {
    const absStitchNum = doc.cols - (k0 + lk);
    if (absStitchNum % 5 === 0) boldLines += `M${lk * w} 0V${subRows * h}`;
  }
  for (let lr = 0; lr <= subRows; lr++) {
    const absRowNum = doc.rows - (r0 + lr);
    if (absRowNum % 5 === 0) boldLines += `M0 ${lr * h}H${subCols * w}`;
  }

  out += `<path d="${thinLines}" stroke="${printTheme.gridLineSvg}" stroke-width="0.6" fill="none"/>`;
  out += `<path d="${boldLines}" stroke="${printTheme.boldGridLine}" stroke-width="1.6" fill="none"/>`;
  out += `<g font-size="11" font-weight="normal" fill="${printTheme.labelInk}">`;

  for (let lk = 0; lk < subCols; lk++) {
    const n = doc.cols - (k0 + lk);
    if (n === 1 || n % 5 === 0) {
      out += `<text x="${lk * w + w / 2}" y="${subRows * h + 16}">${n}</text>`;
    }
  }
  for (let lr = 0; lr < subRows; lr++) {
    const n = doc.rows - (r0 + lr);
    if (h < 13 && n % 5 !== 0 && n !== 1) continue;
    if (isRightToLeft(n, doc.mode)) {
      out += `<text text-anchor="start" x="${subCols * w + 7}" y="${lr * h + h / 2 + 4}">${n}</text>`;
    } else {
      out += `<text text-anchor="end" x="-7" y="${lr * h + h / 2 + 4}">${n}</text>`;
    }
  }
  out += `</g></g>`;

  if (includeLegend) {
    out += `<g font-size="14" fill="${printTheme.labelInk}">`;
    let y = subRows * h + 2 * m - 8;
    legend.forEach((item) => {
      if (item.yarnIdx !== undefined) {
        const swatchFill = bw ? grayOf(doc.pal[item.yarnIdx]) : doc.pal[item.yarnIdx];
        out += `<rect x="${m}" y="${y}" width="22" height="22" fill="${swatchFill}" stroke="${printTheme.labelInk}"/>`;
        if (bw) {
          out += `<text x="${m + 11}" y="${y + 16}" text-anchor="middle" font-weight="bold" fill="${printTheme.darkInk}">${YARN_LETTERS[item.yarnIdx]}</text>`;
        }
        out += `<text x="${m + 32}" y="${y + 16}">${escXml(item.text)}</text>`;
      } else if (item.hole) {
        out += `<rect x="${m}" y="${y}" width="22" height="22" fill="${printTheme.noStitchBg}" stroke="${printTheme.labelInk}"/><path d="M${m + 2} ${y + 20}L${m + 20} ${y + 2}" stroke="${printTheme.noStitchHatch}"/><text x="${m + 32}" y="${y + 16}">${escXml(item.text)}</text>`;
      } else {
        out += `<text x="${m + 4}" y="${y + 16}">${escXml(`${item.glyph}  ${item.text}`)}</text>`;
      }
      y += lh;
    });
    notes.forEach((n) => {
      out += `<text x="${m}" y="${y + 14}" font-size="12">${escXml(n)}</text>`;
      y += 20;
    });
    out += `</g>`;
  }

  return `${out}</svg>`;
}

async function svgToJpegPage(svgText: string): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const printTheme = resolveChartTheme('print');
  const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
  const img = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('SVG render failed'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }

  const k = Math.min(2, Math.sqrt(1.2e7 / (img.width * img.height)));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * k);
  c.height = Math.round(img.height * k);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = printTheme.paperBg;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);

  const b64 = c.toDataURL('image/jpeg', 0.92).split(',')[1];
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return { bytes, width: c.width, height: c.height };
}

function assemblePdfFromPages(
  pages: Array<{ bytes: Uint8Array; width: number; height: number; landscape: boolean }>
): Blob {
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let len = 0;

  const add = (d: string | Uint8Array) => {
    const arr = typeof d === 'string' ? Uint8Array.from(d, (ch) => ch.charCodeAt(0)) : d;
    parts.push(arr);
    len += arr.length;
  };
  const writeObj = (num: number, body: string) => {
    offsets[num] = len;
    add(`${num} 0 obj\n${body}\nendobj\n`);
  };

  add('%PDF-1.4\n');
  const pageIds = pages.map((_, idx) => 3 + idx * 3);
  writeObj(1, `<</Type/Catalog/Pages 2 0 R>>`);
  writeObj(2, `<</Type/Pages/Kids[${pageIds.map((id) => `${id} 0 R`).join(' ')}]/Count ${pages.length}>>`);

  const mg = 28;
  pages.forEach((pg, idx) => {
    const pageObjId = 3 + idx * 3;
    const imgObjId = pageObjId + 1;
    const contentObjId = pageObjId + 2;
    const PW = pg.landscape ? 842 : 595;
    const PH = pg.landscape ? 595 : 842;
    const sc = Math.min((PW - 2 * mg) / pg.width, (PH - 2 * mg) / pg.height);
    const w = pg.width * sc;
    const h = pg.height * sc;
    const cs = `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${mg} ${(PH - mg - h).toFixed(2)} cm /I Do Q`;

    writeObj(
      pageObjId,
      `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${PW} ${PH}]/Resources<</XObject<</I ${imgObjId} 0 R>>>>/Contents ${contentObjId} 0 R>>`
    );

    offsets[imgObjId] = len;
    add(
      `${imgObjId} 0 obj\n<</Type/XObject/Subtype/Image/Width ${pg.width}/Height ${pg.height}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${pg.bytes.length}>>\nstream\n`
    );
    add(pg.bytes);
    add('\nendstream\nendobj\n');

    writeObj(contentObjId, `<</Length ${cs.length}>>\nstream\n${cs}\nendstream`);
  });

  const totalObjs = 3 + pages.length * 3;
  const xrefStart = len;
  add(`xref\n0 ${totalObjs}\n0000000000 65535 f \n`);
  for (let i = 1; i < totalObjs; i++) {
    add(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  add(`trailer\n<</Size ${totalObjs}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`);
  return new Blob(parts as BlobPart[], { type: 'application/pdf' });
}

export async function buildPdfBlob(
  doc: KnitDocument,
  bw: boolean,
  tiled: boolean,
  stitches: StitchInfo[],
  lang: Lang
): Promise<Blob> {
  if (!tiled || (doc.cols <= 48 && doc.rows <= 60)) {
    const svg = buildSVGChart(doc, bw, stitches, lang);
    const pageImg = await svgToJpegPage(svg);
    const landscape = doc.cols * 1.15 > (doc.rows * doc.gauge.s) / doc.gauge.r;
    return assemblePdfFromPages([{ ...pageImg, landscape }]);
  }

  const tileCols = 40;
  const tileRows = 50;
  const pages: Array<{ bytes: Uint8Array; width: number; height: number; landscape: boolean }> = [];
  const totalColTiles = Math.ceil(doc.cols / tileCols);
  const totalRowTiles = Math.ceil(doc.rows / tileRows);

  for (let rt = 0; rt < totalRowTiles; rt++) {
    const r0 = rt * tileRows;
    const r1 = Math.min(doc.rows - 1, r0 + tileRows - 1);
    for (let ct = 0; ct < totalColTiles; ct++) {
      const k0 = ct * tileCols;
      const k1 = Math.min(doc.cols - 1, k0 + tileCols - 1);
      const isLast = rt === totalRowTiles - 1 && ct === totalColTiles - 1;
      const pageNum = rt * totalColTiles + ct + 1;
      const totalPages = totalColTiles * totalRowTiles;
      const svg = buildSVGChart(doc, bw, stitches, lang, {
        r0,
        r1,
        k0,
        k1,
        includeLegend: isLast,
        subtitle: `Page ${pageNum}/${totalPages}`,
      });
      const img = await svgToJpegPage(svg);
      pages.push({ ...img, landscape: false });
    }
  }

  return assemblePdfFromPages(pages);
}

/* --------------------------------------------------------------------------
   Image Import & Color Quantization
   -------------------------------------------------------------------------- */

export async function sniffImageMagic(file: File): Promise<boolean> {
  try {
    const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const matchStr = (offset: number, s: string) => [...s].every((ch, i) => b[offset + i] === ch.charCodeAt(0));
    return (
      (b[0] === 0x89 && matchStr(1, 'PNG')) ||
      (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ||
      matchStr(0, 'GIF87a') ||
      matchStr(0, 'GIF89a') ||
      (matchStr(0, 'RIFF') && matchStr(8, 'WEBP'))
    );
  } catch {
    return false;
  }
}

const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
};

export function quantizeMedianCut(rgbaData: Uint8ClampedArray, targetCount: number, skipTransparent: boolean): string[] {
  const pixels: Array<[number, number, number]> = [];
  for (let i = 0; i < rgbaData.length; i += 4) {
    if (skipTransparent && rgbaData[i + 3] < 128) continue;
    pixels.push([rgbaData[i], rgbaData[i + 1], rgbaData[i + 2]]);
  }
  if (pixels.length === 0) return ['#5E3F1B', '#F3E6CF'];

  const boxes: Array<Array<[number, number, number]>> = [pixels];
  while (boxes.length < targetCount) {
    let bestBox = -1;
    let bestScore = 0;
    let bestChannel = 0;
    boxes.forEach((box, idx) => {
      if (box.length < 2) return;
      for (let ch = 0; ch < 3; ch++) {
        let lo = 255;
        let hi = 0;
        for (const px of box) {
          if (px[ch] < lo) lo = px[ch];
          if (px[ch] > hi) hi = px[ch];
        }
        const score = (hi - lo) * Math.sqrt(box.length);
        if (score > bestScore) {
          bestScore = score;
          bestBox = idx;
          bestChannel = ch;
        }
      }
    });
    if (bestBox < 0) break;
    const sorted = boxes[bestBox].sort((a, b) => a[bestChannel] - b[bestChannel]);
    const mid = sorted.length >> 1;
    boxes.splice(bestBox, 1, sorted.slice(0, mid), sorted.slice(mid));
  }

  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  const hexes = boxes
    .filter((b) => b.length > 0)
    .map((b) => {
      const sum = [0, 0, 0];
      b.forEach((p) => {
        sum[0] += p[0];
        sum[1] += p[1];
        sum[2] += p[2];
      });
      return `#${sum.map((v) => toHex(v / b.length)).join('')}`;
    });

  return [...new Set(hexes)].sort((a, b) => luminance(a) - luminance(b));
}

export interface ImageConvertOptions {
  cols: number;
  rows: number;
  gauge: Gauge;
  useImagePalette: boolean;
  paletteCount: number;
  currentPalette: string[];
  dither: boolean;
  alphaToNoStitch: boolean;
  brightness: number;
  contrast: number;
}

export function convertImageToGrid(
  img: HTMLImageElement,
  opts: ImageConvertOptions
): { grid: number[][]; palette: string[] } {
  const { cols, rows, gauge, useImagePalette, paletteCount, currentPalette, dither, alphaToNoStitch, brightness, contrast } = opts;
  const printTheme = resolveChartTheme('print');

  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  if (!alphaToNoStitch) {
    ctx.fillStyle = printTheme.paperBg;
    ctx.fillRect(0, 0, cols, rows);
  }
  ctx.imageSmoothingQuality = 'high';

  const sc = Math.min(cols / gauge.s / img.width, rows / gauge.r / img.height);
  const dw = img.width * sc * gauge.s;
  const dh = img.height * sc * gauge.r;
  ctx.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);

  const imgData = ctx.getImageData(0, 0, cols, rows);
  const raw = imgData.data;

  const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const buf = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      let val = raw[i + ch] + brightness * 2.55;
      val = cFactor * (val - 128) + 128;
      buf[i + ch] = Math.max(0, Math.min(255, val));
    }
    buf[i + 3] = raw[i + 3];
  }

  const clamped = new Uint8ClampedArray(buf.length);
  for (let i = 0; i < buf.length; i++) clamped[i] = Math.round(buf[i]);

  const palette = useImagePalette ? quantizeMedianCut(clamped, paletteCount, alphaToNoStitch) : currentPalette.slice();
  const palRgb = palette.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]);

  const nearestColor = (r: number, g: number, b: number) => {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < palRgb.length; i++) {
      const p = palRgb[i];
      const rm = (p[0] + r) / 2;
      const dr = p[0] - r;
      const dg = p[1] - g;
      const db = p[2] - b;
      const dist = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  };

  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const idx = (r * cols + k) * 4;
      if (alphaToNoStitch && buf[idx + 3] < 128) {
        grid[r][k] = -1;
        continue;
      }
      const oldR = buf[idx];
      const oldG = buf[idx + 1];
      const oldB = buf[idx + 2];
      const best = nearestColor(oldR, oldG, oldB);
      grid[r][k] = best;

      if (dither) {
        const [nr, ng, nb] = palRgb[best];
        const errR = oldR - nr;
        const errG = oldG - ng;
        const errB = oldB - nb;
        const spread = (rr: number, kk: number, factor: number) => {
          if (rr < 0 || rr >= rows || kk < 0 || kk >= cols) return;
          const j = (rr * cols + kk) * 4;
          if (alphaToNoStitch && buf[j + 3] < 128) return;
          buf[j] = Math.max(0, Math.min(255, buf[j] + errR * factor));
          buf[j + 1] = Math.max(0, Math.min(255, buf[j + 1] + errG * factor));
          buf[j + 2] = Math.max(0, Math.min(255, buf[j + 2] + errB * factor));
        };
        spread(r, k + 1, 7 / 16);
        spread(r + 1, k - 1, 3 / 16);
        spread(r + 1, k, 5 / 16);
        spread(r + 1, k + 1, 1 / 16);
      }
    }
  }

  return { grid, palette };
}
