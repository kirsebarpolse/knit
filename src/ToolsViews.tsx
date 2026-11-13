import React, { useState } from 'react';
import { Minus, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import type { CustomStitch, Gauge, KnitDocument, Lang, ProjectItem } from './core';
import { makeBlankPattern, tFor } from './core';
import { GLOSSARY_ENTRIES, checkStandaloneRow } from './knitEngine';
import { Button, Card, FieldLabel, Input, SectionTitle, Select, TableWrap, Textarea } from './ui';

/* ==========================================================================
   Knit Workshop — Calculators, Templates, Projects & Reference Views
   ========================================================================== */

const NEEDLES = [
  [2, '0', '14'],
  [2.25, '1', '13'],
  [2.75, '2', '12'],
  [3, '–', '11'],
  [3.25, '3', '10'],
  [3.5, '4', '–'],
  [3.75, '5', '9'],
  [4, '6', '8'],
  [4.5, '7', '7'],
  [5, '8', '6'],
  [5.5, '9', '5'],
  [6, '10', '4'],
  [6.5, '10½', '3'],
  [8, '11', '0'],
  [9, '13', '00'],
  [10, '15', '000'],
] as const;

const YARN_WEIGHTS = [
  { name: 'Lace', min: 33, max: 40, needle: '1.5–2.25' },
  { name: 'Fingering', min: 27, max: 32, needle: '2.25–3.25' },
  { name: 'Sport', min: 23, max: 26, needle: '3.25–3.75' },
  { name: 'DK', min: 21, max: 24, needle: '3.75–4.5' },
  { name: 'Worsted', min: 16, max: 20, needle: '4.5–5.5' },
  { name: 'Bulky', min: 12, max: 15, needle: '5.5–8' },
];

export const CalculatorsView: React.FC<{ gauge: Gauge; lang: Lang }> = ({ gauge, lang }) => {
  const t = tFor(lang);
  const [wCm, setWCm] = useState(50);
  const [hCm, setHCm] = useState(20);

  const [ds, setDs] = useState(40);
  const [dk, setDk] = useState(8);
  const [dm, setDm] = useState(30);
  const [dd, setDd] = useState<'inc' | 'dec'>('inc');
  const [de, setDe] = useState(2);

  const [needleIdx, setNeedleIdx] = useState(6);

  let distOutput = '';
  if (dk > dm) {
    distOutput =
      lang === 'hu'
        ? `Soronként legfeljebb egy változtatás fér el, így maximum ${dm} változtatás lehet.`
        : `At most one change fits per row, so max ${dm} changes.`;
  } else if (dd === 'dec' && ds - dk * de <= 0) {
    distOutput =
      lang === 'hu'
        ? 'Túl sok fogyasztás: a szemszám nullára vagy alá csökkenne.'
        : 'Too many decreases: stitch count would drop to zero.';
  } else {
    let cur = ds;
    const rowsList: number[] = [];
    for (let i = 0; i < dk; i++) {
      const r = Math.min(dm, Math.max(1, Math.round(((i + 0.5) * dm) / dk)));
      cur += (dd === 'inc' ? 1 : -1) * de;
      rowsList.push(r);
    }
    const gaps = rowsList.map((r, idx) => (idx === 0 ? r : r - rowsList[idx - 1]));
    const summaryFreq =
      dk > 1
        ? lang === 'hu'
          ? `Átlagosan minden ~${(dm / dk).toFixed(1)}. sorban (${rowsList.join(', ')}. sor).`
          : `Every ~${(dm / dk).toFixed(1)} rows (at rows: ${rowsList.join(', ')}).`
        : dk === 1
        ? lang === 'hu'
          ? `A(z) ${rowsList[0]}. sorban.`
          : `At row ${rowsList[0]}.`
        : '';
    const avgGapNote =
      gaps.length > 1 && new Set(gaps).size === 1
        ? lang === 'hu'
          ? ` Pontosan minden ${gaps[0]}. sorban.`
          : ` Exactly every ${gaps[0]} rows.`
        : '';
    distOutput =
      (lang === 'hu' ? `Végső szemszám: ${cur}. ` : `Final stitch count: ${cur}. `) + summaryFreq + avgGapNote;
  }

  const selNeedle = NEEDLES[needleIdx];
  const matchedWeight = YARN_WEIGHTS.find((y) => gauge.s >= y.min && gauge.s <= y.max);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Card>
        <SectionTitle className="mb-4">{t.calc.sizeTitle}</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <FieldLabel>{t.calc.widthCm}</FieldLabel>
            <Input
              type="number"
              min={1}
              value={wCm}
              onChange={(e) => setWCm(Math.max(0, Number(e.target.value)))}
              className="tabular-nums"
            />
          </label>
          <label className="block">
            <FieldLabel>{t.calc.heightCm}</FieldLabel>
            <Input
              type="number"
              min={1}
              value={hCm}
              onChange={(e) => setHCm(Math.max(0, Number(e.target.value)))}
              className="tabular-nums"
            />
          </label>
        </div>
        <p className="mt-4 text-base font-medium text-ink tabular-nums" role="status">
          {wCm} cm = <strong>{Math.round((wCm * gauge.s) / 10)}</strong> {lang === 'hu' ? 'szem' : 'stitches'} · {hCm} cm ={' '}
          <strong>{Math.round((hCm * gauge.r) / 10)}</strong> {lang === 'hu' ? 'sor' : 'rows'}{' '}
          <span className="text-sm text-ink-secondary">
            ({gauge.s} × {gauge.r} / 10 cm)
          </span>
        </p>
      </Card>

      <Card>
        <SectionTitle className="mb-4">{t.calc.distTitle}</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <FieldLabel>{lang === 'hu' ? 'Szemek a tűn' : 'Stitches on needle'}</FieldLabel>
            <Input
              type="number"
              min={1}
              value={ds}
              onChange={(e) => setDs(Math.max(1, Number(e.target.value)))}
              className="tabular-nums"
            />
          </label>
          <label className="block">
            <FieldLabel>{lang === 'hu' ? 'Változtatások száma' : 'Number of changes'}</FieldLabel>
            <Input
              type="number"
              min={1}
              value={dk}
              onChange={(e) => setDk(Math.max(0, Math.min(1000, Number(e.target.value))))}
              className="tabular-nums"
            />
          </label>
          <label className="block">
            <FieldLabel>{lang === 'hu' ? 'Ennyi soron belül' : 'Within rows'}</FieldLabel>
            <Input
              type="number"
              min={1}
              value={dm}
              onChange={(e) => setDm(Math.max(1, Math.min(2000, Number(e.target.value))))}
              className="tabular-nums"
            />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <label className="block">
            <FieldLabel>{lang === 'hu' ? 'Művelet' : 'Operation'}</FieldLabel>
            <Select value={dd} onChange={(e) => setDd(e.target.value as 'inc' | 'dec')}>
              <option value="inc">{lang === 'hu' ? 'Szaporítás' : 'Increase'}</option>
              <option value="dec">{lang === 'hu' ? 'Fogyasztás' : 'Decrease'}</option>
            </Select>
          </label>
          <label className="block">
            <FieldLabel>{lang === 'hu' ? 'Szem / alkalom' : 'Stitches / change'}</FieldLabel>
            <Select value={de} onChange={(e) => setDe(Number(e.target.value))}>
              <option value={1}>{lang === 'hu' ? '1 (egyik szélén)' : '1 (one edge)'}</option>
              <option value={2}>{lang === 'hu' ? '2 (mindkét szélén)' : '2 (both edges)'}</option>
            </Select>
          </label>
        </div>
        <p className="mt-4 text-sm text-ink leading-relaxed tabular-nums" role="status">
          {distOutput}
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <SectionTitle className="mb-4">{t.calc.needleTitle}</SectionTitle>
          <label className="block">
            <FieldLabel>{lang === 'hu' ? 'Metrikus (mm)' : 'Metric (mm)'}</FieldLabel>
            <Select
              value={needleIdx}
              onChange={(e) => setNeedleIdx(Number(e.target.value))}
              className="tabular-nums"
            >
              {NEEDLES.map((n, i) => (
                <option key={n[0]} value={i}>
                  {n[0]} mm
                </option>
              ))}
            </Select>
          </label>
          <p className="mt-4 text-base font-semibold text-accent tabular-nums">
            {selNeedle[0]} mm = US {selNeedle[1]} = UK {selNeedle[2]}
          </p>
        </Card>

        <Card>
          <SectionTitle className="mb-2">{t.calc.weightsTitle}</SectionTitle>
          <p className="text-sm text-ink-secondary mb-3">
            {lang === 'hu'
              ? `Aktív kötéspróba (${gauge.s} szem/10 cm): ${matchedWeight ? `${matchedWeight.name} (kiemelve)` : 'táblázaton kívül'}`
              : `Your gauge (${gauge.s} sts/10 cm): ${matchedWeight ? `matches ${matchedWeight.name} (highlighted)` : 'outside table'}`}
          </p>
          <TableWrap>
            <table className="w-full text-sm sm:text-base tabular-nums">
              <thead className="bg-surface-subtle text-ink-secondary text-sm">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">{lang === 'hu' ? 'Fonal' : 'Yarn'}</th>
                  <th className="px-3 py-2 text-right font-semibold">{lang === 'hu' ? 'Szem / 10 cm' : 'Sts / 10 cm'}</th>
                  <th className="px-3 py-2 text-right font-semibold">{lang === 'hu' ? 'Tű (mm)' : 'Needle (mm)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {YARN_WEIGHTS.map((y) => {
                  const hit = gauge.s >= y.min && gauge.s <= y.max;
                  return (
                    <tr key={y.name} className={hit ? 'bg-accent-soft font-semibold' : ''}>
                      <td className="px-3 py-2">{y.name}</td>
                      <td className="px-3 py-2 text-right">
                        {y.min}–{y.max}
                      </td>
                      <td className="px-3 py-2 text-right">{y.needle}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        </Card>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------
   Templates View
   -------------------------------------------------------------------------- */

type TemplateType = 'hat' | 'scarf' | 'body' | 'socks' | 'shawl';

const SIZES = ['S', 'M', 'L', 'XL'] as const;
const HEAD_CM = [52, 55, 58, 61];
const CHEST_CM = [92, 100, 108, 116];
const SCARF_CM = [18, 20, 22, 24];
const FOOT_CM = [20, 22, 24, 26];
const SHAWL_CM = [130, 150, 170, 190];

const roundMult = (v: number, m: number) => Math.max(m, Math.round(v / m) * m);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

function buildPlan(type: TemplateType, sizeIdx: number, customCm: number, gauge: Gauge, lang: Lang) {
  const s = gauge.s;
  const cmRows = (v: number) => Math.round((v * gauge.r) / 10);

  if (type === 'hat') {
    const circ = customCm || HEAD_CM[sizeIdx];
    const co = roundMult((circ * 0.9 * s) / 10, 8);
    return {
      co,
      mode: 'round' as const,
      title: lang === 'hu' ? `Sapka, fejkörfogat ${circ} cm` : `Hat, head circumference ${circ} cm`,
      steps:
        lang === 'hu'
          ? [
              `Szedj fel ${co} szemet, és zárd körbe.`,
              `Passzé (2 sima, 2 fordított) 5 cm magasságig = ${cmRows(5)} kör.`,
              `Köss simán körbe 19 cm teljes magasságig (${cmRows(19)} kör).`,
              `Fogyassz 8 ponton minden 2. körben, míg 8 szem marad.`,
              `Vágd el a fonalat, húzd át a maradék szemeken és dolgozd el.`,
            ]
          : [
              `Cast on ${co} stitches and join in the round.`,
              `Rib (k2, p2) for 5 cm = ${cmRows(5)} rounds.`,
              `Knit stockinette in the round to 19 cm total (${cmRows(19)} rounds).`,
              `Decrease at 8 evenly spaced points every 2nd round until 8 stitches remain.`,
              `Break yarn, draw through remaining stitches and fasten off.`,
            ],
    };
  }

  if (type === 'scarf') {
    const w = customCm || SCARF_CM[sizeIdx];
    const co = Math.max(8, Math.round((w * s) / 10));
    return {
      co,
      mode: 'flat' as const,
      title: lang === 'hu' ? `Sál, szélesség ${w} cm` : `Scarf, width ${w} cm`,
      steps:
        lang === 'hu'
          ? [
              `Szedj fel ${co} szemet.`,
              `Köss 1×1 passzét vagy mintát 170 cm hosszúságig (${cmRows(170)} sor).`,
              `Láncolj le lazán.`,
            ]
          : [
              `Cast on ${co} stitches.`,
              `Work rib (k1, p1) or stitch pattern to 170 cm (${cmRows(170)} rows).`,
              `Bind off loosely.`,
            ],
    };
  }

  if (type === 'socks') {
    const circ = customCm || FOOT_CM[sizeIdx];
    const co = roundMult((circ * 0.9 * s) / 10, 4);
    const heelSts = co / 2;
    return {
      co,
      mode: 'round' as const,
      title: lang === 'hu' ? `Zokni (szártól lefelé), lábfej kerület ${circ} cm` : `Socks (cuff-down), foot circumference ${circ} cm`,
      steps:
        lang === 'hu'
          ? [
              `Szedj fel ${co} szemet, és oszd el 4 tűre (vagy magic loopra).`,
              `Passzé (k2, p2) 4 cm = ${cmRows(4)} kör, majd sima szár 14 cm (${cmRows(14)} kör).`,
              `Sarokfal a szemek felén (${heelSts} szem) oda-vissza ${heelSts} soron át.`,
              `Sarokfordítás után szedj fel a szélén szemeket, és ékfogyasztással térj vissza ${co} szemre.`,
              `Köss a lábujjig, majd szalagfogyasztással zárj ${Math.max(8, co / 4)} szemnél Kitchener-öltéssel.`,
            ]
          : [
              `Cast on ${co} stitches and join in the round.`,
              `Rib (k2, p2) for 4 cm = ${cmRows(4)} rounds, then leg for 14 cm (${cmRows(14)} rounds).`,
              `Work heel flap flat over ${heelSts} stitches for ${heelSts} rows.`,
              `Turn heel, pick up gusset stitches, and decrease every 2nd round back to ${co} stitches.`,
              `Work foot to toe length, then decrease at 4 points to ${Math.max(8, co / 4)} stitches and graft.`,
            ],
    };
  }

  if (type === 'shawl') {
    const span = customCm || SHAWL_CM[sizeIdx];
    const depth = Math.round(span * 0.45);
    const totalRows = Math.max(20, cmRows(depth));
    return {
      co: 5,
      mode: 'flat' as const,
      title: lang === 'hu' ? `Háromszög kendő, fesztáv ~${span} cm` : `Triangular shawl, wingspan ~${span} cm`,
      steps:
        lang === 'hu'
          ? [
              `Szedj fel 5 szemet (2 szél + 1 középső gerinc + 2 szél).`,
              `Minden színe sorban szaporíts 4 szemet (szélén 1-1, a középső szem két oldalán 1-1) kb. ${totalRows} soron át.`,
              `A végső szemszám kb. ${5 + Math.floor(totalRows / 2) * 4} szem lesz. Láncolj le rugalmasan.`,
            ]
          : [
              `Cast on 5 stitches (2 border + 1 center spine + 2 border).`,
              `Every RS row increase 4 stitches (1 at each edge, 1 each side of center stitch) over ~${totalRows} rows.`,
              `Final count reaches ~${5 + Math.floor(totalRows / 2) * 4} stitches. Bind off loosely.`,
            ],
    };
  }

  const ch = customCm || CHEST_CM[sizeIdx];
  const co = roundMult(((ch + 8) / 2) * (s / 10), 2);
  return {
    co,
    mode: 'flat' as const,
    title: lang === 'hu' ? `Pulóver test (egy lap), mellbőség ${ch} cm` : `Sweater body (one panel), chest ${ch} cm`,
    steps:
      lang === 'hu'
        ? [
            `Szedj fel ${co} szemet (szélesség ${((ch + 8) / 2).toFixed(0)} cm).`,
            `Passzé 5 cm = ${cmRows(5)} sor.`,
            `Sima kötés 38 cm magasságig (${cmRows(38)} sor).`,
            `Karöltő: láncolj le mindkét szélén 4 szemet, majd fogyassz 1-1 szemet minden 2. sorban 4 alkalommal.`,
            `Köss egyenesen 60 cm teljes magasságig (${cmRows(60)} sor), majd láncolj le.`,
          ]
        : [
            `Cast on ${co} stitches (width ${((ch + 8) / 2).toFixed(0)} cm).`,
            `Work ribbing for 5 cm = ${cmRows(5)} rows.`,
            `Work stockinette to 38 cm (${cmRows(38)} rows).`,
            `Armhole: bind off 4 stitches at both edges, then decrease 1 stitch each edge every 2nd row 4 times.`,
            `Work straight to 60 cm total (${cmRows(60)} rows), then bind off.`,
          ],
  };
}

export const TemplatesView: React.FC<{
  gauge: Gauge;
  designerCols: number;
  lang: Lang;
  onCreateDesignerChart: (doc: KnitDocument) => void;
}> = ({ gauge, designerCols, lang, onCreateDesignerChart }) => {
  const t = tFor(lang);
  const [type, setType] = useState<TemplateType>('hat');
  const [sizeIdx, setSizeIdx] = useState(1);
  const [customCm, setCustomCm] = useState('');
  const [doneSteps, setDoneSteps] = useState<Record<number, boolean>>({});

  const plan = buildPlan(type, sizeIdx, Math.min(500, Math.max(0, Number(customCm) || 0)), gauge, lang);
  const m0 = type === 'hat' ? (designerCols * 8) / gcd(designerCols, 8) : designerCols;
  const lo = Math.floor(plan.co / m0) * m0;
  const hi = lo + m0;

  const handleOpenInDesigner = () => {
    if (type === 'body') {
      const cols = Math.min(180, Math.max(16, plan.co));
      const rows = Math.min(200, Math.max(24, Math.round((60 * gauge.r) / 10)));
      const doc = makeBlankPattern(cols, rows, plan.title, gauge);
      doc.mode = 'flat';
      const armholeStartRow = Math.round((38 * gauge.r) / 10);
      for (let r = 0; r < rows; r++) {
        const rowNum = rows - r;
        const isRib = rowNum <= Math.round((5 * gauge.r) / 10);
        let inset = 0;
        if (rowNum >= armholeStartRow) {
          const above = rowNum - armholeStartRow;
          inset = Math.min(8, 4 + Math.floor(above / 2));
        }
        for (let k = 0; k < cols; k++) {
          if (k < inset || k >= cols - inset) {
            doc.grid[r][k] = -1;
            doc.sy[r][k] = 0;
          } else if (isRib && k % 2 === 1) {
            doc.sy[r][k] = 1;
          }
        }
      }
      onCreateDesignerChart(doc);
      return;
    }

    if (type === 'shawl') {
      const cols = 49;
      const rows = 24;
      const doc = makeBlankPattern(cols, rows, plan.title, gauge);
      const mid = Math.floor(cols / 2);
      for (let r = 0; r < rows; r++) {
        const rowNum = rows - r;
        const halfWidth = 2 + Math.floor((rowNum - 1) / 2) * 2;
        for (let k = 0; k < cols; k++) {
          if (Math.abs(k - mid) > halfWidth) {
            doc.grid[r][k] = -1;
            doc.sy[r][k] = 0;
          } else if (rowNum % 2 === 1 && (Math.abs(k - mid) === 1 || Math.abs(k - mid) === halfWidth - 1)) {
            doc.sy[r][k] = 2;
          }
        }
      }
      onCreateDesignerChart(doc);
      return;
    }

    const cols = Math.min(180, Math.max(8, plan.co));
    const rows = type === 'hat' ? Math.min(100, Math.round((19 * gauge.r) / 10)) : 32;
    const doc = makeBlankPattern(cols, rows, plan.title, gauge);
    doc.mode = plan.mode;
    const ribRows = Math.min(rows, Math.round((5 * gauge.r) / 10));
    for (let r = 0; r < rows; r++) {
      const rowNum = rows - r;
      if (rowNum <= ribRows) {
        for (let k = 0; k < cols; k++) {
          const mod = type === 'scarf' ? 2 : 4;
          const isPurl = type === 'scarf' ? k % 2 === 1 : k % mod >= 2;
          if (isPurl) doc.sy[r][k] = 1;
        }
      }
    }
    onCreateDesignerChart(doc);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <SectionTitle>{t.tpl.title}</SectionTitle>
          <Button variant="primary" onClick={handleOpenInDesigner}>
            <Sparkles className="w-4 h-4" />
            {t.tpl.openInDesigner}
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <FieldLabel>{t.tpl.item}</FieldLabel>
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value as TemplateType);
                setDoneSteps({});
              }}
            >
              <option value="hat">{lang === 'hu' ? 'Sapka' : 'Hat'}</option>
              <option value="scarf">{lang === 'hu' ? 'Sál' : 'Scarf'}</option>
              <option value="body">{lang === 'hu' ? 'Pulóver test' : 'Sweater body'}</option>
              <option value="socks">{lang === 'hu' ? 'Zokni (szártól)' : 'Socks (cuff-down)'}</option>
              <option value="shawl">{lang === 'hu' ? 'Háromszög kendő' : 'Triangular shawl'}</option>
            </Select>
          </label>

          <label className="block">
            <FieldLabel>{t.tpl.size}</FieldLabel>
            <Select value={sizeIdx} onChange={(e) => setSizeIdx(Number(e.target.value))}>
              {SIZES.map((sz, i) => (
                <option key={sz} value={i}>
                  {sz}
                </option>
              ))}
            </Select>
          </label>

          <label className="block">
            <FieldLabel>{t.tpl.customCm}</FieldLabel>
            <Input
              type="number"
              min={1}
              placeholder="cm"
              value={customCm}
              onChange={(e) => setCustomCm(e.target.value)}
              className="tabular-nums"
            />
          </label>
        </div>

        <div className="mt-6 pt-6 border-t border-line">
          <h3 className="font-display text-lg font-semibold text-ink">{plan.title}</h3>
          <p className="mt-1 text-base text-ink-secondary tabular-nums">
            {lang === 'hu' ? 'Szemfelszedés:' : 'Cast-on:'} <strong className="text-ink">{plan.co}</strong>{' '}
            {lang === 'hu' ? 'szem' : 'stitches'}
          </p>

          <ul className="mt-4 divide-y divide-line">
            {plan.steps.map((step, k) => {
              const checked = !!doneSteps[k];
              return (
                <li key={k} className="py-3.5">
                  <label className="flex items-start gap-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setDoneSteps((prev) => ({ ...prev, [k]: !prev[k] }))}
                      className="mt-0.5 w-6 h-6 accent-neutral-800 dark:accent-neutral-300 shrink-0"
                    />
                    <span className={`text-base leading-relaxed ${checked ? 'line-through opacity-60' : ''}`}>
                      {k + 1}. {step}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t border-line grid md:grid-cols-2 gap-6">
          <TableWrap>
            <table className="w-full text-sm sm:text-base tabular-nums">
              <thead className="bg-surface-subtle text-ink-secondary text-sm">
                <tr>
                  <th className="px-3 py-2 text-left">{t.tpl.size}</th>
                  <th className="px-3 py-2 text-right">{lang === 'hu' ? 'Szemfelszedés' : 'Cast-on'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {SIZES.map((sz, idx) => (
                  <tr key={sz} className={idx === sizeIdx && !customCm ? 'bg-accent-soft font-semibold' : ''}>
                    <td className="px-3 py-2">{sz}</td>
                    <td className="px-3 py-2 text-right">{buildPlan(type, idx, 0, gauge, lang).co}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>

          <div className="text-sm text-ink-muted space-y-2">
            <h4 className="font-semibold text-ink">
              {lang === 'hu' ? 'Illeszkedés a tervezett mintához' : 'Fit with current Designer chart'}
            </h4>
            {plan.co % m0 === 0 ? (
              <p>
                {lang === 'hu'
                  ? `A tervezőben lévő minta (${designerCols} szem) pontosan ${plan.co / designerCols}× ismétlődik a felszedésben.`
                  : `Your Designer chart (${designerCols} sts) repeats evenly ${plan.co / designerCols}× in this cast-on.`}
              </p>
            ) : (
              <p>
                {lang === 'hu'
                  ? `A ${designerCols} szemes minta nem osztja maradék nélkül a ${plan.co} szemet. Illeszkedő szemszám: ${
                      lo > 0 ? `${lo} (${lo / designerCols}×) vagy ` : ''
                    }${hi} (${hi / designerCols}×).`
                  : `Your ${designerCols}-stitch chart does not divide ${plan.co} evenly. Nearest fitting cast-on: ${
                      lo > 0 ? `${lo} (${lo / designerCols}×) or ` : ''
                    }${hi} (${hi / designerCols}×).`}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

/* --------------------------------------------------------------------------
   Projects View
   -------------------------------------------------------------------------- */

export const ProjectsView: React.FC<{
  projects: ProjectItem[];
  onChange: (next: ProjectItem[]) => void;
  lang: Lang;
}> = ({ projects, onChange, lang }) => {
  const t = tFor(lang);

  const updateProject = (idx: number, patch: Partial<ProjectItem>) => {
    onChange(projects.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const updateCounter = (pIdx: number, cIdx: number, delta: number | 'reset', name?: string) => {
    const p = projects[pIdx];
    const nextCounters = p.k.map((c, j) => {
      if (j !== cIdx) return c;
      if (name !== undefined) return { ...c, n: name };
      return { ...c, c: delta === 'reset' ? 0 : Math.max(0, c.c + delta) };
    });
    updateProject(pIdx, { k: nextCounters });
  };

  const addCounter = (pIdx: number) => {
    const p = projects[pIdx];
    if (p.k.length >= 12) return;
    updateProject(pIdx, { k: [...p.k, { n: lang === 'hu' ? 'Ismétlés' : 'Repeats', c: 0 }] });
  };

  const removeCounter = (pIdx: number, cIdx: number) => {
    const p = projects[pIdx];
    if (p.k.length <= 1) return;
    updateProject(pIdx, { k: p.k.filter((_, j) => j !== cIdx) });
  };

  const addProject = () => {
    if (projects.length >= 20) return;
    onChange([
      ...projects,
      {
        id: `proj-${Date.now()}`,
        n: `${lang === 'hu' ? 'Projekt' : 'Project'} ${projects.length + 1}`,
        t: '',
        k: [{ n: lang === 'hu' ? 'Sorok' : 'Rows', c: 0 }],
      },
    ]);
  };

  const deleteProject = (idx: number) => {
    if (projects.length <= 1) {
      updateProject(0, {
        n: 'Projekt 1',
        t: '',
        k: [{ n: lang === 'hu' ? 'Sorok' : 'Rows', c: 0 }],
      });
      return;
    }
    onChange(projects.filter((_, i) => i !== idx));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {projects.map((p, pIdx) => (
        <Card key={p.id} className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              type="text"
              maxLength={80}
              value={p.n}
              aria-label={lang === 'hu' ? 'Projekt neve' : 'Project name'}
              onChange={(e) => updateProject(pIdx, { n: e.target.value })}
              className="font-display text-lg font-semibold bg-transparent border-b border-transparent focus:border-accent outline-none px-1 py-1 text-ink flex-1 min-w-[180px]"
            />
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => addCounter(pIdx)} disabled={p.k.length >= 12}>
                {t.proj.addCounter}
              </Button>
              <Button variant="danger" onClick={() => deleteProject(pIdx)} aria-label={t.proj.deleteProject}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="divide-y divide-line">
            {p.k.map((counter, cIdx) => (
              <div key={cIdx} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <Input
                  type="text"
                  maxLength={40}
                  value={counter.n}
                  aria-label={lang === 'hu' ? 'Számláló neve' : 'Counter name'}
                  onChange={(e) => updateCounter(pIdx, cIdx, 0, e.target.value)}
                  className="w-44"
                />

                <div className="flex items-center gap-2">
                  <Button
                    variant="icon"
                    size="icon"
                    onClick={() => updateCounter(pIdx, cIdx, -1)}
                    aria-label={lang === 'hu' ? 'Csökkentés' : 'Decrease'}
                    className="min-h-[44px] min-w-[44px]"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="min-w-[60px] text-center font-mono text-2xl font-semibold tabular-nums text-ink">
                    {counter.c}
                  </span>
                  <Button
                    variant="primary"
                    onClick={() => updateCounter(pIdx, cIdx, 1)}
                    aria-label={lang === 'hu' ? 'Növelés' : 'Increase'}
                    className="min-h-[44px] min-w-[54px]"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="icon"
                    size="icon"
                    onClick={() => updateCounter(pIdx, cIdx, 'reset')}
                    title={t.proj.reset}
                    aria-label={t.proj.reset}
                    className="min-h-[44px] min-w-[44px] text-ink-muted"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  {p.k.length > 1 && (
                    <Button
                      variant="icon"
                      size="icon"
                      onClick={() => removeCounter(pIdx, cIdx)}
                      aria-label={lang === 'hu' ? 'Számláló eltávolítása' : 'Remove counter'}
                      className="min-h-[44px] min-w-[44px] text-danger border-danger-line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <label className="block">
            <FieldLabel>{t.proj.notes}</FieldLabel>
            <Textarea
              rows={3}
              maxLength={20000}
              value={p.t}
              onChange={(e) => updateProject(pIdx, { t: e.target.value })}
              placeholder={lang === 'hu' ? 'Fonal adatai, tűméret, jegyzetek...' : 'Yarn details, needle size, shaping notes...'}
            />
          </label>
        </Card>
      ))}

      {projects.length < 20 && (
        <Button variant="secondary" onClick={addProject} className="px-5 py-3 min-h-[44px] text-sm">
          {t.proj.addProject}
        </Button>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------------
   Reference View
   -------------------------------------------------------------------------- */

export const ReferenceView: React.FC<{ customStitches: CustomStitch[]; lang: Lang }> = ({ customStitches, lang }) => {
  const t = tFor(lang);
  const [query, setQuery] = useState('');
  const [onNeedle, setOnNeedle] = useState(18);
  const [rowExpr, setRowExpr] = useState('k2, yo, k2tog, k10, ssk, yo, k2');
  const [checkResult, setCheckResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const allEntries = [
    ...GLOSSARY_ENTRIES,
    ...customStitches.map((c) => ({ code: c.n, en: c.t, hu: c.t })),
  ].filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.code.toLowerCase().includes(q) || item.en.toLowerCase().includes(q) || item.hu.toLowerCase().includes(q);
  });

  const handleCheck = () => {
    const res = checkStandaloneRow(rowExpr, onNeedle, customStitches);
    if (!res.ok) {
      setCheckResult({ ok: false, msg: res.error || 'Error' });
    } else {
      const diff = res.made - res.used;
      setCheckResult({
        ok: true,
        msg:
          lang === 'hu'
            ? `Rendben: ${res.used} szemből ${res.made} szem keletkezik (${diff >= 0 ? `+${diff}` : diff}).`
            : `OK: ${res.used} stitches become ${res.made} (${diff >= 0 ? `+${diff}` : diff}).`,
      });
    }
  };

  const guideItems =
    lang === 'hu'
      ? [
          ['Két réteg (fonal + szemjel)', 'Minden cella tárolja a fonal színét (A–L) és a szemjelet (k, p, yo, c4f stb.). A jel nélküli színes cella sima szem.'],
          ['Többszemes csavarások (C4F / C4B)', 'A 4-szemes csavarások automatikusan összeolvadnak a rácson és a kötött nézeten is, miközben minden cella megőrzi az 1/1 szemszám-egyensúlyt.'],
          ['Lebegő szál ellenőrző', 'Többszínű soroknál figyelmeztet, ha egy fonal megszakítás nélkül túl hosszan (alapértelmezetten >5 szem) fut.'],
          ['Kötés mód és Sorkövető', 'Kapcsold be a Kötés módot, hogy kötés közben véletlenül se rajzolj a mintába, és kövesd a haladást a kész sorok halványításával.'],
          ['Fekete-fehér PDF és Többoldalas export', 'A fekete-fehér PDF akkor is megőrzi a fonal betűjelét, ha a cellán szemjel is van. Nagy mintákhoz válaszd a többoldalas PDF-et!'],
        ]
      : [
          ['Two-layer cell model', 'Every cell stores a Yarn (A–L) and a Stitch symbol (k, p, yo, kfb, ssk, c4f, etc.). A colored cell with no symbol equals a plain knit stitch.'],
          ['Multi-cell cables (C4F / C4B)', '4-stitch cable crossings span visually across 4 contiguous cells while keeping exact 1:1 stitch count balance.'],
          ['Float and Colorwork Checker', 'Flags rows where a single yarn runs longer than your float limit in stranded work, or where 3+ colors appear in one row.'],
          ['Knit Mode and Row Tracker', 'Lock canvas editing while you knit, dim completed rows below the active tracker, and keep your screen awake.'],
          ['Monochrome PDF and Tiled Multi-Page PDF', 'Monochrome PDF preserves yarn letters even on cells that also contain stitch symbols; large charts can be tiled across multiple A4 pages.'],
        ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Card>
        <SectionTitle className="mb-4">{t.ref.howTitle}</SectionTitle>
        <ul className="space-y-3.5 text-base text-ink-secondary leading-relaxed">
          {guideItems.map(([title, body]) => (
            <li key={title}>
              <strong className="text-ink">{title}:</strong> {body}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <SectionTitle>{t.ref.glossaryTitle}</SectionTitle>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.ref.search}
            className="w-64 max-w-full"
          />
        </div>
        <dl className="divide-y divide-line text-base">
          {allEntries.map((item) => (
            <div key={item.code} className="py-3 grid sm:grid-cols-[120px_1fr] gap-2">
              <dt className="font-mono font-bold text-accent">{item.code}</dt>
              <dd className="text-ink-secondary">{lang === 'hu' ? item.hu : item.en}</dd>
            </div>
          ))}
          {allEntries.length === 0 && (
            <p className="py-4 text-base text-ink-secondary">{lang === 'hu' ? 'Nincs találat.' : 'No matching symbols.'}</p>
          )}
        </dl>
      </Card>

      <Card>
        <SectionTitle className="mb-4">{t.ref.checkerTitle}</SectionTitle>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block w-36">
            <FieldLabel>{lang === 'hu' ? 'Szemek a tűn' : 'On needle'}</FieldLabel>
            <Input
              type="number"
              min={1}
              value={onNeedle}
              onChange={(e) => setOnNeedle(Math.max(1, Number(e.target.value)))}
              className="tabular-nums"
            />
          </label>
          <label className="block flex-1 min-w-[220px]">
            <FieldLabel>{lang === 'hu' ? 'Sor leírása' : 'Row instructions'}</FieldLabel>
            <Input
              type="text"
              value={rowExpr}
              onChange={(e) => setRowExpr(e.target.value)}
              className="font-mono"
            />
          </label>
          <Button variant="primary" onClick={handleCheck}>
            {t.ref.check}
          </Button>
        </div>
        {checkResult && (
          <p role="status" className={`mt-3 text-sm font-medium ${checkResult.ok ? 'text-success' : 'text-danger'}`}>
            {checkResult.msg}
          </p>
        )}
      </Card>
    </div>
  );
};
