import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(`UI contract failed: ${message}`);
};

const html = read('index.html');
const css = read('styles.css');
const uiverse = read('uiverse.css');
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
const cssRuleBody = (source, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...source.matchAll(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'g'))]
    .map((match) => match[1])
    .join('\n');
};
const cssFontSizePx = (rule) => {
  const match = rule.match(/font-size\s*:\s*(\d*\.?\d+)(rem|px)\b/i)
    ?? rule.match(/font\s*:[^;]*?(?:^|\s)(\d*\.?\d+)(rem|px)\b/i);
  if (!match) return Number.NaN;
  const value = Number(match[1]);
  return match[2].toLowerCase() === 'rem' ? value * 16 : value;
};
const contrastRatio = (foreground, background) => {
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/.{2}/g).map((channel) => Number.parseInt(channel, 16) / 255);
    const linear = channels.map((channel) => (channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4));
    return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + .05) / (dark + .05);
};
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
assert(html.indexOf('href="./styles.css"') < html.indexOf('href="./uiverse.css"'), 'uiverse.css must load after styles.css');
assert(/--paper:\s*#fff8e7/i.test(css), 'warm paper token is missing');
assert(/--ink:\s*#101010/i.test(css), 'near-black ink token is missing');
const redInk = css.match(/--red-ink:\s*(#[0-9a-f]{6})/i);
assert(redInk, 'dark danger text token is missing');
assert(contrastRatio(redInk[1], '#ffffff') >= 4.5 && contrastRatio(redInk[1], '#ffd84e') >= 4.5, 'danger text must meet 4.5:1 contrast on white and yellow surfaces');
assert(/\.text-danger[^}]*color:\s*var\(--red-ink\)/i.test(css), 'deduction text must use the dark danger token');
assert(/--brutal-border:\s*3px solid var\(--ink\)/i.test(css), 'Neo Brutal border token is missing');
assert(/--brutal-shadow:\s*6px 6px 0 var\(--ink\)/i.test(css), 'Neo Brutal hard-shadow token is missing');
assert(/font-family:[^;]*(?:Microsoft JhengHei|PingFang TC)/i.test(css), 'Traditional Chinese local font stack is missing');
assert(/\.form-input[^}]*font-size:\s*(?:1rem|16px)/i.test(`${css}\n${uiverse}`), 'primary inputs must be at least 16px');
assert(/\.btn:active[^}]*transform:\s*translate\(4px,\s*4px\)/i.test(uiverse), 'physical button press treatment is missing');
assert(/\.nb-card[^}]*border:\s*var\(--brutal-border\)/i.test(uiverse), 'scoped Uiverse card treatment is missing');
assert(/\.summary-tile:nth-child\(1\)[^}]*background:\s*var\(--yellow\)/i.test(css), 'summary color coding is missing');
assert(/\.calendar td[^}]*border:\s*var\(--brutal-border\)/i.test(css), 'calendar cells need Neo Brutal borders');
assert(/\.quick-btn:active[^}]*box-shadow:\s*(?:none|0 0 0)/i.test(uiverse), 'quick-hour keys need a pressed state');
assert(/\.quick-btns[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/i.test(css), 'quick-hour controls must use a 2x2 grid');
assert(/\.quick-btn[^}]*min-width:\s*44px[^}]*min-height:\s*44px/i.test(uiverse), 'quick-hour keys must retain 44px targets');
assert(/\.calendar td\.has-overtime[^}]*background:\s*var\(--green\)/i.test(css), 'filled overtime state is missing');
assert(/\.calendar td\.overtime-alert[^}]*background:\s*var\(--red\)/i.test(css), 'overtime warning state is missing');
assert(/\.calendar td\.has-overtime[^}]*border(?:-color)?:\s*(?:var\(--ink\)|var\(--brutal-border\))/i.test(css), 'filled overtime state must retain an ink border');
assert(/\.calendar td\.overtime-alert[^}]*border(?:-color)?:\s*(?:var\(--ink\)|var\(--brutal-border\))/i.test(css), 'overtime warning state must retain an ink border');
assert(/\.form-input\[readonly\][^}]*background:\s*#f1ead8/i.test(css), 'readonly fields need an explicit paper treatment');
assert(/\.leave-type-item[^}]*border:\s*var\(--brutal-border\)/i.test(css), 'leave cards need Neo Brutal borders');
assert(/\.payslip-header[^}]*background:\s*var\(--yellow\)/i.test(css), 'net pay header must be visually primary');
assert(/\.payslip-amount[^}]*color:\s*var\(--ink\)/i.test(css), 'net pay amount must use readable ink');
assert(!/\.\w*(?:title|label|text)[^{]*\{[^}]*(?:filter:\s*blur|animation:\s*[^;]*glitch)/i.test(`${css}\n${uiverse}`), 'text clarity is weakened by blur or glitch');
const headerLabelRule = cssRuleBody(css, '.header-badge, .app-version, .section-label, .payslip-subtitle');
assert(/color:\s*var\(--ink\)/i.test(headerLabelRule), 'header and section labels must use near-black ink');
for (const selector of ['.calendar td', '.form-input, .record-input, .record-item-edit-input', '.day-input', '.fab', '.record-panel', '.record-panel-header']) {
  const rule = cssRuleBody(css, selector);
  assert(rule, `${selector} surface rule is missing`);
  assert(/background:\s*(?:var\(--paper(?:-raised)?\)|var\(--yellow\)|#fff(?:fff)?)(?:\s|;)/i.test(rule), `${selector} must use a bright surface`);
  assert(!/background:[^;]*(?:#0[0-9a-f]{5}|rgba\(0\s*,\s*(?:0|7|10|11|20|25))/i.test(rule), `${selector} still uses an active dark surface`);
}
assert(/\.record-panel[^}]*border-left:\s*4px solid var\(--ink\)/i.test(css), 'record board needs a strong boundary');
assert(/\.record-feedback\.success[^}]*background:\s*var\(--green\)/i.test(css), 'success feedback card is missing');
assert(/\.record-feedback\.error[^}]*background:\s*var\(--red\)/i.test(css), 'error feedback card is missing');
assert(/@media\s*\(max-width:\s*768px\)[\s\S]*?\.record-panel[^}]*width:\s*100%/i.test(css), 'mobile record board must be full width');
for (const selector of ['.leave-type-badge', '.calendar th', '.day-badge', '.fab-badge', '.record-guide-step-no', '.record-item-status']) {
  const rule = cssRuleBody(css, selector);
  assert(rule, `${selector} supporting-label rule is missing`);
  assert(cssFontSizePx(rule) >= 12, `${selector} must be at least 12px`);
}
for (const selector of ['.total-value', '.payslip-amount', '.record-item-hours, .record-bonus-hours', '.has-overtime .day-input', '.overtime-alert .day-input']) {
  const rule = cssRuleBody(css, selector);
  assert(rule, `${selector} readable-text rule is missing`);
  assert(/color:\s*var\(--ink\)/i.test(rule), `${selector} must use high-contrast ink text`);
}
assert(/@media\s*\(max-width:\s*480px\)[\s\S]*?\.dashboard-summary[^}]*grid-template-columns:\s*1fr/i.test(css), 'small-screen summary must be one column');
assert(/@media\s*\(max-width:\s*480px\)[\s\S]*?\.grid-2[^}]*grid-template-columns:\s*1fr/i.test(css), 'small-screen payroll form grids must be one column');
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
assert(/const CACHE_NAME = 'salary-neo-brutal-v16'/.test(sw), 'Neo Brutal cache version is missing');
const cachedUrls = extractArray(sw, 'urlsToCache');
assert(cachedUrls.includes("BASE_PATH+'/uiverse.css'"), 'uiverse.css is missing from the atomically installed offline cache');
assert(/if\s*\(isStyleOrScript\(event\.request\)\)\s*\{\s*event\.respondWith\(networkFirst\(event\.request\)\);\s*return;\s*\}/.test(sw), 'styles and scripts must use network-first caching');
assert(/return caches\.open\(CACHE_NAME\)\.then\(\(cache\) => cache\.put\(request, clone\)\)\.catch\(\(\) => \{\}\);/.test(sw), 'cache writes must return a promise');
assert((sw.match(/return cachePut\(request, response\)\.then\(\(\) => response\);/g) ?? []).length === 2, 'network-first and cache-first responses must await cache writes');
assert(/return caches\.match\(request\)\.then\(\(cached\) => cached \|\| response\);/.test(sw), 'non-200 network responses must fall back to a cached response');
assert(/networkFirst\(event\.request\)\.then\(\(response\) => response && response\.status === 200\s*\?\s*response\s*:\s*caches\.match\(BASE_PATH \+ '\/index\.html'\)\.then\(\(cached\) => cached \|\| response\)\)/.test(sw), 'navigation must fall back to cached index.html after an uncached error response');
assert(!/rotation|rotate|filter|textShadow|scale/.test(motion), 'motion must not distort readable text');
for (const asset of ['index.html', 'styles.css', 'uiverse.css', 'motion.js', 'vendor/gsap.min.js', 'manifest.json', 'assets/icons.svg']) {
  assert(sw.includes(asset), `${asset} is missing from service-worker cache`);
}
assert(manifest.theme_color === '#fff8e7', 'manifest theme color must match the paper background');
assert(manifest.background_color === '#fff8e7', 'manifest background color must match the paper background');

console.log('UI contract verified.');
