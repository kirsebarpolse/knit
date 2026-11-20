# Knit Workshop

[English](#english) · [Magyar](#magyar)

---

<a id="english"></a>

## English

Browser-based, offline-capable knitting pattern designer and toolkit featuring a real-proportion knitted-fabric preview, automatic stitch-count and float validation, hands-free knit mode, garment templates, and multi-page print export.

### Workspace and Visual System

* **Adaptive Three-Tier Studio Layout:**
  * **Desktop (`1024px+`):** Full-bleed four-column docked workspace combining a collapsible left **Tools** dock, central drafting canvas, and two independent right docks (**Stitch Symbols** and **Studio Inspector**) — all three side docks start **closed as compact `60px` icon rails** by default so the chart stays front and center.
  * **Tablet (`768px–1023px`):** Slim docked left and right studio rails (`62px` wide with `44px+` touch targets) providing 1-tap access to drawing tools, brush modes, mirror axes, stylus-only palm rejection, Undo/Redo, fit zoom, Zen mode, and slide-over side sheets.
  * **Phone (`< 768px`):** Full-viewport `dvh` canvas that continuously auto-fits the chart (including perimeter edge controls) to the screen on open, resize, view switch, and rotation—paired with 5 streamlined draggable floating islands (**Tools and brush**, **Stitches**, **Yarns**, **View and actions**, **Inspector**) and a direct 1-tap **Undo / Redo** capsule with automatic collision/overlap protection across tight viewports and `16px` OS edge-swipe margins, plus swipe-down-to-dismiss bottom sheets (`Stitches`, `Yarns`, `Inspector`, `Fills and Stamps`, `Pattern, Size and Export`).
* **Top Workspace Menu and Quick Rails:** A **Menu** dropdown in the top workspace bar keeps **Add custom stitch**, **Grid editor**, **Fills and Stamps**, **Pattern, Size and Export**, and layout actions reachable even when every sidebar is collapsed (plus **Brush mode**, **Mirror H/V**, and panel toggles on desktop), while the sub-toolbar adapts compactly on narrow phones (`< 640px`) and offers 1-tap **row adjustment** and undoable **Clear** actions. Closed desktop icon rails also display clickable icons for **Mirror H/V** axes and **Brush modes** (`Yarn + stitch`, `Yarn only`, `Stitch only`), active stitch glyphs, status indicators, and pinned modal triggers.
* **Clean Spacing & Visual Discipline:** Side panels separate internal groups with subtle vertical spacing instead of harsh divider lines; buttons are borderless with subtle `<= 0.7px` bottom shading and tightened (`-38%`) corner radii; yarn color swatches above the canvas are borderless; while form inputs, canvas bounds, tables, and `:focus-visible` rings maintain crisp WCAG 1.4.11 / 2.4.7 outlines (`#121212` in light mode, `#2E2E33`/`#6E6E77` in dark mode).
* **Monochrome UI + `#002420` Pine-Teal Status System + Earthy Yarn Palette:** Strict black, white, and neutral gray studio surfaces keep visual fatigue low; color appears on the earthy pastel yarn palette (`#260E14`, `#3F2721`, `#6F4638`, `#A1805C`, `#B9B1AA`, `#D7CFB9`) and on the WCAG AA/AAA **`#002420` deep pine-teal** error, warning, delete (pure white trash icons on `#002420`), and status system (`#002420` / `#0D3D37` / `#14524A` with `#E8F7F4` / `#FFFFFF` foregrounds in light mode, and `#7BD1C2` / `#62BAAC` WCAG AA foregrounds in dark mode).
* **Light and Pitch-Black Dark Mode:** Subtle dotted drafting stage in light mode, pure black canvas surround in dark mode with shadowless panels.
* **Zen Mode (`Tab`):** Hides all sidebars, tablet rails, and floating islands so the chart occupies the full viewport.

### Key Features

#### 1. Pattern Designer Workspace (`Designer`)
* **Dual View Modes:** Classic symbol **Grid View** (5-stitch and 10-stitch helper lines with odd/even row direction markers) and gauge-accurate **Knitted View**.
* **Color-Vision Accessibility (`A/B`):** Optionally displays yarn letters (`A–L`) directly inside grid cells.
* **Drawing Tools (Left Dock):** Pencil (`P`), Eraser (`E`), No Stitch / Hatched Skip (`N`), Flood Fill (`F`), Line (`L`), Rectangle (`R`), Eyedropper (`I` or hold `Alt`), Selection (`S`), and Hand Pan (`H` or hold `Space`).
* **Brush Modes and Symmetry:** Paint in **Yarn + stitch**, **Yarn only**, or **Stitch only** mode, with horizontal and vertical mirror axes and live guide lines—accessible in the expanded left dock, on closed left/right icon rails, and in the top **Menu** dropdown.
* **Yarn Palette:** Up to 12 yarns (`A–L`) with circular color pickers, live stitch counts, and percentage/meter/gram usage estimates.
* **Dedicated Stitch Symbols Column (Right Dock 1):** Starts collapsed as a single-click symbol glyph strip with a pinned **Add custom stitch** icon at the bottom, and expands into a two-column symbol grid covering all 13 built-in stitches (`k`, `p`, `yo`, `k2tog`, `skp`, `ssk`, `kfb`, `m1`, `sl`, `k3tog`, `cdd`, `c4f`, `c4b`) plus custom user-defined stitches (`uses` / `makes` stitch counts via the standalone **Add custom stitch** modal). 4-stitch cables (`c4f`, `c4b`) span cleanly across adjacent cells.
* **Selection and Transforms:** Copy, cut, paste, fill, clear, horizontal and vertical flip (automatically mirroring directional decreases and cables: `k2tog ↔ skp/ssk`, `c4f ↔ c4b`), and Undo/Redo history—rendered in a single-line horizontally scrollable touch action bar on narrow screens.
* **Fill Generators and Motif Stamps (`Fills and Stamps` drawer):**
  * Built-in houndstooth, horizontal/vertical stripes, checkerboard, zigzag, and diamond generators.
  * Save any selection as a reusable motif stamp with a live transparent ghost preview on mouse hover or direct tap/cursor placement on touch screens.
* **Command Palette (`Ctrl/Cmd + K`), Ghost HUD, and Touch Loupe:** Searchable quick-action launcher, live row/stitch coordinate HUD beside the mouse cursor, and an elevated fingertip **Touch Loupe** while actively drawing on touch devices.

#### 2. Right Studio Inspector (Right Dock 2)
* **Compact Closed Rail (`60px`):** Shows live chart health status, direct **Live Text / Checks / Legend** jump icons, clickable **Mirror H/V** and **Brush mode** state icons, and a pinned **Grid editor** launch icon at the bottom.
* **One-Line Health Strip:** Summarizes stitch-count errors, long float warnings, chart size, and active row instructions at a glance when expanded.
* **Live Text Tab and Standalone Grid Editor Modal:** Real-time written row instructions synchronized with the chart; click any row to jump, copy or export `.txt`, or open the dedicated **Grid editor** modal from the pinned footer, top **Menu**, or command palette to edit written instructions back onto the grid.
* **Checks Tab:** Per-row stitch balance table (`uses` vs `makes`), configurable float alert limit (`3–20` stitches), and multi-color row warnings.
* **Legend Tab and Spotlight Marker:** Lists yarn usage and used stitch symbols; click any yarn or stitch row to highlight matching cells on the chart while dimming the rest.

#### 3. Hands-Free Knit Mode (`Knit Mode`)
* **Edit Lock:** Prevents accidental chart edits while knitting.
* **Progress Tracking and Row Dimming:** Highlights the active row, optionally dims completed rows below it, and displays an overall progress bar.
* **Interactive Step Chunks and Tap-to-Advance:** Breaks the active row into checkable step blocks, and advances to the next row when tapping the instruction bar.
* **Repeat Cycle Counter:** Dedicated secondary counter for tracking shaping or cable repeats every `N` rows.
* **Keep Screen On (`Wake Lock`):** Prevents screen sleep in supported browsers while knitting.

#### 4. Pattern Setup, Image Import, and Export (`Pattern, Size and Export` drawer)
* **Pattern and Gauge:** Edit pattern name, stitches and rows per `10 cm`, flat vs in-the-round mode, and live `1× / 2× / 3×` knitted repeat preview.
* **4-Direction Grid Expansion & Sizing:** Add or remove rows and columns in all four directions (**Top**, **Bottom**, **Left**, **Right**) via `+/−` controls directly around the canvas, in the mobile View popover, in drawers, or via the Command Palette; resize between `2–300` stitches and `2–400` rows, clear the pattern in one tap (undoable), shift with wrap-around, and stretch rows.
* **Image Import:** Scales PNG, JPEG, WebP, or GIF images to gauge proportions using Median-Cut color quantization with brightness, contrast, dithering, and transparency-to-no-stitch options.
* **Export Formats:** Color **PNG**, Color or Monochrome **SVG**, printable **PDF** (Color, Monochrome with yarn letters, and tiled multi-page **A4 poster**), plain-text instructions (`.txt`), and portable `.knit` project files. All exports use a clean white-paper print profile even in dark mode.
* **Pattern Library:** Create, duplicate, import, export, and delete locally stored patterns.

#### 5. Additional Tools
* **Calculators:** Centimeter-to-stitch gauge converter, even increase/decrease spacing distributor, needle size table (`mm / US / UK`), and yarn weight guide.
* **Templates:** Sized garment starters (crewneck sweater, sleeve, beanie, socks, raglan) with checkable step lists and chart repeat fit checking.
* **Projects:** Local project tracker supporting multiple independent counters and free-form notes.
* **Reference:** Beginner-friendly step-by-step quick-start guide, searchable stitch abbreviation glossary, and standalone written-row stitch counter.

### Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Arrow Keys` | Move cursor across the grid |
| `Shift + Arrows` | Extend selection rectangle |
| `Space` / `Enter` | Paint active stitch or yarn |
| Hold `Space` + Drag | Pan canvas |
| Hold `Alt` + Click | Temporary eyedropper |
| `Ctrl/Cmd + Wheel` | Zoom in / out |
| `Delete` / `Backspace` | Clear cell or selection |
| `Esc` | Clear selection, stamp placement, or open dialog |
| `Tab` | Toggle Zen Mode |
| `Ctrl/Cmd + K` | Open Command Palette |
| `Ctrl/Cmd + Z` / `Y` | Undo / Redo (`Shift + Ctrl/Cmd + Z` also Redo) |
| `Ctrl/Cmd + C` / `X` / `V` | Copy / Cut / Paste selection |
| `P`, `E`, `N`, `F`, `L`, `R`, `I`, `S`, `H` | Switch drawing tool |
| `Space` / `↑` / `→` *(Knit Mode)* | Advance to next row |
| `↓` / `←` *(Knit Mode)* | Step back to previous row |

### Touch and Tablet Gestures

| Gesture / Control | Action |
| :--- | :--- |
| One-finger drag | Paint, erase, draw shape, or select active cells |
| Two-finger pinch and move | Smooth zoom and pan (automatically rolls back accidental first-finger dots) |
| Two-finger tap | Undo (`Visszavonás`) |
| Three-finger tap | Redo (`Újra`) |
| **Stylus-only mode** | Finger pans canvas while stylus/pen paints (palm rejection) |
| Drag floating island *(Phone)* | Reposition control freely within safe screen margins |
| Swipe down on sheet handle *(Phone)* | Dismiss open bottom sheet |

### Privacy, Security, and Offline Support

1. **100% Client-Side Processing:** All patterns, projects, and workspace preferences stay locally in your browser's `localStorage`; there is no backend server, user account, or telemetry.
2. **Offline PWA Support:** Installable on desktop and mobile devices and fully operational without an internet connection.
3. **Strict Input Validation and Safe Export:** Imported `.knit` files are verified by `validDoc()`, image uploads enforce MIME type checks, 12-byte magic-byte signature verification, an 8 MB file-size cap, and a 50 MP pixel limit, and SVG exports escape all text via `escXml`.

### Project Structure and Commands

```text
├── public/                        # Application icons and PWA assets
├── src/
│   ├── core.ts                    # Types, EN/HU translations, validation, localStorage
│   ├── knitEngine.ts              # Stitch analysis, canvas renderer, PNG/SVG/PDF export, image import
│   ├── ui.tsx                     # Reusable studio UI primitives and PWA hooks
│   ├── FloatingIslands.tsx        # Mobile draggable islands and swipe-dismissible touch studio sheets
│   ├── DesignerWorkspace.tsx      # Designer workspace, tablet rails, drawers, library, command palette
│   ├── ToolsViews.tsx             # Calculators, templates, projects, reference views
│   ├── App.tsx                    # Root shell, theme switcher, navigation
│   ├── main.tsx                   # Application entry point and offline registration
│   └── index.css                  # Centralized color tokens, typography, and dotted stage styles
├── LICENSE                        # GNU General Public License v3.0
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

```bash
npm install        # Install dependencies
npm run dev        # Start local development server (http://localhost:3000)
npm run lint       # Run TypeScript type check
npm run build      # Build production PWA bundle into dist/
npm run build:html # Build single standalone HTML file into dist/index.html
```

### License (`GNU General Public License v3.0`)

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License, version 3.0 or (at your option) any later version**. See the **[LICENSE](./LICENSE)** file for the full license text.

This program is distributed in the hope that it will be useful, **but WITHOUT ANY WARRANTY**; without even the implied warranty of **MERCHANTABILITY** or **FITNESS FOR A PARTICULAR PURPOSE**. Patterns created by users remain their own work.

---

<a id="magyar"></a>

## Magyar

Böngészőben futó, offline képes kötésminta-tervező és kötészeti segédalkalmazás valós kötött-szövet előnézettel, automatikus szemszám- és lebegőszál-ellenőrzéssel, kézmentes kötés móddal, ruhadarab-sablonokkal és többoldalas nyomtatási exporttal.

### Kialakítás és munkaterület

* **Három lépcsős adaptív stúdióelrendezés:**
  * **Asztal (`1024px+`):** szegélytől szegélyig érő négyoszlopos szerkesztő összecsukható bal oldali **Eszközök** sávval, középső rajzvászonnal és két független jobb oldali oszloppal (**Szemjelek** és **Vizsgálópanel**); mindhárom oldalsó panel alapértelmezetten **zárt `60px`-es ikonsávként** indul, így a minta marad a középpontban.
  * **Tablet (`768px–1023px`):** keskeny, dokkolt bal és jobb oldali eszköztárak (`62px` szélesség, `44px+` érintési felületek) egykoppintásos eszközökkel, ecsetmóddal, tükörtengelyekkel, tollmódos tenyérelutasítással, Visszavonás/Újra gombokkal, illesztési nagyítással, Zen móddal és oldalról nyíló fiókokkal.
  * **Telefon (`< 768px`):** teljes `dvh` magas rajzvászon, amely megnyitáskor, átméretezéskor, nézetváltáskor és elforgatáskor is automatikusan a képernyőhöz igazítja a rácsot (a vászon körüli szegélyvezérlőkkel együtt) — **5 áthelyezhető lebegő szigettel** (**Eszközök és ecset**, **Szemjelek**, **Fonalak**, **Nézet és műveletek**, **Vizsgálópanel**) és egy **közvetlen, 1 koppintásos Visszavonás / Újra kapszulával** automatikus ütközés- és átfedésvédelemmel, `16px`-es szélső rendszer-gesztussávval, valamint ujjal lehúzható alsó lapokkal (`Szemjelek`, `Fonalak`, `Vizsgáló`, `Kitöltés és bélyegzők`, `Minta, méret és export`).
* **Felső munkaterület-menü és zárt ikonsávok:** a felső sávban található **Menü** lenyílóból zárt oldalsávok mellett is elérhető a **Saját szemjel hozzáadása**, a **Rácsszerkesztő**, a **Kitöltés és bélyegzők**, a **Minta, méret és export**, valamint az elrendezési műveletek (asztalon kiegészítve az **Ecsetmód**, **Tükrözés** és panelkapcsolókkal), míg az al-eszköztár keskeny mobil nézetben (`< 640px`) kompakt ikonokkal biztosítja az átfedésmentes **sorléptetést** és a visszavonható **Törlés** gombot. A zárt asztali ikonsávokon közvetlenül láthatók és kapcsolhatók a **Tükör (vízszintes/függőleges)** és **Ecsetmód** (`Fonál + szem`, `Csak fonál`, `Csak szem`) ikonok, az aktív szemjelek, az állapotjelzők és az alul rögzített modális ablakindítók.
* **Letisztult térközök és akadálymentes körvonalak:** a jobb és bal oldali panelek belső csoportjait elválasztóvonalak helyett vékony térközök választják el; a gombok körvonal nélküliek, legfeljebb `0.7px`-es alsó árnyékkal és 38%-kal csökkentett sarkokkal (`3.75px / 5px / 7.5px`); a vászon feletti fonal-színválasztók körvonal nélküliek; a beviteli mezők, a vászon, a táblázatok és a `:focus-visible` fókuszkeretek pedig megőrzik a WCAG 1.4.11 / 2.4.7 kontrasztos körvonalakat (`#121212` világos, `#2E2E33`/`#6E6E77` sötét módban).
* **Monokróm UI + `#002420` mély fenyő-türkiz állapotszínek + földes pasztell fonalpaletta:** a világos és sötét stúdiófelületek szigorúan monokróm fekete, fehér és semleges szürke tónusúak; a földes pasztell fonalpaletta (`#260E14`, `#3F2721`, `#6F4638`, `#A1805C`, `#B9B1AA`, `#D7CFB9`) mellett minden hiba-, figyelmeztető, törlés- (fehér kuka ikon `#002420`-on) és állapotelem a WCAG AA/AAA kompatibilis **`#002420` mély fenyő-türkiz** rendszert használja (`#002420` / `#0D3D37` / `#14524A`, világos módban `#E8F7F4` / `#FFFFFF` előtérrel, sötét módban `#7BD1C2` / `#62BAAC` kontrasztos előtérrel).
* **Világos és tiszta fekete sötét mód:** finom pontrácsos rajzfelület világos módban, tiszta fekete vászonháttér sötét módban, árnyékmentes panelekkel.
* **Zen mód (`Tab`):** elrejti az összes oldalsávot, tabletes sávot és lebegő szigetet, így a minta a teljes képernyőt elfoglalja.

### Főbb funkciók

#### 1. Mintatervező munkaterület (`Tervező`)
* **Kétféle nézet:** klasszikus szimbólumos **Rács nézet** (5-ös és 10-es segédvonalakkal, páratlan/páros haladási irányjelzőkkel) és kötéspróba-arányos **Kötött nézet**.
* **Színvak-barát fonaljelölés (`A/B`):** opcionálisan megjeleníti a fonal betűjelét (`A–L`) közvetlenül a rácscellákban.
* **Rajzeszközök (Bal sáv):** Ecset (`P`), Radír (`E`), Nincs szem / sraffozott kihagyás (`N`), Kitöltés (`F`), Vonal (`L`), Téglalap (`R`), Pipetta (`I` vagy `Alt` nyomva tartva), Kijelölés (`S`) és Kéz / mozgatás (`H` vagy `Space` nyomva tartva).
* **Ecsetmódok és szimmetria:** festés **Fonal + szem**, **Csak fonal** vagy **Csak szem** módban, vízszintes és függőleges tükörtengelyekkel és élő segédvonalakkal — elérhető a nyitott bal sávban, a zárt ikonsávokon és a felső **Menü** lenyílóban is.
* **Fonalpaletta:** legfeljebb 12 fonal (`A–L`) kör alakú színválasztóval, élő szemszámlálóval és százalékos/méter/gramm becsléssel.
* **Önálló Szemjelek oszlop (Jobb sáv 1):** alapértelmezés szerint egykattintásos jelrácsos ikonsávként indul az alján rögzített **Saját szemjel hozzáadása** gombbal, kinyitva pedig kétoszlopos rácsban kínálja mind a 13 beépített szemjelet (`k`, `p`, `yo`, `k2tog`, `skp`, `ssk`, `kfb`, `m1`, `sl`, `k3tog`, `cdd`, `c4f`, `c4b`) és a külön modális ablakban felvehető egyedi felhasználói szemeket (`felhasznál` / `létrehoz` szemszámokkal). A 4-szemes csavarások (`c4f`, `c4b`) tisztán átívelnek a szomszédos cellákon.
* **Kijelölés és átalakítások:** másolás, kivágás, beillesztés, kitöltés, törlés, vízszintes és függőleges tükrözés (a dőlésirányú fogyasztások és csavarások automatikus cseréjével: `k2tog ↔ skp/ssk`, `c4f ↔ c4b`), valamint Undo/Redo előzmény — keskeny kijelzőn egysoros, vízszintesen görgethető érintésbarát sávban.
* **Kitöltő generátorok és motívum-bélyegzők (`Kitöltés és bélyegzők` fiók):**
  * Beépített tyúkláb, vízszintes/függőleges csíkok, sakktábla, cikkcakk és rombusz generátorok.
  * Tetszőleges kijelölés mentése újrahasználható motívum-bélyegzőként, egérnél élő áttetsző előnézettel, érintőképernyőn közvetlen koppintásos vagy kurzorhoz történő letétellel.
* **Parancspaletta (`Ctrl/Cmd + K`), kurzor-HUD és érintési nagyító:** kereshető gyorsparancs-indító, élő sor/szem koordináta-kijelző egér mellett, valamint az ujjhegy felett megjelenő **érintési nagyító** rajzolás közben érintőeszközökön.

#### 2. Jobb oldali vizsgálópanel (Jobb sáv 2)
* **Kompakt zárt ikonsáv (`60px`):** megjeleníti az élő állapotszimbólumot, az **Élő szöveg / Ellenőrzés / Jelmagyarázat** közvetlen ugróikonjait, a kattintható **Tükör (vízszintes/függőleges)** és **Ecsetmód** állapotikonokat, valamint az alján rögzített **Rácsszerkesztő** indítóikont.
* **Egysoros állapotcsík:** kinyitva egy pillantásra összegzi a szemszám-hibákat, a hosszú lebegőszál-figyelmeztetéseket, a rács méretét és az aktív sor leírását.
* **Élő szöveg fül és önálló Rácsszerkesztő ablak:** valós idejű szöveges sorleírások a rácshoz szinkronizálva; bármely sorra kattintva odaugrik a kurzor, másolható vagy `.txt` fájlként exportálható, a rögzített láblécből, a felső **Menü**ből vagy a parancspalettából megnyitható külön **Rácsszerkesztő** ablakból pedig szövegből vissza is szerkeszthető a rácsra.
* **Ellenőrzés fül:** soronkénti szemszám-egyensúly táblázat (`felhasznál` és `lesz`), állítható lebegőszál-korlát (`3–20` szem) és többszínű sor figyelmeztetések.
* **Jelmagyarázat fül és Kiemelő jelölő:** listázza a fonalhasználatot és a használt szemjeleket; bármely fonal- vagy szemsorra kattintva kiemeli az érintett cellákat a rácson, a többit pedig elhalványítja.

#### 3. Kézmentes Kötés mód (`Kötés mód`)
* **Szerkesztési zár:** megakadályozza a véletlen belerajzolást kötés közben.
* **Haladáskövetés és sorhalványítás:** kiemeli az aktív sort, opcionálisan elhalványítja az alatta lévő kész sorokat, és teljes haladási sávot mutat.
* **Interaktív lépésblokkok és koppintásos léptetés:** az aktív sort kipipálható lépésekre bontja, a sorleírási sáv megérintésével pedig a következő sorra lép.
* **Ismétlési ciklusszámláló:** külön másodlagos számláló a minden `N.` sorban ismétlődő formázások és csavarások követéséhez.
* **Képernyő ébren tartása (`Wake Lock`):** támogatott böngészőkben megakadályozza a kijelző elalvását kötés közben.

#### 4. Minta beállítás, képimport és export (`Minta, méret és export` fiók)
* **Minta és kötéspróba:** minta nevének szerkesztése, `10 cm`-re eső szem- és sorszám, síkban vagy körben kötés mód, valamint élő `1× / 2× / 3×` kötött ismétlés-előnézet.
* **4 irányú vászonbővítés és méretezés:** sorok és oszlopok hozzáadása/elvétele mind a négy irányban (**Felül**, **Alul**, **Balra**, **Jobbra**) közvetlenül a rajzvászon négy szélén lévő `+/−` gombokkal, a mobil Nézet menüben, a méretfiókokban és a parancspalettában; méretezés `2–300` szem és `2–400` sor között, egygombos (visszavonható) minta-törlés, körbeforduló eltolás négy irányba és sornyújtás.
* **Képimportáló:** PNG, JPEG, WebP vagy GIF képek kötéspróba-arányos átméretezése Median-Cut színkvantálással, fényerő-, kontraszt-, dithering- és átlátszóság-kezeléssel.
* **Export formátumok:** színes **PNG**, színes vagy monokróm **SVG**, nyomtatható **PDF** (színes, fonalbetűs monokróm, valamint többoldalas **A4 poszter** bontás), szöveges leírás (`.txt`) és hordozható `.knit` projektfájlok. Minden export sötét módban is tiszta fehér papírprofilt használ.
* **Mintakönyvtár:** helyben tárolt minták létrehozása, duplikálása, importálása, exportálása és törlése.

#### 5. Kiegészítő eszközök
* **Számítások:** centiméter–szemszám kötéspróba-átváltó, egyenletes szaporítás/fogyasztás-elosztó, kötőtű-méret táblázat (`mm / US / UK`) és fonalvastagsági útmutató.
* **Sablonok:** méretezett ruhadarab-kiindulások (kereknyakú pulóver, ujja, sapka, zokni, raglán) pipálható lépéslistával és a tervezőben lévő minta illeszkedés-ellenőrzésével.
* **Projektek:** több független számlálót és szabad jegyzeteket támogató helyi projektkövető.
* **Útmutató:** teljesen kezdőknek szóló, lépésről lépésre felépített képes-szöveges bevezető, kereshető kötésrövidítés-szótár és önálló sor szemszám-ellenőrző.

### Billentyűparancsok

| Billentyű | Művelet |
| :--- | :--- |
| `Nyilak` | Kurzor mozgatása a rácson |
| `Shift + Nyilak` | Kijelölési téglalap bővítése |
| `Space` / `Enter` | Aktív szem vagy fonal festése |
| `Space` nyomva tartása + húzás | Vászon mozgatása |
| `Alt` nyomva tartása + kattintás | Ideiglenes pipetta |
| `Ctrl/Cmd + Görgő` | Nagyítás és kicsinyítés |
| `Delete` / `Backspace` | Cella vagy kijelölés törlése |
| `Esc` | Kijelölés, bélyegző vagy nyitott ablak bezárása |
| `Tab` | Zen mód ki- és bekapcsolása |
| `Ctrl/Cmd + K` | Parancspaletta megnyitása |
| `Ctrl/Cmd + Z` / `Y` | Visszavonás / Újra (`Shift + Ctrl/Cmd + Z` szintén Újra) |
| `Ctrl/Cmd + C` / `X` / `V` | Kijelölés másolása / kivágása / beillesztése |
| `P`, `E`, `N`, `F`, `L`, `R`, `I`, `S`, `H` | Rajzeszköz váltása |
| `Space` / `↑` / `→` *(Kötés módban)* | Ugrás a következő sorra |
| `↓` / `←` *(Kötés módban)* | Visszalépés az előző sorra |

### Érintéses és tabletes gesztusok

| Gesztus / Vezérlő | Művelet |
| :--- | :--- |
| Egyujjas húzás | Aktív cellák festése, radírozása, alakzatrajzolása vagy kijelölése |
| Kétujjas csippentés és mozgatás | Folyamatos nagyítás és görgetés (automatikusan visszavonja az első ujj véletlen pöttyét) |
| Kétujjas koppintás | Visszavonás |
| Háromujjas koppintás | Újra |
| **Csak tollal rajzol mód** | Az ujj csak görgeti a vásznat, rajzolni kizárólag a digitális toll tud (tenyérelutasítás) |
| Lebegő gomb húzása *(Telefon)* | Szabad áthelyezés a képernyő biztonságos margóján belül |
| Alsó lap lehúzása *(Telefon)* | Nyitott panel bezárása a fogantyúnál fogva |

### Adatvédelem, biztonság és offline működés

1. **100%-ban kliensoldali feldolgozás:** minden minta, projekt és munkaterület-beállítás helyben, a böngésző `localStorage` tárhelyén marad; nincs háttérszerver, felhasználói fiók vagy telemetria.
2. **Offline PWA támogatás:** telepíthető asztali és mobil eszközökre, internetkapcsolat nélkül is teljes körűen működik.
3. **Szigorú bemenet-ellenőrzés és biztonságos export:** az importált `.knit` fájlokat a `validDoc()` ellenőrzi, a képfeltöltés MIME-típus ellenőrzést, 12 bájtos magic-byte aláírást, 8 MB méretkorlátot és 50 MP felbontáskorlátot kényszerít ki, az SVG export pedig minden szöveget az `escXml` segítségével véd.

### Projektfelépítés és parancsok

```text
├── public/                        # Alkalmazásikonok és PWA erőforrások
├── src/
│   ├── core.ts                    # Típusok, EN/HU fordítások, validáció, helyi tárolás
│   ├── knitEngine.ts              # Szemelemzés, vászonrajzoló, PNG/SVG/PDF export, képimport
│   ├── ui.tsx                     # Újrahasználható stúdió UI-elemek és PWA hookok
│   ├── FloatingIslands.tsx        # Mobilos lebegő szigetek és lehúzható érintéses fiókok
│   ├── DesignerWorkspace.tsx      # Tervező munkaterület, tabletes sávok, fiókok, könyvtár, parancspaletta
│   ├── ToolsViews.tsx             # Számítások, sablonok, projektek, szótár nézetek
│   ├── App.tsx                    # Fő keretrendszer, témaváltó, navigáció
│   ├── main.tsx                   # Alkalmazás belépési pont és offline regisztráció
│   └── index.css                  # Központi színtokenek, tipográfia és pontrácsos stílusok
├── LICENSE                        # GNU General Public License v3.0
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

```bash
npm install        # Függőségek telepítése
npm run dev        # Fejlesztői szerver indítása (http://localhost:3000)
npm run lint       # TypeScript típusellenőrzés
npm run build      # Produkciós PWA csomag fordítása a dist/ mappába
npm run build:html # Önálló egyfájlos HTML fordítása a dist/index.html fájlba
```

### Licenc (`GNU General Public License v3.0`)

Ez a program szabad szoftver: terjesztheted és/vagy módosíthatod a **GNU General Public License 3.0, vagy (választásod szerint) bármely későbbi verziójának** feltételei szerint. A teljes angol nyelvű jogi szöveget a **[LICENSE](./LICENSE)** fájl tartalmazza.

A program abban a reményben kerül közreadásra, hogy hasznos lesz, **azonban MINDENNEMŰ GARANCIA NÉLKÜL**, beleértve az **ELADHATÓSÁGRA** vagy egy **ADOTT CÉLRA VALÓ ALKALMASSÁGRA** vonatkozó hallgatólagos garanciát is. A felhasználók által készített kötésminták továbbra is saját szellemi alkotásuk maradnak.
