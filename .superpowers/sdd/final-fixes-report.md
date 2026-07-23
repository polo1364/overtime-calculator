# Final Fixes Report

## 結果

- 狀態：`DONE`
- 產品／contract 提交：`d01f7ef2a8a1cd3888870cd3191dd65412215fb0`
- 目標 HEAD：從 `e06bf048f71afa38d3780636305b2a4aa073f5dc` 完成最後一波 accessibility、validation、contract 與 clean-checkout 修正。
- 薪資公式、business data、既有 DOM ID、LocalStorage key、敏感欄位 ID、`window.UiMotion` 九個公開 API 均保留。

## 修改檔案

- `index.html`
  - workflow step 增加可見 icon 與 `進行中`／`已完成`／`待處理`，並同步 `aria-current="step"`。
  - 日曆時數 `> 8` 顯示文字 warning，設定 `aria-invalid`／`aria-describedby`；恢復有效值時移除。
  - 開始／結束日期與本薪改為 linked inline field errors，不再使用主流程 `alert`。
  - 日期分辨空白、格式、起訖顛倒；本薪分辨缺值、格式、非正值。
  - record feedback 改為 polite live status，保留 icon、label、message 三層結構。
  - readonly marker 由 `唯讀` 改為 exact `固定金額`。
  - record secondary buttons 共用 `record-secondary-control`。
- `styles.css`
  - 增加 workflow state badge、field error、record feedback 結構與 overtime warning 的可見樣式。
  - invalid field 使用非顏色以外仍可辨認的邊框／文字訊號。
  - readonly input 預留 `固定金額` marker 空間。
- `uiverse.css`
  - `record-secondary-control` 固定最小 44x44px。
  - `:active` 使用 3px 位移與移除 shadow 的 pressed state。
- `verify-ui-contract.mjs`
  - 移除對 untracked `index.html.bak.20260712-2340` 的讀取。
  - 驗證 tracked baseline、storage key、sensitive field IDs、business-data canonical SHA-256。
  - 覆蓋 workflow state、date/baseSalary inline errors、overtime warning lifecycle、record live status、warning feedback、readonly exact label、所有 record secondary button family。
- `fixtures/ui-contract-baseline.json`
  - 保存相容性基線：既有 DOM IDs、`overtimeRecords`／`recordBookFilterCustom`／`sensitiveSalaryData`、敏感欄位 IDs、四份 business data hashes。
- `.superpowers/sdd/task-7-report.md`
  - 頂部新增本波狀態、RED/GREEN、clean-checkout 與 repeat browser evidence。
- `.superpowers/sdd/final-fixes-browser-runs.json`
  - 保存兩次 repeat run 的 UTC timestamps、Chrome／Playwright 版本、viewports 與 pass/fail。
- `.superpowers/sdd/final-fixes-report.md`
  - 本報告。

## 驗證

### TDD

1. Contract 加入、fixture 尚未建立：
   - 命令：`node verify-ui-contract.mjs`
   - 結果：exit 1。
   - 精確原因：`ENOENT ... fixtures/ui-contract-baseline.json`。
2. Fixture 建立、產品語意尚未修正：
   - 命令：`node verify-ui-contract.mjs`
   - 結果：exit 1。
   - 精確首錯：`UI contract failed: every workflow step needs a visible state signal`。
3. 最小產品修正後：
   - 命令：`node verify-ui-contract.mjs`
   - 結果：exit 0，`UI contract verified.`。

### Node／公式

- Inline script compile：
  - 以 `new Function(lastInlineScript)` 驗證。
  - 輸出：`Inline app script syntax verified.`。
- `node verify-payslip.mjs`
  - exit 0。
  - `totalDed: 4621`。
  - 加項 fixture：`7780`。
  - `Math.round(net): 46627`。
- `node verify-ui-contract.mjs`
  - exit 0。
  - 輸出：`UI contract verified.`。
- `git diff --check`
  - exit 0。
- `git diff --cached --check`
  - exit 0。

### Clean temp checkout

- Temp checkout：`C:\Users\User\AppData\Local\Temp\overtime-clean-30147792470f4c638eae37c96a47e7d1`
- Detached HEAD：`d01f7ef`
- 命令：
  - `node verify-payslip.mjs`
  - `node verify-ui-contract.mjs`
- 結果：兩者 exit 0；temp worktree 已移除。
- 證明 verifier 只依賴 committed source 與 tracked baseline fixture。

### Browser QA

- 環境：Google Chrome `150.0.7871.129`、Playwright `1.61.1`、headless。
- Viewports：1440x1000、768x1000、375x812。
- `run-1`：2026-07-23T10:40:28.453Z～10:40:41.353Z，26／26 pass。
- `run-2`：2026-07-23T10:40:45.035Z～10:40:57.497Z，26／26 pass。
- 驗證內容：
  - 四個 workflow state signal 可見，且 active step 只有一個 `aria-current="step"`。
  - 日期空白、格式、起訖顛倒均顯示 linked inline errors；有效日期會清除 invalid state。
  - 本薪缺值、格式、非正值均顯示 linked inline errors；有效本薪可正常計算。
  - `> 8h` warning 可見並設 ARIA；回到 8h 後 warning、`aria-invalid`、`aria-describedby` 全部移除。
  - record warning feedback 為 structured polite live status。
  - record close／quick／clear／edit／delete／save／cancel 均有 44px target 與 computed pressed transform。
  - 1440／768／375 無 horizontal overflow；768／375 record panel 使用完整 viewport width。
  - `salary-neo-brutal-v16` cache 含所有 shell assets；offline reload 與七個 local fetch 均為 200。
  - console errors 0、uncaught page errors 0、HTTP >=400 0、failed requests 0。
