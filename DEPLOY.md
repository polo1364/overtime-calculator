# GitHub Pages 部署指南

## 📦 需要上傳的文件清單

### ✅ 必須上傳的文件

```
✅ index.html              # 主應用程式（必須）
✅ manifest.json           # PWA 配置（必須）
✅ service-worker.js        # Service Worker（必須）
✅ icon-192.png            # PWA 圖標 192x192（必須）
✅ icon-512.png            # PWA 圖標 512x512（必須）
```

### 📝 建議上傳的文件

```
✅ README.md               # 專案說明
✅ .gitignore             # Git 忽略配置
```

### 🔧 可選文件

```
📄 popup.json             # 彈窗配置（如果使用）
📄 PWA_SETUP.md           # PWA 設置說明
📄 generate-icons.html    # 圖標生成工具
```

### ❌ 不需要上傳的文件

```
❌ 63EDD52C-F584-4A5A-823A-6F210850519E.png  # 臨時圖片文件
❌ .DS_Store              # Mac 系統文件
❌ Thumbs.db              # Windows 系統文件
```

## 🚀 快速部署步驟

### 方法一：使用 GitHub 網頁界面

1. **創建新倉庫**
   - 登入 GitHub
   - 點擊右上角 "+" → "New repository"
   - 輸入倉庫名稱（例如：`salary-calculator`）
   - 選擇 Public（GitHub Pages 需要）
   - 點擊 "Create repository"

2. **上傳文件**
   - 點擊 "uploading an existing file"
   - 拖拽或選擇以下文件：
     - `index.html`
     - `manifest.json`
     - `service-worker.js`
     - `icon-192.png`
     - `icon-512.png`
     - `README.md`
     - `.gitignore`
   - 點擊 "Commit changes"

3. **啟用 GitHub Pages**
   - 進入倉庫 Settings
   - 左側選單找到 "Pages"
   - Source 選擇 "Deploy from a branch"
   - Branch 選擇 "main" 或 "master"
   - Folder 選擇 "/ (root)"
   - 點擊 Save

4. **訪問網站**
   - 等待幾分鐘後訪問：`https://你的用戶名.github.io/倉庫名/`

### 方法二：使用 Git 命令行

```bash
# 1. 初始化 Git
git init

# 2. 添加文件
git add index.html manifest.json service-worker.js icon-192.png icon-512.png README.md .gitignore

# 3. 提交
git commit -m "Initial commit: Salary Calculator PWA"

# 4. 連接到 GitHub（替換為您的倉庫地址）
git remote add origin https://github.com/你的用戶名/你的倉庫名.git

# 5. 推送到 GitHub
git branch -M main
git push -u origin main
```

然後按照方法一的步驟 3-4 啟用 GitHub Pages。

## ⚙️ 路徑配置（重要）

### 如果倉庫名稱不是根目錄

如果您的 GitHub Pages 網址是：
```
https://username.github.io/repository-name/
```

需要修改以下文件：

#### 1. 修改 `index.html` 中的 Service Worker 註冊

找到這一行：
```javascript
navigator.serviceWorker.register('/service-worker.js')
```

改為：
```javascript
navigator.serviceWorker.register('/repository-name/service-worker.js')
```

#### 2. 修改 `service-worker.js` 中的緩存路徑

找到 `urlsToCache` 數組，將所有路徑加上倉庫名前綴：
```javascript
const urlsToCache = [
  '/repository-name/',
  '/repository-name/index.html',
  '/repository-name/manifest.json',
  '/repository-name/icon-192.png',
  '/repository-name/icon-512.png'
];
```

#### 3. 修改 `manifest.json` 中的 start_url

```json
{
  "start_url": "/repository-name/",
  ...
}
```

### 如果使用自定義域名

如果使用 `username.github.io` 作為倉庫名，則不需要修改路徑，直接使用 `/` 即可。

## 🔍 驗證部署

部署完成後，檢查以下項目：

1. ✅ 網站可以正常訪問
2. ✅ 所有功能正常運作
3. ✅ Service Worker 已註冊（F12 → Application → Service Workers）
4. ✅ PWA 可以安裝（地址欄會顯示安裝圖標）
5. ✅ 圖標正常顯示

## 🐛 常見問題

### Service Worker 未註冊
- 檢查文件路徑是否正確
- 確保使用 HTTPS（GitHub Pages 自動提供）
- 檢查瀏覽器控制台錯誤信息

### 圖標未顯示
- 確保 `icon-192.png` 和 `icon-512.png` 已上傳
- 檢查 `manifest.json` 中的圖標路徑
- 清除瀏覽器緩存

### 無法安裝 PWA
- 確保 `manifest.json` 格式正確
- 確保至少有一個 192x192 的圖標
- 檢查瀏覽器是否支持 PWA

## 📱 測試清單

- [ ] 桌面瀏覽器測試（Chrome, Edge, Firefox）
- [ ] 手機瀏覽器測試（iOS Safari, Chrome Mobile）
- [ ] PWA 安裝測試
- [ ] 離線功能測試
- [ ] 響應式設計測試

