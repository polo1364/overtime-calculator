# Task 7 最終 QA 報告

## 2026-07-23 最終修正摘要

- 狀態：`DONE`
- 產品／contract 提交：`d01f7ef2a8a1cd3888870cd3191dd65412215fb0` (`fix: complete accessible UI state contracts`)
- `verify-ui-contract.mjs` 已改讀 tracked `fixtures/ui-contract-baseline.json`，不再依賴 untracked `index.html.bak.20260712-2340`。
- baseline 現在保存既有 DOM ID、三個 LocalStorage key、敏感薪資欄位 ID，以及 `holidays`、`typhoonHolidays`、`makeupWorkdays`、`insuranceTable` 的 canonical SHA-256。
- 工作流程以可見 icon + `進行中`／`已完成`／`待處理` 呈現，active step 同步 `aria-current="step"`。
- 每日加班超過 8 小時時顯示文字 warning，並設定 `aria-invalid`／`aria-describedby`；恢復至 8 小時以下後完整移除。
- 日期與本薪驗證改為 linked inline field errors；日期可分空白、格式、起訖顛倒，本薪可分缺值、格式、非正值。
- record feedback 使用 `role="status"`、`aria-live="polite"`、`aria-atomic="true"` 與 icon／label／message 結構。
- 兩個 readonly marker 的顯示文字均為 `固定金額`。
- 所有 record secondary button family 共用 44px target 與 visible pressed state。

### 驗證證據

- TDD RED 1：缺 fixture 時 `node verify-ui-contract.mjs` exit 1，`ENOENT ... fixtures/ui-contract-baseline.json`。
- TDD RED 2：fixture 落檔、產品尚未修正時 exit 1，首錯為 `UI contract failed: every workflow step needs a visible state signal`。
- GREEN：`node verify-ui-contract.mjs` → `UI contract verified.`。
- 薪資公式：`node verify-payslip.mjs` → 扣款 `4,621`、加項 fixture `7,780`、四捨五入實領 `46,627`。
- Clean checkout：detached temp worktree at `d01f7ef` 執行 `node verify-payslip.mjs` 與 `node verify-ui-contract.mjs`，兩者 exit 0；temp worktree 已移除。
- Browser repeat run：
  - `run-1`：2026-07-23T10:40:28.453Z～10:40:41.353Z，Chrome 150.0.7871.129 / Playwright 1.61.1，26／26 pass。
  - `run-2`：2026-07-23T10:40:45.035Z～10:40:57.497Z，Chrome 150.0.7871.129 / Playwright 1.61.1，26／26 pass。
- Browser scope：1440x1000、768x1000、375x812；invalid paths、ARIA state、44px/pressed controls、offline/cache、console/page/network/request failures。
- Repeat aggregate：`.superpowers/sdd/final-fixes-browser-runs.json`。
- `git diff --check` 與 `git diff --cached --check` 均 exit 0。

## 前次 QA 結果（e06bf04）

- 狀態：完成
- 最終提交：`e06bf048f71afa38d3780636305b2a4aa073f5dc` (`fix: cancel record panel opening tween`)
- 前置修正提交：
  - `c078dd5b19fa28d68616b70983d82d8aae8bf139` (`fix: harden overlay focus lifecycle`)
  - `76764cf3a66b199a9eaede36819c4b35c8684490` (`test: verify neo brutal responsive UI`)
- 瀏覽器自動化：50／50 連續 10 次通過，未使用 retry。
- 測試環境：本機 Google Chrome、Playwright 1.54.0、headless 模式。
- 視窗：1440x1000、768x1000、375x812。
- 最終 tracked tree 無未提交變更；既有 `.superpowers/` 證據與 `*.bak.*` 備份維持 untracked。

## 最終修正內容

1. 768px 薪資表單使用單欄；375px 主操作按鈕使用容器全寬。
2. 公告說明區改為高對比 Neo Brutal 配色；瀏覽器計算對比為 16.297:1。
3. Popup opening tween 使用 timeline reference 與 token；close 時取消，stale callback 不會回焦隱藏 dialog。
4. Overlay inert 與焦點由 active popup／record panel 共同推導；關閉頂層後仍保留剩餘 dialog 的 inert 與焦點。
5. Record panel opening tween 保存於 `recordPanelOpenMotion`；close 前先 kill，避免 `.38s` open tween 在 `.28s` close 完成後回寫 visible state。
6. Popup 同步管理 `aria-hidden`；record panel close 後維持 `active=false`、`aria-hidden=true`、`visibility:hidden`、`opacity:0`。
7. Reduced motion 完全停用 transition/animation，避免離散 visibility transition 造成焦點錯置。
8. 黃、綠、粉、青、白、紅控制項 surface 使用 3px ink focus outline。
9. UI contract 覆蓋 overlay-derived inert、popup token、panel tween cancellation、響應式與 focus 配色。
10. 未提交且沒有配套 CSS 的 header draft 已恢復為提交中的正式 header，所有最終 QA 均針對 clean tracked UI 執行。

## 修改檔案

