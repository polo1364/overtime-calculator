# Command Deck UI 手動回歸

## 核心流程
- [x] 結算區間預設值正確，跨月與 7 號遇週末規則不變
- [x] 生成月曆後日期、平日／週末／節日 dayType 正確
- [x] 每日 2／4／8 小時快捷與清除按鈕正確更新總時數
- [x] 記錄本新增、編輯、刪除、清除全部功能正常
- [x] 自訂／結算區間篩選與一鍵帶入月曆正常
- [x] 輸入本薪、津貼、請假、保險參數後薪資計算結果正確
- [x] 重新整理後敏感欄位、記錄本與篩選區間 persistence 不變

## 響應式與可及性
- [x] 375px：月曆以同一組 table/input DOM 依週直向排列，無重複 id
- [x] 768px：月曆直向排列，表單與摘要無水平溢位
- [x] 1440px：月曆保持桌面 7 欄，面板最大寬度與留白正常
- [x] `prefers-reduced-motion: reduce`：所有內容立即抵達最終狀態
- [x] Tab／Shift+Tab 可操作所有表單、快捷鍵、FAB、面板與彈窗
- [x] 所有 focus-visible 樣式清楚，互動目標至少 44px
- [x] 公告 modal 開啟後焦點進入，Tab 不逸出；Escape／按鈕可關閉並回復焦點

## PWA
- [x] 首次連線載入後重整可正常使用
- [x] DevTools Offline 下 index、styles.css、motion.js、GSAP 與圖示可載入
- [x] Service Worker 更新後舊 cache 被清除

## 2026-07-22 QA 記錄

- Google Chrome（Playwright 1.54.0 headless）測試 1440×1000、768×1000、375×812。
- 瀏覽器 QA 49／49 連續 10 次通過；console、page error、HTTP error 與線上 request failure 均為 0。
- 頁面 54 個控制項與記錄面板 14 個控制項完成 Tab／Shift+Tab 全循環；黃、綠、粉、青、白、紅 surface 均顯示 3px 高對比 focus outline。
- Popup 開啟中立即 Escape 不會回焦隱藏 dialog；popup／記錄面板重疊關閉時 inert 與焦點依剩餘 active overlay 保持正確。
- 先建立 `salary-neo-brutal-v15` 後觸發 activation，確認只保留 v16；離線必要 shell asset 均回應 200。
