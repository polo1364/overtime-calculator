# Neo Brutal UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dark command-deck presentation with an accessible, bright Neo Brutal single-page UI while preserving every payroll calculation, DOM ID, storage key, PWA behavior, and public motion API.

**Architecture:** Keep `index.html` as the existing application and data-flow owner. Put global layout and responsive rules in `styles.css`, scoped Uiverse-derived interaction treatments in `uiverse.css`, animation behavior in `motion.js`, and regression guards in `verify-ui-contract.mjs`. Adapt only the visual layer; do not introduce a framework, dependency, duplicate calendar DOM, or new navigation state.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, local GSAP 3.15.0, Service Worker, Node-based contract scripts.

## Global Constraints

- Preserve every existing DOM ID, LocalStorage key, inline handler target, payroll formula, insurance table, holiday array, typhoon-holiday array, and makeup-workday array.
- Preserve the complete `window.UiMotion` API: `initialReveal`, `workflowTransition`, `calendarReveal`, `importHighlight`, `resultReveal`, `openRecordPanel`, `closeRecordPanel`, `openModal`, and `closeModal`.
- Use a bright warm off-white background, near-black text, 3–4px black borders, and offset hard shadows.
- Use local fonts only: `Microsoft JhengHei`, `PingFang TC`, and system sans-serif fallbacks.
- Body text is at least 14px, primary inputs at least 16px, supporting labels at least 12px, and all interactive targets at least 44×44px.
- Do not apply glitch, blur, scan lines, or multi-layer shadows to text.
- Do not use color as the only state indicator.
- Keep the existing seven-column calendar table on desktop and reuse the same DOM as a weekly vertical list at 768px and below.
- At 480px and below, use a single-column summary, result layout, and full-width primary buttons.
- Keep all runtime assets local and maintain offline PWA loading.
- Treat existing uncommitted changes as user-owned. Before editing an overlapping file, capture `git diff -- <file>`; never reset, overwrite, or stage unrelated hunks.
- When committing a task, use `git add -p` for already-dirty files and verify `git diff --cached --name-only` and `git diff --cached` before committing.

---

### Task 1: Lock the Neo Brutal UI contract

**Files:**
- Modify: `verify-ui-contract.mjs:1-90`
- Test: `verify-ui-contract.mjs`

**Interfaces:**
- Consumes: existing `index.html`, `styles.css`, `motion.js`, `service-worker.js`, and `manifest.json` text.
- Produces: deterministic assertions for the stylesheet split, Neo Brutal tokens, readable typography, responsive layout, and scoped Uiverse adaptations.

- [ ] **Step 1: Capture the pre-existing diff before editing**

Run:

```powershell
git diff -- verify-ui-contract.mjs
```

Expected: empty output unless the user added new changes after this plan was written. If non-empty, preserve every existing hunk.

- [ ] **Step 2: Add failing Neo Brutal contract assertions**

Add `const uiverse = read('uiverse.css');` next to the existing asset reads, then add these assertions after the active stylesheet ordering assertion:

```js
assert(html.indexOf('href="./styles.css"') < html.indexOf('href="./uiverse.css"'), 'uiverse.css must load after styles.css');
assert(/--paper:\s*#fff8e7/i.test(css), 'warm paper token is missing');
assert(/--ink:\s*#101010/i.test(css), 'near-black ink token is missing');
assert(/--brutal-border:\s*3px solid var\(--ink\)/i.test(css), 'Neo Brutal border token is missing');
assert(/--brutal-shadow:\s*6px 6px 0 var\(--ink\)/i.test(css), 'Neo Brutal hard-shadow token is missing');
assert(/font-family:[^;]*(?:Microsoft JhengHei|PingFang TC)/i.test(css), 'Traditional Chinese local font stack is missing');
assert(/\.form-input[^}]*font-size:\s*(?:1rem|16px)/i.test(`${css}\n${uiverse}`), 'primary inputs must be at least 16px');
assert(/\.btn:active[^}]*transform:\s*translate\(4px,\s*4px\)/i.test(uiverse), 'physical button press treatment is missing');
assert(/\.nb-card[^}]*border:\s*var\(--brutal-border\)/i.test(uiverse), 'scoped Uiverse card treatment is missing');
assert(!/\.\w*(?:title|label|text)[^{]*\{[^}]*(?:filter:\s*blur|animation:\s*[^;]*glitch)/i.test(`${css}\n${uiverse}`), 'text clarity is weakened by blur or glitch');
assert(/@media\s*\(max-width:\s*480px\)[\s\S]*?\.dashboard-summary[^}]*grid-template-columns:\s*1fr/i.test(css), 'small-screen summary must be one column');
```