- 視覺檢查：
  - 1440：workflow、日期表單、7 日 calendar、salary forms 與 payslip 無裁切。
  - 768：2-column workflow／summary、vertical calendar 與 full-width record panel 無水平 overflow。
  - 375：1-column workflow／summary、warning、readonly markers、calendar controls 與 full-width record panel 可讀。
- Repeat log：`.superpowers/sdd/final-fixes-browser-runs.json`。

## 檔案雜湊

- `index.html`: `4BCB99AB7F935CEF58D59B0BC3E6DBD9B8A7557374A192189922253203BBF58A`
- `styles.css`: `E81413FBDF157C011768B45DC71212C510B4316D2BEBC9B7086E8ACD0CE0073A`
- `uiverse.css`: `18AAF5DE95D0BCC89E2012BD0F5367CC065B95671CC11CDA12D9C30598A33439`
- `verify-ui-contract.mjs`: `755F87D10C55FE1E26276D7D21AABBB093E40BB955071EF80D7935897D99E108`
- `fixtures/ui-contract-baseline.json`: `536B47DDABB75DAB2448A60D6BCF83E745C2E3F6F01F7CEA70A32C5C877AEB47`

## 備註 / 風險

- In-app browser runtime 當次沒有可用 browser binding；依 browser troubleshooting 確認 `agent.browsers.list()` 為空後，改用本機 npm cache 內既有 Playwright 1.61.1 啟動 system Chrome 150，未安裝任何依賴。
- QA 為 headless Chrome；三個 viewport screenshots 已人工檢查。未發現需再修改產品的視覺問題。
- Repo 原有 `*.bak.*` 與其他 `.superpowers/` artifacts 維持 untracked，未納入本次提交、未刪除、未覆寫。
- `motion.js`、`service-worker.js`、薪資公式與 business arrays 未修改。

## Reviewer follow-up fix wave

### 結果

- 狀態：`DONE`
- 產品修正 commit：`3b3b2af`
- 僅處理 reviewer 指定的兩項 Important finding。

### DOM ID baseline

- `fixtures/ui-contract-baseline.json` 的 `requiredDomIds` 已補齊 `legacyStyles`、`recordPanelTitle`、`popupTitle`，總數為 93。
- `verify-ui-contract.mjs` 會固定檢查 baseline 必須為 93 個 ID，且上述三個 ID 必須在 baseline 中。
- TDD RED：補 verifier、尚未補 fixture 時，`node verify-ui-contract.mjs` exit 1：
  - `UI contract failed: baseline must preserve all 93 pre-redesign DOM ids`
- Clean-checkout negative：
  - 移除 `recordPanelTitle` 後 exit 1：`UI contract failed: required DOM ids are missing: recordPanelTitle`
  - 移除 `popupTitle` 後 exit 1：`UI contract failed: required DOM ids are missing: popupTitle`
- 兩個 detached temp worktree 均已安全移除。

### Persistent live status

- `.record-feedback` 閒置時改為 1px clipped visually-hidden treatment，不使用 `display:none` 或 `visibility:hidden`。
- `.record-feedback.show` 恢復 `position: static`、`display: flex` 與可見卡片版面。
- TDD RED：fixture 補齊但 CSS 尚未修正時，`node verify-ui-contract.mjs` exit 1：
  - `UI contract failed: idle record status must remain in the accessibility tree`
- Chrome 150 CDP accessibility tree，先開啟記錄抽屜、尚未觸發訊息：
  - `recordFeedback` present=`true`、ignored=`false`、role=`status`
  - computed display=`block`、visibility=`visible`、position=`absolute`、clip=`rect(0px, 0px, 0px, 0px)`、size=`1x1`
- 觸發缺少日期警告後：
  - 同一節點 present=`true`、ignored=`false`、role=`status`
  - DOM 與 AX tree 文字均更新為 `注意`、`請先選擇日期`
  - computed display=`flex`、visibility=`visible`、position=`static`
  - console errors 0、page errors 0、failed requests 0、HTTP >=400 0

### 驗證

- `node verify-payslip.mjs`：exit 0，`totalDed: 4621`、fixture `7780`、`Math.round(net): 46627`
- `node verify-ui-contract.mjs`：exit 0，`UI contract verified.`
- `git diff --check`：exit 0
- Browser AX follow-up：2026-07-23T11:03:18.900Z，8／8 pass

### 備註 / 風險

- 內建 browser runtime 本次仍無可用 binding；依 troubleshooting 確認 `agent.browsers.list()` 為空後，以既有 Playwright 1.61.1 啟動本機 Chrome 150，透過 CDP 讀取實際 accessibility tree。
- `recordFeedback` 位於記錄抽屜內；抽屜關閉時，其父 dialog 按既有設計為 `visibility:hidden`。上述「訊息前節點存在」驗證是在使用者已開啟抽屜、尚未觸發訊息的真實互動狀態。