- `MANUAL-REGRESSION.md`
- `index.html`
- `styles.css`
- `uiverse.css`
- `verify-ui-contract.mjs`

`motion.js`、`service-worker.js` 與 `UiMotion` 九個公開 API 名稱／簽名均未變更。

## TDD / 競態證據

### Popup 與 overlay RED → GREEN

- RED：Popup opening 中 Escape 後記錄到 1 次 hidden-dialog focus。
- RED：Popup／record panel 重疊時關閉 popup，panel 雖仍 active，但 header/main/FAB inert 被過早清除且焦點逸出。
- GREEN：Popup stale focus 為 0；關閉 popup 後 panel 保持 active、非 inert，背景仍 inert，焦點位於 panel；最後關閉 panel 才解除 inert 並回焦 FAB。

### Record panel immediate-Escape RED → GREEN

- RED：`QA_SCENARIO=dialogs` 為 16／17；立即 Escape 後語意狀態雖已關閉，但 computed style 為 `visibility:visible`、`opacity:1`、identity transform。
- RED：`node verify-ui-contract.mjs` 以 `record panel opening tween must be tracked` 預期失敗。
- GREEN：`QA_SCENARIO=dialogs` 為 17／17；等待所有 panel GSAP tweens 結束後為：
  - `active=false`
  - `aria-hidden=true`
  - `visibility=hidden`
  - `opacity=0`
  - `transform=matrix(1, 0, 0, 1, 560, 0)`
  - header/main/FAB inert 全為 false
  - popup inactive，焦點為 `fabBtn`
- GREEN：`node verify-ui-contract.mjs` 輸出 `UI contract verified.`。

## 完整瀏覽器驗證

- 完整 suite：50／50；再完整執行 9 次，repeat 2–10 每次均為 50 passed、0 failed，合計連續 10 次通過。
- 頁面 54 個控制項依 DOM order 完成完整 Tab 與 Shift+Tab 循環。
- Record panel 14 個控制項完成完整 Tab 與 Shift+Tab 循環且不逸出 dialog。
- 日期／結算、平日／週末／國定假日、2／4／8／清除、薪資計算、記錄新增／編輯／刪除／篩選／匯入／持久化均通過。
- 1440px、768px、375px 均無水平溢位；桌面、平板與手機 screenshots 已人工檢視，未見裁切或重疊。
- Reduced motion 下 dialog focus 正常，主要 animation/transition 均為 0s。
- Console errors 0、page errors 0、HTTP >=400 0、failed requests 0。

## PWA / 離線

- 測試先建立 `salary-neo-brutal-v15` 舊 cache，再觸發 service-worker install／activate／reload。
- Activation 後 cache names 僅剩 `salary-neo-brutal-v16`。
- `/`、`/index.html`、`/styles.css`、`/uiverse.css`、`/vendor/gsap.min.js`、`/motion.js`、`/manifest.json`、`/assets/icons.svg` 全部存在 cache。
- Offline reload 與必要資源 fetch 全部回傳 200。

## Node / Git 驗證

- `node verify-payslip.mjs`：通過；扣款 4,621、加項 7,780、四捨五入實領 46,627。
- `node verify-ui-contract.mjs`：通過；輸出 `UI contract verified.`。
- `git diff --check`：通過。
- `git diff --cached --check`：通過。
- `git show --check --format=fuller --stat HEAD`：通過。
- QA server parent／child PID 均已停止，port 8000 無 listener。

## 證據

- 自動化腳本：`.superpowers/sdd/task-7-browser-qa.py`
- 最終 JSON：`.superpowers/sdd/task-7-browser-results.json`
- Screenshots：
  - `.superpowers/sdd/task-7-desktop-1440.png`
  - `.superpowers/sdd/task-7-desktop-1440-panel.png`
  - `.superpowers/sdd/task-7-tablet-768.png`
  - `.superpowers/sdd/task-7-mobile-375.png`
  - `.superpowers/sdd/task-7-mobile-375-panel.png`
  - `.superpowers/sdd/task-7-offline-1440.png`

## 最終提交內容 SHA-256

- `MANUAL-REGRESSION.md`: `b70f46d74fbd332fac200ab760291dee24caf27cfb618f373159f12861635b7c`
- `index.html`: `6272de06bccb3fcd841ec185914b1bb06d0d77705e208531b41fdb1453cdc8d0`
- `styles.css`: `fb5d4b181b58f11dfac6966732c8871b1b55e23669c384870778f7bd13b549b7`
- `uiverse.css`: `2c1eda5ca3905dfe76e3bf051db5171e3baacabde35566a17005f03c075193f0`
- `verify-ui-contract.mjs`: `c970b900229e970cff7766fa54571d78ca996547982d9094bfc87d5ffe4ebf44`

雜湊針對最終 `HEAD` 的 Git blob 計算，不受工作目錄換行格式影響。

## 備註 / 風險

- 瀏覽器證據使用本機 headless Chrome；離線切換使用 Playwright browser-context offline 模式。
- `.superpowers/` 證據與既有 `*.bak.*` 備份未納入產品提交。