- [ ] **Step 3: Run the contract and verify that it fails for the intended reason**

Run:

```powershell
node verify-ui-contract.mjs
```

Expected: failure beginning with `UI contract failed: uiverse.css must load after styles.css`.

- [ ] **Step 4: Commit only the contract change if it can be isolated from user work**

Run:

```powershell
git add -p -- verify-ui-contract.mjs
git diff --cached --check
git diff --cached --name-only
git commit -m "test: define neo brutal UI contract"
```

Expected staged file: only `verify-ui-contract.mjs`. If unrelated hunks cannot be separated safely, leave the task uncommitted and record the reason before continuing.

---

### Task 2: Establish the bright Neo Brutal shell and scoped component layer

**Files:**
- Modify: `index.html:3625-4175`
- Modify: `styles.css:1-404`
- Modify: `uiverse.css:1-4`
- Test: `verify-ui-contract.mjs`

**Interfaces:**
- Consumes: existing classes and IDs in `index.html`; global design tokens in `styles.css`.
- Produces: `--paper`, `--ink`, `--brutal-border`, `--brutal-shadow`, `.nb-card`, readable form controls, physical buttons, and a linked `uiverse.css` layer.

- [ ] **Step 1: Capture current user-owned diffs**

Run:

```powershell
git diff -- index.html styles.css
Get-Content -Raw uiverse.css
```

Expected: existing redesign work is visible and retained as the starting point.

- [ ] **Step 2: Link the scoped Uiverse stylesheet after the base stylesheet**

Change the active stylesheet block in `index.html` to exactly:

```html
  <link rel="stylesheet" href="./styles.css">
  <link rel="stylesheet" href="./uiverse.css">
```

- [ ] **Step 3: Replace the dark global tokens and shell treatment**

Define these tokens at the start of `styles.css` and use them for `body`, `.header`, `.card`, `.workflow-card`, and `.payslip`:

```css
:root {
  --paper: #fff8e7;
  --paper-raised: #ffffff;
  --ink: #101010;
  --ink-soft: #353535;
  --blue: #3978ff;
  --green: #73e5a5;
  --yellow: #ffd84e;
  --red: #ff5b45;
  --pink: #ff9ac9;
  --cyan: #73e5d1;
  --brutal-border: 3px solid var(--ink);
  --brutal-shadow: 6px 6px 0 var(--ink);
  --brutal-shadow-blue: 6px 6px 0 var(--blue);
  --radius: 8px;
  --font-ui: "Microsoft JhengHei", "PingFang TC", system-ui, sans-serif;
  --font-number: ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas, monospace;
}

body {
  min-width: 320px;
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font: 400 1rem/1.6 var(--font-ui);
}

.header {
  color: var(--ink);
  background: var(--yellow);
  border-bottom: 4px solid var(--ink);
}

.card,
.payslip,
.workflow-card {
  color: var(--ink);
  background: var(--paper-raised);
  border: var(--brutal-border);
  border-radius: var(--radius);
  box-shadow: var(--brutal-shadow);
}
```

Remove active glass gradients, dark page overlays, low-contrast gray text, and soft ambient shadows that conflict with these declarations. Keep layout-related widths, grids, and spacing.

- [ ] **Step 4: Replace the deprecated `uiverse.css` marker with scoped adaptations**

Use the following complete base in `uiverse.css`:

