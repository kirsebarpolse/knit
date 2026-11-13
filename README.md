# Knit Workshop

[English](#english) · [Magyar](#magyar)

---

<a id="english"></a>

## English

Browser-based, offline-capable knitting pattern designer and toolkit featuring a real-proportion knitted-fabric preview, automatic stitch-count and float validation, hands-free knit mode, garment templates, and multi-page print export.

### Workspace and Visual System

* **Docked Four-Column Studio Shell:** Full-bleed responsive workspace combining a collapsible left **Tools** dock, central drafting canvas, and two independent right docks (**Stitch Symbols** and **Studio Inspector**) that both start **closed as compact icon rails** by default so the chart stays front and center.
* **Top Workspace Menu and Quick Rails:** A **Menu** dropdown in the top workspace bar keeps **Add custom stitch**, **Grid editor**, **Fills and Stamps**, **Pattern, Size and Export**, **Brush mode**, **Mirror H/V**, and panel toggles reachable even when every sidebar is collapsed. Closed icon rails also display clickable icons for **Mirror H/V** axes and **Brush modes** (`Yarn + stitch`, `Yarn only`, `Stitch only`), active stitch glyphs, health status, and pinned modal triggers.
* **Explicit Interactive Affordances:** Collapsible sections display rotating chevron indicators, drawer buttons show directional arrows, modal-opening actions carry external-launch cues, and expandable sidebars include clear open/close handles.
* **Monochrome Interface:** Strict black, white, and neutral gray UI surfaces to reduce visual fatigue; color is reserved exclusively for yarn swatches and critical error, warning, or pass indicators.
* **Light and Pitch-Black Dark Mode:** Subtle dotted drafting stage in light mode, pure black canvas surround in dark mode with shadowless panels.
* **Zen Mode (`Tab`):** Hides all sidebars with a single keystroke so the chart occupies the full viewport.

### Key Features

#### 1. Pattern Designer Workspace (`Designer`)
* **Dual View Modes:** Classic symbol **Grid View** (5-stitch and 10-stitch helper lines with odd/even row direction markers) and gauge-accurate **Knitted View**.
* **Color-Vision Accessibility (`A/B`):** Optionally displays yarn letters (`A–L`) directly inside grid cells.
* **Drawing Tools (Left Dock):** Pencil (`P`), Eraser (`E`), No Stitch / Hatched Skip (`N`), Flood Fill (`F`), Line (`L`), Rectangle (`R`), Eyedropper (`I` or hold `Alt`), Selection (`S`), and Hand Pan (`H` or hold `Space`).
* **Brush Modes and Symmetry:** Paint in **Yarn + stitch**, **Yarn only**, or **Stitch only** mode, with horizontal and vertical mirror axes and live guide lines—accessible in the expanded left dock, on closed left/right icon rails, and in the top **Menu** dropdown.
* **Yarn Palette:** Up to 12 yarns (`A–L`) with circular color pickers, live stitch counts, and percentage/meter/gram usage estimates.
* **Dedicated Stitch Symbols Column (Right Dock 1):** Starts collapsed as a single-click symbol glyph strip with a pinned **Add custom stitch** icon at the bottom, and expands into a two-column symbol grid covering all 13 built-in stitches (`k`, `p`, `yo`, `k2tog`, `skp`, `ssk`, `kfb`, `m1`, `sl`, `k3tog`, `cdd`, `c4f`, `c4b`) plus custom user-defined stitches (`uses` / `makes` stitch counts via the standalone **Add custom stitch** modal). 4-stitch cables (`c4f`, `c4b`) span cleanly across adjacent cells.
* **Selection and Transforms:** Copy, cut, paste, fill, clear, horizontal and vertical flip (automatically mirroring directional decreases and cables: `k2tog ↔ skp/ssk`, `c4f ↔ c4b`), and Undo/Redo history.
* **Fill Generators and Motif Stamps (`Fills and Stamps` drawer):**
  * Built-in houndstooth, horizontal/vertical stripes, checkerboard, zigzag, and diamond generators.
  * Save any selection as a reusable motif stamp with a live transparent ghost preview on hover before placing.
* **Command Palette (`Ctrl/Cmd + K`) and Cursor Ghost HUD:** Searchable quick-action launcher and live row/stitch coordinate HUD beside the cursor.

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
* **Grid Sizing and Shift:** Resize between `2–300` stitches and `2–400` rows, insert/delete rows or columns, wrap-around shift in four directions, and stretch rows.
* **Image Import:** Scales PNG, JPEG, WebP, or GIF images to gauge proportions using Median-Cut color quantization with brightness, contrast, dithering, and transparency-to-no-stitch options.
* **Export Formats:** Color **PNG**, Color or Monochrome **SVG**, printable **PDF** (Color, Monochrome with yarn letters, and tiled multi-page **A4 poster**), plain-text instructions (`.txt`), and portable `.knit` project files. All exports use a clean white-paper print profile even in dark mode.
* **Pattern Library:** Create, duplicate, import, export, and delete locally stored patterns.

#### 5. Additional Tools
* **Calculators:** Centimeter-to-stitch gauge converter, even increase/decrease spacing distributor, needle size table (`mm / US / UK`), and yarn weight guide.
* **Templates:** Sized garment starters (crewneck sweater, sleeve, beanie, socks, raglan) with checkable step lists and chart repeat fit checking.
* **Projects:** Local project tracker supporting multiple independent counters and free-form notes.
* **Reference:** Searchable stitch abbreviation glossary and standalone written-row stitch counter.

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
│   ├── DesignerWorkspace.tsx      # Designer workspace, drawers, library, command palette
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

* **Dokkolt négyoszlopos stúdiófelület:** szegélytől szegélyig érő reszponzív szerkesztő, amely egy összecsukható bal oldali **Eszközök** sávból, középső rajzvászonból és két független jobb oldali oszlopból (**Szemjelek** és **Vizsgálópanel**) áll; mindkét jobb oldali oszlop alapértelmezetten **zárt ikonsávként** indul, így a minta marad a középpontban.
* **Felső munkaterület-menü és zárt ikonsávok:** a felső sávban található **Menü** lenyíló menüből zárt oldalsávok mellett is azonnal elérhető a **Saját szemjel hozzáadása**, a **Rácsszerkesztő**, a **Kitöltés és bélyegzők**, a **Minta, méret és export**, az **Ecsetmód**, a **Tükrözés** és a panelek nyitása/zárása. A zárt ikonsávokon közvetlenül láthatók és kapcsolhatók a **Tükör (vízszintes/függőleges)** és **Ecsetmód** (`Fonál + szem`, `Csak fonál`, `Csak szem`) ikonok, az aktív szemjelek, az állapotjelző és az alul rögzített modális ablakindítók.
* **Egyértelmű interaktív jelzések:** a nyitható szakaszok forgó nyíljelekkel, a fiókgombok irányjelző nyilakkal, a külön ablakban nyíló funkciók kilépőnyíl-jelzéssel, az oldalsávok pedig határozott nyitó/záró fülekkel mutatják a kezelhetőséget.
* **Monokróm megjelenés:** szigorúan fekete, fehér és semleges szürke felületek a vizuális fáradtság csökkentéséért; szín kizárólag a fonalmintákon, valamint a kritikus hiba-, figyelmeztető és megfelelt jelzéseken jelenik meg.
* **Világos és tiszta fekete sötét mód:** finom pontrácsos rajzfelület világos módban, tiszta fekete vászonháttér sötét módban, árnyékmentes panelekkel.
* **Zen mód (`Tab`):** egyetlen billentyűvel elrejti az összes oldalsávot, így a minta a teljes képernyőt elfoglalja.

### Főbb funkciók

#### 1. Mintatervező munkaterület (`Tervező`)
* **Kétféle nézet:** klasszikus szimbólumos **Rács nézet** (5-ös és 10-es segédvonalakkal, páratlan/páros haladási irányjelzőkkel) és kötéspróba-arányos **Kötött nézet**.
* **Színvak-barát fonaljelölés (`A/B`):** opcionálisan megjeleníti a fonal betűjelét (`A–L`) közvetlenül a rácscellákban.
* **Rajzeszközök (Bal sáv):** Ecset (`P`), Radír (`E`), Nincs szem / sraffozott kihagyás (`N`), Kitöltés (`F`), Vonal (`L`), Téglalap (`R`), Pipetta (`I` vagy `Alt` nyomva tartva), Kijelölés (`S`) és Kéz / mozgatás (`H` vagy `Space` nyomva tartva).
* **Ecsetmódok és szimmetria:** festés **Fonal + szem**, **Csak fonal** vagy **Csak szem** módban, vízszintes és függőleges tükörtengelyekkel és élő segédvonalakkal — elérhető a nyitott bal sávban, a zárt ikonsávokon és a felső **Menü** lenyílóban is.
* **Fonalpaletta:** legfeljebb 12 fonal (`A–L`) kör alakú színválasztóval, élő szemszámlálóval és százalékos/méter/gramm becsléssel.
* **Önálló Szemjelek oszlop (Jobb sáv 1):** alapértelmezés szerint egykattintásos jelrácsos ikonsávként indul az alján rögzített **Saját szemjel hozzáadása** gombbal, kinyitva pedig kétoszlopos rácsban kínálja mind a 13 beépített szemjelet (`k`, `p`, `yo`, `k2tog`, `skp`, `ssk`, `kfb`, `m1`, `sl`, `k3tog`, `cdd`, `c4f`, `c4b`) és a külön modális ablakban felvehető egyedi felhasználói szemeket (`felhasznál` / `létrehoz` szemszámokkal). A 4-szemes csavarások (`c4f`, `c4b`) tisztán átívelnek a szomszédos cellákon.
* **Kijelölés és átalakítások:** másolás, kivágás, beillesztés, kitöltés, törlés, vízszintes és függőleges tükrözés (a dőlésirányú fogyasztások és csavarások automatikus cseréjével: `k2tog ↔ skp/ssk`, `c4f ↔ c4b`), valamint Undo/Redo előzmény.
* **Kitöltő generátorok és motívum-bélyegzők (`Kitöltés és bélyegzők` fiók):**
  * Beépített tyúkláb, vízszintes/függőleges csíkok, sakktábla, cikkcakk és rombusz generátorok.
  * Tetszőleges kijelölés mentése újrahasználható motívum-bélyegzőként, lehelyezés előtt élő áttetsző előnézettel a kurzor alatt.
* **Parancspaletta (`Ctrl/Cmd + K`) és kurzor-HUD:** kereshető gyorsparancs-indító és élő sor/szem koordináta-kijelző a kurzor mellett.

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
* **Rácsméret és eltolás:** méretezés `2–300` szem és `2–400` sor között, sorok/oszlopok beszúrása és törlése, körbeforduló eltolás négy irányba, valamint sornyújtás.
* **Képimportáló:** PNG, JPEG, WebP vagy GIF képek kötéspróba-arányos átméretezése Median-Cut színkvantálással, fényerő-, kontraszt-, dithering- és átlátszóság-kezeléssel.
* **Export formátumok:** színes **PNG**, színes vagy monokróm **SVG**, nyomtatható **PDF** (színes, fonalbetűs monokróm, valamint többoldalas **A4 poszter** bontás), szöveges leírás (`.txt`) és hordozható `.knit` projektfájlok. Minden export sötét módban is tiszta fehér papírprofilt használ.
* **Mintakönyvtár:** helyben tárolt minták létrehozása, duplikálása, importálása, exportálása és törlése.

#### 5. Kiegészítő eszközök
* **Számítások:** centiméter–szemszám kötéspróba-átváltó, egyenletes szaporítás/fogyasztás-elosztó, kötőtű-méret táblázat (`mm / US / UK`) és fonalvastagsági útmutató.
* **Sablonok:** méretezett ruhadarab-kiindulások (kereknyakú pulóver, ujja, sapka, zokni, raglán) pipálható lépéslistával és a tervezőben lévő minta illeszkedés-ellenőrzésével.
* **Projektek:** több független számlálót és szabad jegyzeteket támogató helyi projektkövető.
* **Szótár:** kereshető kötésrövidítés-szótár és önálló sor szemszám-ellenőrző.

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
│   ├── DesignerWorkspace.tsx      # Tervező munkaterület, fiókok, könyvtár, parancspaletta
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
