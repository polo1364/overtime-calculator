# 大瑞科技薪資管理系統

專業的薪資計算與管理系統，支援加班費計算、請假管理等功能。

## 功能特色

- 📅 **自動日期區間判別** - 每月7號自動判別薪資結算區間
- ⏰ **加班時數登記** - 支援平日、週末、節日不同費率計算
- 💰 **完整薪資計算** - 包含本薪、獎金、加班費、誤餐費等
- 🏥 **請假管理** - 支援多種請假類型（事假、病假、婚假、喪假、產假、陪產假、家庭照顧假）
- 📊 **詳細明細** - 完整的應發/應扣項目明細
- 📱 **PWA 支援** - 可安裝為應用程式，支援離線使用
- 🎨 **專業介面** - 現代化、專業的企業級介面設計

## 部署到 GitHub Pages

### 需要上傳的文件

以下文件需要上傳到 GitHub：

#### 核心文件（必須）
- ✅ `index.html` - 主應用程式文件
- ✅ `manifest.json` - PWA 配置文件
- ✅ `service-worker.js` - Service Worker 文件
- ✅ `icon-192.png` - PWA 圖標 (192x192)
- ✅ `icon-512.png` - PWA 圖標 (512x512)

#### 配置文件（建議）
- ✅ `README.md` - 專案說明文件
- ✅ `.gitignore` - Git 忽略文件配置

#### 可選文件
- `popup.json` - 彈窗配置（如果使用）
- `PWA_SETUP.md` - PWA 設置說明
- `generate-icons.html` - 圖標生成工具

### 部署步驟

1. **初始化 Git 倉庫**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **連接到 GitHub**
   ```bash
   git remote add origin https://github.com/你的用戶名/你的倉庫名.git
   git branch -M main
   git push -u origin main
   ```

3. **啟用 GitHub Pages**
   - 進入 GitHub 倉庫設定
   - 找到 "Pages" 選項
   - Source 選擇 "Deploy from a branch"
   - Branch 選擇 "main" 或 "master"
   - Folder 選擇 "/ (root)"
   - 點擊 Save

4. **訪問您的網站**
   - 網址格式：`https://你的用戶名.github.io/你的倉庫名/`
   - 例如：`https://username.github.io/overtime-calculator/`

### 注意事項

⚠️ **重要提醒**

1. **Service Worker 路徑**
   - 如果您的倉庫名稱不是根目錄（例如：`username.github.io`），需要修改 `service-worker.js` 中的路徑
   - 在 `index.html` 中，Service Worker 註冊路徑也需要相應調整

2. **HTTPS 要求**
   - PWA 功能需要 HTTPS（GitHub Pages 自動提供）
   - 本地測試可以使用 `localhost`

3. **圖標文件**
   - 確保 `icon-192.png` 和 `icon-512.png` 存在
   - 如果沒有，可以使用 `generate-icons.html` 生成

### 文件結構

```
overtime-calculator/
├── index.html              # 主應用程式
├── manifest.json           # PWA 配置
├── service-worker.js       # Service Worker
├── icon-192.png           # 圖標 192x192
├── icon-512.png           # 圖標 512x512
├── README.md              # 說明文件
├── .gitignore             # Git 忽略配置
├── PWA_SETUP.md           # PWA 設置說明
└── generate-icons.html    # 圖標生成工具
```

## 本地開發

### 運行本地服務器

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server -p 8000
```

然後訪問 `http://localhost:8000`

## 技術說明

- **純前端** - 無需後端服務器
- **PWA** - 支援離線使用和安裝
- **LocalStorage** - 數據本地存儲
- **響應式設計** - 支援各種設備尺寸

## 授權

此專案為內部使用系統。