```css
/* Adapted from Uiverse.io components by 0xnihilism (MIT). */
.nb-card {
  border: var(--brutal-border);
  background: var(--paper-raised);
  box-shadow: var(--brutal-shadow);
}

.form-input,
.record-input,
.record-item-edit-input,
.day-input {
  min-height: 44px;
  border: var(--brutal-border);
  border-radius: 4px;
  background: #fff;
  color: var(--ink);
  font-family: var(--font-ui);
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 4px 4px 0 var(--blue);
}

.form-input:focus,
.record-input:focus,
.record-item-edit-input:focus,
.day-input:focus {
  outline: 3px solid var(--yellow);
  outline-offset: 3px;
  border-color: var(--ink);
}

.btn,
.record-add-btn,
.record-import-btn {
  min-height: 44px;
  border: var(--brutal-border);
  border-radius: 4px;
  background: var(--ink);
  color: #fff;
  font-family: var(--font-ui);
  font-weight: 900;
  box-shadow: 6px 6px 0 var(--blue);
  transition: transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease;
}

.btn:hover,
.record-add-btn:hover,
.record-import-btn:hover {
  background: var(--blue);
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 var(--ink);
}

.btn:active,
.record-add-btn:active,
.record-import-btn:active {
  transform: translate(4px, 4px);
  box-shadow: 0 0 0 var(--ink);
}
```

- [ ] **Step 5: Apply explicit readable text roles**

Ensure these declarations exist in `styles.css`:

```css
.card-subtitle,
.form-label,
.summary-label,
.note-text,
.modal-content,
.record-guide-step-text {
  color: var(--ink-soft);
  font-size: max(.875rem, 14px);
}

.header h1,
.card-title,
.payslip-title,
.modal-title {
  color: var(--ink);
  font-weight: 900;
}
```

- [ ] **Step 6: Run the automated contracts**

Run:

```powershell
node verify-ui-contract.mjs
node verify-payslip.mjs
```

Expected: the Neo Brutal assertions progress beyond the stylesheet-link and token checks; payroll verification prints the same `46627` rounded result. Any later contract failures identify work assigned to subsequent tasks.

- [ ] **Step 7: Review and checkpoint the shell change**

Run:

```powershell
git diff --check
git diff -- index.html styles.css uiverse.css verify-ui-contract.mjs
```

If task hunks can be separated from pre-existing work, stage them with `git add -p` and commit as `feat: establish neo brutal UI foundation`. Otherwise leave them unstaged and continue with an explicit dirty-tree note.

---

### Task 3: Restyle the workflow summary and calendar without changing its DOM

**Files:**
- Modify: `styles.css:237-307,405-434,479-497,642-672`
- Modify: `uiverse.css`
- Test: `verify-ui-contract.mjs`

**Interfaces:**
- Consumes: existing `.workflow-step`, `.summary-tile`, `.calendar`, `.day-input`, `.quick-btn`, `.has-overtime`, and `.overtime-alert` classes.
- Produces: color-coded summary tiles, seven-column Brutal calendar cells, physical quick-hour keys, and the existing weekly mobile list at 768px.

- [ ] **Step 1: Extend the contract for calendar states**

Add these assertions to `verify-ui-contract.mjs`:

```js
assert(/\.summary-tile:nth-child\(1\)[^}]*background:\s*var\(--yellow\)/i.test(css), 'summary color coding is missing');
assert(/\.calendar td[^}]*border:\s*var\(--brutal-border\)/i.test(css), 'calendar cells need Neo Brutal borders');
assert(/\.quick-btn:active[^}]*box-shadow:\s*(?:none|0 0 0)/i.test(uiverse), 'quick-hour keys need a pressed state');
assert(/\.calendar td\.has-overtime[^}]*background:\s*var\(--green\)/i.test(css), 'filled overtime state is missing');
assert(/\.calendar td\.overtime-alert[^}]*background:\s*var\(--red\)/i.test(css), 'overtime warning state is missing');
```

- [ ] **Step 2: Run the contract and confirm the new assertions fail**

Run: `node verify-ui-contract.mjs`

Expected: failure at `summary color coding is missing`.

- [ ] **Step 3: Implement summary and workflow color coding**

Add to `styles.css`:

```css
.workflow-step-no {
  border: 2px solid var(--ink);
  background: #fff;
  color: var(--ink);
  box-shadow: 3px 3px 0 var(--ink);
}
.workflow-step.active .workflow-step-no { background: var(--yellow); }
.workflow-step.done .workflow-step-no { background: var(--green); }
.summary-tile { border: var(--brutal-border); box-shadow: 4px 4px 0 var(--ink); }
.summary-tile:nth-child(1) { background: var(--yellow); }
.summary-tile:nth-child(2) { background: var(--green); }
.summary-tile:nth-child(3) { background: var(--pink); }
.summary-tile:nth-child(4) { background: var(--cyan); }
.summary-value { color: var(--ink); font: 800 .95rem var(--font-number); }
```

- [ ] **Step 4: Implement the calendar and quick-key states**

