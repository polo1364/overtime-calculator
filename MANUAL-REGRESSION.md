# Command Deck UI 手動回歸

## 核心流程
- [ ] 結算區間預設值正確，跨月與 7 號遇週末規則不變
- [ ] 生成月曆後日期、平日／週末／節日 dayType 正確
- [ ] 每日 2／4／8 小時快捷與清除按鈕正確更新總時數
- [ ] 記錄本新增、編輯、刪除、清除全部功能正常
- [ ] 自訂／結算區間篩選與一鍵帶入月曆正常
- [ ] 輸入本薪、津貼、請假、保險參數後薪資計算結果正確
- [ ] 重新整理後敏感欄位、記錄本與篩選區間 persistence 不變

## 響應式與可及性
- [ ] 375px：月曆以同一組 table/input DOM 依週直向排列，無重複 id
- [ ] 768px：月曆直向排列，表單與摘要無水平溢位
- [ ] 1440px：月曆保持桌面 7 欄，面板最大寬度與留白正常
- [ ] `prefers-reduced-motion: reduce`：所有內容立即抵達最終狀態
- [ ] Tab／Shift+Tab 可操作所有表單、快捷鍵、FAB、面板與彈窗
- [ ] 所有 focus-visible 樣式清楚，互動目標至少 44px
- [ ] 公告 modal 開啟後焦點進入，Tab 不逸出；Escape／按鈕可關閉並回復焦點

## PWA
- [ ] 首次連線載入後重整可正常使用
- [ ] DevTools Offline 下 index、styles.css、motion.js、GSAP 與圖示可載入
- [ ] Service Worker 更新後舊 cache 被清除
