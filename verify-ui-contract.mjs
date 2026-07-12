import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(`UI contract failed: ${message}`);
};

const html = read('index.html');
const css = read('styles.css');
const motion = read('motion.js');
const sw = read('service-worker.js');
const manifest = JSON.parse(read('manifest.json'));
const icon = read('assets/icons.svg');
const baselinePath = path.join(root, 'index.html.bak.20260712-2340');
assert(fs.existsSync(baselinePath), 'pre-redesign index baseline is missing');
const baselineHtml = fs.readFileSync(baselinePath, 'utf8');
const gsapPath = path.join(root, 'vendor/gsap.min.js');
assert(fs.existsSync(gsapPath), 'official GSAP vendor file is missing');
const gsap = fs.readFileSync(gsapPath, 'utf8');
const collect = (source, pattern) => new Set([...source.matchAll(pattern)].map((match) => match[1]));
const missingFrom = (expected, actual) => [...expected].filter((item) => !actual.has(item));
const extractArray = (source, name) => {
  const marker = source.indexOf(`const ${name} =`);
  assert(marker >= 0, `${name} declaration is missing`);
  const start = source.indexOf('[', marker);
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '[') depth += 1;
    if (char === ']' && --depth === 0) return source.slice(start, index + 1).replace(/\s+/g, '');
  }
  throw new Error(`UI contract failed: ${name} array is incomplete`);
};

assert(/<style id="legacyStyles" media="not all">/.test(html), 'legacy stylesheet must remain explicitly inert');
const legacyStyleEnd = html.indexOf('</style>');
const activeStylesheetLink = html.indexOf('href="./styles.css"');
assert(legacyStyleEnd >= 0 && activeStylesheetLink > legacyStyleEnd, 'styles.css link must load after the inert legacy stylesheet');
assert(!/money-burst-layer|money-coin|money-ring/.test(`${css}\n${motion}`), 'money burst effects must not exist in active assets');
assert(!/fonts\.(?:googleapis|gstatic)\.com|@import\s+url\(/i.test(`${html}\n${css}`), 'external font URLs are forbidden');
assert(!/<(?:script|link|img)\b[^>]*(?:src|href)="https?:\/\//i.test(html), 'all runtime assets must be local');
assert(html.indexOf('vendor/gsap.min.js') < html.indexOf('motion.js'), 'GSAP must load before motion.js');
assert(html.indexOf('motion.js') < html.lastIndexOf('<script>'), 'motion.js must load before app logic');
assert(!/maximum-scale\s*=\s*1|user-scalable\s*=\s*no/i.test(html), 'viewport zoom must remain available');
assert(/role="dialog"/.test(html) && /aria-modal="true"/.test(html), 'modal dialog semantics are missing');
assert(/id="recordPanel"[^>]+role="dialog"[^>]+aria-modal="true"/.test(html), 'record panel dialog semantics are missing');
assert(/setAppInert\(true\)/.test(html) && /setAppInert\(false\)/.test(html), 'modal inert lifecycle is missing');
assert(/data-week-label/.test(html), 'calendar rows need week labels');
assert(/aria-label="\$\{mm\}\/\$\{dd\} 填入 2 小時"/.test(html) && /aria-label="\$\{mm\}\/\$\{dd\} 清除加班時數"/.test(html), 'calendar shortcut labels are missing');
assert(/function calculateSettlementPeriod\s*\(/.test(html), 'settlement function must remain');
assert(/function updateTotal\s*\(/.test(html), 'updateTotal must remain');
assert(/const insuranceTable\s*=/.test(html), 'insuranceTable must remain');
const baselineIds = collect(baselineHtml, /\bid="([^"]+)"/g);
const currentIds = collect(html, /\bid="([^"]+)"/g);
assert(missingFrom(baselineIds, currentIds).length === 0, `required DOM ids are missing: ${missingFrom(baselineIds, currentIds).join(', ')}`);
const storagePattern = /localStorage\.(?:getItem|setItem|removeItem)\(\s*['"]([^'"]+)['"]/g;
const baselineStorageKeys = collect(baselineHtml, storagePattern);
const currentStorageKeys = collect(html, storagePattern);
assert(missingFrom(baselineStorageKeys, currentStorageKeys).length === 0, `localStorage keys changed: ${missingFrom(baselineStorageKeys, currentStorageKeys).join(', ')}`);
for (const name of ['holidays', 'typhoonHolidays', 'makeupWorkdays', 'insuranceTable']) {
  assert(extractArray(html, name) === extractArray(baselineHtml, name), `${name} business data changed`);
}
assert(/window\.UiMotion/.test(motion), 'window.UiMotion API is missing');
for (const api of ['initialReveal', 'workflowTransition', 'calendarReveal', 'importHighlight', 'resultReveal', 'openRecordPanel', 'closeRecordPanel', 'openModal', 'closeModal']) {
  assert(new RegExp(`${api}\\s*:`).test(motion), `UiMotion.${api} is missing`);
}
assert(/prefers-reduced-motion/.test(css) && /prefers-reduced-motion/.test(motion), 'reduced-motion support is incomplete');
assert(/@media\s*\(max-width:\s*768px\)/.test(css), 'mobile calendar breakpoint is missing');
assert(/\.calendar,\s*\.calendar tbody,\s*\.calendar tr,\s*\.calendar td\s*\{\s*display:\s*block/.test(css), 'mobile calendar must reuse the table DOM as a weekly list');
assert(/@media\s*\(max-width:\s*480px\)[\s\S]*?\.payslip-body\s*\{\s*grid-template-columns:\s*1fr/.test(css), 'small-screen payslip must use one column');
assert(/min-(?:height|width):\s*44px/.test(css), '44px target rule is missing');
assert(gsap.includes('GSAP 3.15.0'), 'official GSAP 3.15.0 vendor file is missing');
assert(/<title id="title">(?:薪資管理|&#x85AA;&#x8CC7;&#x7BA1;&#x7406;)<\/title>/.test(icon), 'icon title must be 薪資管理');
for (const selector of [
  '.record-guide-step', '.record-feedback', '.record-filter-section', '.record-bonus-section',
  '.record-import-section', '.record-empty', '.record-item-info', '.record-item-date',
  '.record-item-edit-form', '.record-quick-hours-btn', '.modal-icon', '.day-input.just-filled',
  '.calendar td.has-overtime', '.calendar td.overtime-alert'
]) {
  assert(css.includes(selector), `${selector} component style is missing`);
}
assert(/cache\.addAll\(urlsToCache\)/.test(sw), 'service worker must atomically cache required assets');
for (const asset of ['index.html', 'styles.css', 'motion.js', 'vendor/gsap.min.js', 'manifest.json', 'assets/icons.svg']) {
  assert(sw.includes(asset), `${asset} is missing from service-worker cache`);
}
assert(manifest.theme_color === '#061823', 'manifest theme color is not synchronized');

console.log('UI contract verified.');