Add or replace with:

```css
.calendar { border-spacing: 8px; }
.calendar th { color: var(--ink); font: 800 .75rem var(--font-ui); }
.calendar td {
  height: 142px;
  border: var(--brutal-border);
  border-radius: 4px;
  background: #fff;
  box-shadow: 4px 4px 0 var(--ink);
}
.calendar td.cell-weekend { background: #ffe2e2; }
.calendar td.cell-festival { background: #fff0a8; }
.calendar td.has-overtime { background: var(--green); }
.calendar td.overtime-alert { background: var(--red); }
.day-date, .day-badge { color: var(--ink); font-family: var(--font-number); }
```

Add to `uiverse.css`:

```css
.quick-btn {
  min-width: 44px;
  min-height: 44px;
  border: 2px solid var(--ink);
  border-radius: 3px;
  background: #fff;
  color: var(--ink);
  font-weight: 900;
  box-shadow: 3px 3px 0 var(--ink);
}
.quick-btn:hover { background: var(--yellow); }
.quick-btn:active { transform: translate(3px, 3px); box-shadow: none; }
.quick-btn-c { background: #ffe0dc; color: #8b1608; }
```

- [ ] **Step 5: Preserve the responsive table-to-list contract**

At `max-width: 768px`, retain the existing block conversion and add readable spacing:

```css
@media (max-width: 768px) {
  .calendar, .calendar tbody, .calendar tr, .calendar td { display: block; width: 100%; }
  .calendar tr { margin-bottom: 1.25rem; border-top: 4px solid var(--ink); }
  .calendar tr::before { color: var(--ink); background: var(--yellow); font: 900 .875rem var(--font-ui); }
  .calendar td { min-height: 120px; height: auto; margin: .65rem 0; }
  .calendar td.empty { display: none; }
}
@media (max-width: 480px) {
  .dashboard-summary { grid-template-columns: 1fr; }
}
```

- [ ] **Step 6: Run tests and checkpoint**

Run:

```powershell
node verify-ui-contract.mjs
node verify-payslip.mjs
git diff --check
```

Expected: all calendar-specific assertions pass and payroll output remains unchanged. Checkpoint commit message: `feat: restyle workflow and overtime calendar` when hunks can be isolated safely.

---

### Task 4: Restyle payroll forms and the payslip result

**Files:**
- Modify: `styles.css:308-478`
- Modify: `uiverse.css`
- Modify: `index.html:3780-4020` only if a visible `固定金額` marker cannot be supplied with CSS
- Test: `verify-ui-contract.mjs`

**Interfaces:**
- Consumes: existing `.form-*`, `.leave-type-*`, `.payslip-*`, `#finalNetPay`, and result IDs.
- Produces: readable form groups, explicit readonly styling, tactile leave cards, and a paper-ledger payslip with the net amount first.

- [ ] **Step 1: Add failing form and payslip assertions**

Add:

```js
assert(/\.form-input\[readonly\][^}]*background:\s*#f1ead8/i.test(css), 'readonly fields need an explicit paper treatment');
assert(/\.leave-type-item[^}]*border:\s*var\(--brutal-border\)/i.test(css), 'leave cards need Neo Brutal borders');
assert(/\.payslip-header[^}]*background:\s*var\(--yellow\)/i.test(css), 'net pay header must be visually primary');
assert(/\.payslip-amount[^}]*color:\s*var\(--ink\)/i.test(css), 'net pay amount must use readable ink');
```

Run `node verify-ui-contract.mjs` and expect failure at the readonly-field assertion.

- [ ] **Step 2: Implement form and readonly styles**

Use:

```css
.form-label, .record-add-field label { color: var(--ink); font-size: .875rem; font-weight: 800; }
.form-input[readonly] {
  background: #f1ead8;
  color: var(--ink);
  border-style: dashed;
  box-shadow: 4px 4px 0 #8f846d;
}
.leave-type-item {
  border: var(--brutal-border);
  border-radius: 4px;
  background: #fff;
  box-shadow: 4px 4px 0 var(--pink);
}
.leave-type-item:focus-within { outline: 3px solid var(--yellow); outline-offset: 2px; }
.leave-type-badge { color: var(--ink); background: var(--cyan); border: 2px solid var(--ink); }
```

If CSS cannot create an accessible readonly marker, add `<span class="readonly-marker">固定金額</span>` beside the bonus and meal labels and style it as a bordered tag. Do not change input IDs or values.

- [ ] **Step 3: Implement the paper-ledger payslip**

Use:

```css
.payslip-header { background: var(--yellow); border-bottom: 4px solid var(--ink); }
.payslip-title, .payslip-amount, .payslip-subtitle { color: var(--ink); }
.payslip-amount { font: 900 clamp(2rem, 6vw, 3.5rem) var(--font-number); }
.payslip-summary { gap: 8px; padding: 12px; background: var(--paper); }
.payslip-summary-card { border: 2px solid var(--ink); background: #fff; box-shadow: 3px 3px 0 var(--ink); }
.payslip-summary-card strong, .payslip-summary-card span { color: var(--ink); }
.payslip-section { border: var(--brutal-border); background: #fff; box-shadow: 5px 5px 0 var(--ink); }
.payslip-section:first-child { box-shadow: 5px 5px 0 var(--green); }
.payslip-section:last-child { box-shadow: 5px 5px 0 var(--red); }
.payslip-row { border-bottom: 2px solid var(--ink); }
.payslip-row.total { background: var(--yellow); border: 2px solid var(--ink); padding-inline: .5rem; }
```

- [ ] **Step 4: Verify calculations and responsive result order**

Run:

```powershell
node verify-payslip.mjs
node verify-ui-contract.mjs
```

Expected: payroll fixture still rounds to `46627`; all new form and payslip assertions pass. At 480px, `.payslip-body` and `.payslip-summary` remain one column.

- [ ] **Step 5: Checkpoint**

Review `git diff -- index.html styles.css uiverse.css`, stage only task hunks with `git add -p`, and use commit message `feat: restyle payroll form and payslip` when isolation is safe.

---

### Task 5: Restyle the record drawer, modal, and feedback states

**Files:**
- Modify: `styles.css:498-641`
- Modify: `uiverse.css`
- Test: `verify-ui-contract.mjs`

**Interfaces:**
- Consumes: existing record-panel and modal markup, ARIA attributes, focus trap, inert lifecycle, and feedback state classes.
- Produces: desktop side board, mobile full-screen work board, tactile controls, and non-color-only feedback cards.

- [ ] **Step 1: Add failing drawer and feedback assertions**

Add:

```js
assert(/\.record-panel[^}]*border-left:\s*4px solid var\(--ink\)/i.test(css), 'record board needs a strong boundary');
assert(/\.record-feedback\.success[^}]*background:\s*var\(--green\)/i.test(css), 'success feedback card is missing');
assert(/\.record-feedback\.error[^}]*background:\s*var\(--red\)/i.test(css), 'error feedback card is missing');
assert(/@media\s*\(max-width:\s*768px\)[\s\S]*?\.record-panel[^}]*width:\s*100%/i.test(css), 'mobile record board must be full width');
```

Run `node verify-ui-contract.mjs` and expect failure at the record-board boundary assertion.

- [ ] **Step 2: Implement the record work board**

Use:

```css
.record-panel {
  width: min(560px, 100%);
  border-left: 4px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  box-shadow: -10px 0 0 var(--blue);
}
.record-panel-header {
  border-bottom: 4px solid var(--ink);
  background: var(--yellow);
  color: var(--ink);
}
.record-panel-body > div,
.record-item {
  border: var(--brutal-border);
  border-radius: 4px;
  background: #fff;
  box-shadow: 4px 4px 0 var(--ink);
}
.record-bonus-section { box-shadow: 4px 4px 0 var(--yellow) !important; }
.record-import-section { box-shadow: 4px 4px 0 var(--green) !important; }
```

- [ ] **Step 3: Implement tactile secondary controls and feedback cards**

Add to `uiverse.css`:

```css
.record-panel-close,
.record-clear-btn,
.record-item-edit,
.record-item-delete,
.record-quick-btn,
.record-item-edit-btn {
  min-width: 44px;
  min-height: 44px;
  border: 2px solid var(--ink);
  border-radius: 3px;
  background: #fff;
  color: var(--ink);
  box-shadow: 3px 3px 0 var(--ink);
}
.record-item-delete, .record-clear-btn { background: #ffe0dc; color: #701308; }
.record-panel-close:active,
.record-clear-btn:active,
.record-item-edit:active,
.record-item-delete:active,
.record-quick-btn:active,
.record-item-edit-btn:active { transform: translate(3px, 3px); box-shadow: none; }
```

Add to `styles.css`:

```css
.record-feedback { border: var(--brutal-border); color: var(--ink); font-weight: 800; }
.record-feedback.success { background: var(--green); }
.record-feedback.warning { background: var(--yellow); }
.record-feedback.error { background: var(--red); }
.modal-overlay { background: rgba(16, 16, 16, .72); }
.modal { border: 4px solid var(--ink); background: var(--paper); color: var(--ink); box-shadow: 8px 8px 0 var(--blue); }
.modal-content { color: var(--ink-soft); }
@media (max-width: 768px) {
  .record-panel { width: 100%; max-width: none; border-left: 0; box-shadow: none; }
}
```

- [ ] **Step 4: Verify semantics remain intact**

Run:

```powershell
node verify-ui-contract.mjs
rg -n 'role="dialog"|aria-modal="true"|setAppInert\(true\)|setAppInert\(false\)|trapDialogFocus' index.html
```

Expected: contract passes drawer assertions; both dialogs retain ARIA semantics, inert lifecycle, and focus trapping.

- [ ] **Step 5: Checkpoint**

Run `git diff --check`; stage only isolated task hunks and use commit message `feat: restyle record board and dialogs` when safe.

---

### Task 6: Align motion and PWA caching with the new visual layer

**Files:**
- Modify: `motion.js:1-96`
- Modify: `service-worker.js:1-15`
- Modify: `manifest.json`
- Modify: `verify-ui-contract.mjs`
- Test: `verify-ui-contract.mjs`

**Interfaces:**
- Consumes: the unchanged `window.UiMotion` API and stylesheet URLs from previous tasks.
- Produces: restrained non-text-distorting motion, reduced-motion fallback, cache `salary-neo-brutal-v16`, and offline caching for `uiverse.css`.

- [ ] **Step 1: Add failing motion and cache assertions**

Add:

```js
assert(/const CACHE_NAME = 'salary-neo-brutal-v16'/.test(sw), 'Neo Brutal cache version is missing');
assert(sw.includes("BASE_PATH + '/uiverse.css'"), 'uiverse.css is missing from the offline cache');
assert(!/rotation|rotate|filter|textShadow/.test(motion), 'motion must not distort readable text');
assert(manifest.theme_color === '#fff8e7', 'manifest theme color must match the paper background');
```

Run `node verify-ui-contract.mjs` and expect failure at the cache-version assertion.

- [ ] **Step 2: Restrain motion without changing API names**

Use position and opacity only for content reveals. Replace the existing reveal values with:

```js
workflowTransition: (step) => animate(step, { y: 4, autoAlpha: .75 }, { y: 0, autoAlpha: 1, duration: .2, ease: 'power1.out' }),
calendarReveal: () => animate('#calendar tbody td:not(.empty)', { y: 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .2, stagger: .012, ease: 'power1.out' }),
importHighlight: (targets) => animate(targets, { y: 4, autoAlpha: .7 }, { y: 0, autoAlpha: 1, duration: .24, stagger: .018, ease: 'power1.out' }),
```

Keep all nine API keys and existing reduced-motion short-circuits. Do not add rotation, blur, text-shadow animation, particles, or money bursts.

- [ ] **Step 3: Update the atomic offline cache**

Change the beginning of `service-worker.js` to:

```js
const CACHE_NAME = 'salary-neo-brutal-v16';
const BASE_PATH = self.location.pathname.replace('/service-worker.js', '');

const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/styles.css',
  BASE_PATH + '/uiverse.css',
  BASE_PATH + '/vendor/gsap.min.js',
  BASE_PATH + '/motion.js',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/assets/icons.svg'
];
```

Retain `cache.addAll(urlsToCache)`, cache cleanup, network-first styles/scripts, and navigation fallback.

- [ ] **Step 4: Synchronize the installed PWA theme color**

Set the manifest theme color without changing the app name, icons, scope, start URL, or display mode:

```json
"theme_color": "#fff8e7",
"background_color": "#fff8e7"
```

- [ ] **Step 5: Run regression tests**

Run:

```powershell
node verify-ui-contract.mjs
node verify-payslip.mjs
```

Expected: `UI contract verified.` and unchanged payroll fixture output.

- [ ] **Step 6: Checkpoint**

Review and selectively stage task hunks. Commit message: `feat: align motion and offline cache` when isolation is safe.

---

### Task 7: Complete desktop, tablet, mobile, keyboard, and offline QA

**Files:**
- Modify: `MANUAL-REGRESSION.md`
- Modify: `styles.css`, `uiverse.css`, `index.html`, `motion.js`, or `service-worker.js` only for defects found by the checks below
- Test: `verify-ui-contract.mjs`, `verify-payslip.mjs`, browser at 1440px, 768px, and 375px

**Interfaces:**
- Consumes: the completed Neo Brutal visual layer and unchanged application behavior.
- Produces: evidence that the redesign is readable, responsive, keyboard-accessible, behavior-compatible, and offline-capable.

- [ ] **Step 1: Run the full automated baseline**

Run:

```powershell
node verify-payslip.mjs
node verify-ui-contract.mjs
git diff --check
```

Expected: payroll fixture still rounds to `46627`, UI contract prints `UI contract verified.`, and diff check prints no errors.

- [ ] **Step 2: Start the app with the repository's documented local server**

Run in a visible terminal owned by the task:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Expected: `Serving HTTP on 127.0.0.1 port 8000`. Do not run another build or server concurrently.

- [ ] **Step 3: Verify the 1440px desktop layout**

At `http://127.0.0.1:8000/`, set viewport to 1440px wide and confirm:

```text
Header and four summary tiles are readable.
Date inputs are two columns.
Calendar has seven columns and no horizontal clipping.
Salary form and payslip details use two columns.
Record panel opens from the right without covering its close control.
No console errors are present.
```

- [ ] **Step 4: Verify the 768px tablet layout**

Set viewport to 768px wide and confirm:

```text
Summary is two columns.
Calendar reuses the same table DOM as weekly vertical groups.
Salary form is one column.
Record panel uses the full available width.
All controls have at least a 44px target.
No horizontal page overflow is present.
```

- [ ] **Step 5: Verify the 375px mobile layout**

Set viewport to 375px wide and confirm:

```text
Summary is one column.
Input text is at least 16px and does not trigger zoom.
Each day exposes date, type, input, and 2/4/8/clear keys without overlap.
Net pay appears before income and deduction details.
Primary buttons are full width.
Record panel header and close button remain visible while scrolling.
Traditional Chinese labels remain fully readable.
```

- [ ] **Step 6: Verify keyboard and reduced-motion behavior**

Confirm:

```text
Tab and Shift+Tab reach every input and button in logical order.
Focus indicators remain visible on yellow, green, pink, cyan, white, and red surfaces.
Escape closes the modal and record panel and returns focus to the opener.
Background content is inert while a dialog is open.
With prefers-reduced-motion enabled, content appears without displacement, sweep, or spring effects.
```

- [ ] **Step 7: Verify core workflows**

Exercise these exact flows:

```text
Generate a date range and fill 2, 4, and 8 hours with shortcuts.
Clear a shortcut value and confirm the total updates.
Enter salary 39668, extra pay 0, pension 6, dependents 0, supplementary premium 0, and leave 0.
Confirm the zero-overtime deduction total is 4621 and the matching fixture rounds to net 46627 when additions total 7780.
Add, edit, delete, filter, and import overtime records.
Open and close every modal and the record panel with mouse and keyboard.
```

- [ ] **Step 8: Verify offline cache replacement**

Load once online, confirm the active cache is `salary-neo-brutal-v16`, reload with DevTools Offline, and verify `index.html`, `styles.css`, `uiverse.css`, `motion.js`, local GSAP, manifest, and icon load successfully.

- [ ] **Step 9: Record results and final checkpoint**

Update `MANUAL-REGRESSION.md` by replacing each completed checkbox with `[x]` and append a short dated note listing tested viewport widths and browser. Run the two Node scripts again, review the complete diff, and checkpoint with commit message `test: verify neo brutal responsive UI` only if staging does not capture unrelated user changes.

---

## Final Review Gate

Before claiming completion:

```powershell
node verify-payslip.mjs
node verify-ui-contract.mjs
git diff --check
git status --short
```

Completion requires fresh evidence for all commands plus browser checks at 1440px, 768px, and 375px. Report any environment failure verbatim and distinguish it from redesign regressions. Do not claim success from source inspection alone.
