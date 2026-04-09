# AI Vibe C step07-tunnel-ngrok - 後端利用 ngrok

## 架構概述

本項目已分離成前後端獨立服務：
- **前端**：React + Vite（通訊埠 3000 或 3001）
- **後端**：FastAPI（通訊埠 8000）
- **功能**：AI 繪圖、按鈕統計、密碼保護
- **容器化**：Docker + Docker Compose 支援

## 🚀 快速啟動（推薦 Docker）

### 使用啟動腳本（最簡便）

```bash
cd ai-vibe-c/start

# Docker 啟動（首次需配置 .env）
./run docker

# 本地啟動
./run local

# 查看幫助
./run help
```

### Docker 啟動步驟

**1. 配置環境變數**
```bash
cd ai-vibe-c/infra
cp .env.example .env
nano .env  # 編輯 API Key 等設定
```

**2. 啟動容器**
```bash
cd ai-vibe-c/start
./run docker --build  # 首次需要 build
```

**3. 查看狀態**
```bash
cd ai-vibe-c/start
./run docker --logs   # 實時日誌
```

**4. 停止容器**
```bash
cd ai-vibe-c/start
./run docker --down   # 停止並刪除
```

## 環境準備（本地開發）

### 前端環境
- **Node.js 18+**：前往 [Node.js 官方網站](https://nodejs.org/) 下載 LTS 版本
- **驗證**：
  ```bash
  node --version
  npm --version
  ```

### 後端環境
- **Python 3.8+**：透過 conda 環境管理
- **驗證 conda**：
  ```bash
  conda --version
  conda activate toby  # 啟用 toby 環境
  ```

## 本地啟動

### 方式 1：使用啟動腳本（推薦）

```bash
cd ai-vibe-c/start

# 啟動前後端
./run local

# 僅啟動後端
./run local --backend-only

# 僅啟動前端，跳過相依套件安裝
./run local --frontend-only --no-install

# 僅啟動 Ngrok 隧道
./run local --ngrok-only

# 啟動前後端 + Ngrok 隧道（用於分享應用）
./run local --ngrok

# 建置前端正式包
./run local --build-frontend

# 建置並佈署到 Firebase Hosting
./run local --deploy-firebase
```

### 方式 2：手動啟動

**後端：**
```bash
cd ai-vibe-c/backend
conda activate toby
pip install -r requirements.txt
python main.py
```

**前端（新終端）：**
```bash
cd ai-vibe-c/frontend
npm install  # 首次運行
npm run dev
```

## 功能說明

### 前端特性
- **繪圖工具**：筆刷、顏色選擇、撤銷/重做
- **AI 繪圖**：輸入提示詞生成或修改圖像
- **按鈕追蹤**：所有操作會傳送至後端統計
- **密碼鎖定**：`***` 按鈕用密碼保護管理功能
  - 密碼可在 `.env.local` 設定（預設：`admin123`）
- **清空畫布**：一鍵清除當前繪圖

### 後端服務
- **API 端點**：
  - `POST /api/button-event` - 記錄按鈕點擊事件
  - `GET /api/button-stats` - 獲取按鈕統計數據
  - `GET /api/button-events` - 獲取所有事件列表
  - `POST /api/ai-draw` - 生成或修改圖像
  - `POST /api/reset-stats` - 重置統計數據

- **AI 模型配置**：
  - API Key 在 `backend/.env` 或 `infra/.env` 配置
  - 型號在環境變數配置（預設：`gemini-2.0-flash`）

## 環境變量配置

### 前端 (`frontend/.env.local`)
```env
VITE_API_URL=http://localhost:8000
VITE_ADMIN_PASSWORD=admin123
# Firebase web app config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 後端 (`backend/.env` 或 `infra/.env`)
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash
ADMIN_PASSWORD=admin123
```

## Firebase Hosting 佈署
本專案使用 Vite 前端，建置結果會輸出到 `frontend/dist`，Firebase Hosting 設定在專案根目錄的 `firebase.json`。根目錄也應該包含 `.firebaserc`，供 CLI 指定要使用的 Firebase 專案。

- `firebase.json` 中的 `hosting.site` 是 Hosting 站點 ID（本例：`ai-diy-123`）。
- `.firebaserc` 中的 `default` 是 Firebase project ID（本例：`supercuttytoby`）。

`firebase.json` 範例內容：
```json
{
  "hosting": [
    {
      "site": "ai-diy-123",
      "public": "frontend/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    }
  ]
}
```

### Firebase 新手注意事項
1. 先確認你登入的 Firebase 帳號是有 `ai-diy-123` 站點權限的帳號。
2. `firebase login` 只是登入 CLI，並不會自動選專案，還要執行 `firebase use --add` 選擇要操作的專案。
3. 你可以使用 `firebase projects:list` 檢查目前帳號可用的專案。
4. 佈署時請在專案根目錄執行 `firebase deploy --only hosting:ai-diy-123`。
5. `firebase deploy` 必須要先 build：`npm run build`，如果沒有 `frontend/dist` 會佈署失敗。

## Step 07：Ngrok 隧道
如果您想快速把本地後端公開到外網，後端目前支援透過 `pyngrok` 建立 ngrok 隧道。

### 要求
1. 在 `backend/.env` 中加入：
   ```env
   NGROK_AUTHTOKEN=您的_ngrok_authtoken
   NGROK_DOMAIN=您的_ngrok_reserved_domain  # 可選
   ```
2. 確保 `conda activate toby` 環境已安裝後端相依套件：
   ```bash
   conda activate toby
   pip install -r backend/requirements.txt
   ```

本腳本會自動下載並安裝 ngrok v3 二進位檔，如果本機尚未安裝。

### 使用方式

#### 方法 1：使用啟動腳本（推薦）
```bash
cd ai-vibe-c/start

# 僅啟動 Ngrok 隧道
./run local --ngrok-only

# 啟動前後端 + Ngrok 隧道（用於分享應用）
./run local --ngrok
```

#### 方法 2：手動啟動
1. 啟動後端服務：
   ```bash
   cd backend
   conda activate toby
   python main.py
   ```
2. 在另一個終端啟動 ngrok 隧道：
   ```bash
   cd backend
   conda activate toby
   python ngrok_tunnel.py
   ```

如果 `NGROK_DOMAIN` 已設定且為保留域名，`pyngrok` 會嘗試使用該域名。若無設定，則會自動建立一個 ngrok public URL。

如果您看到 ngrok 錯誤，常見原因包括：
- 現有 ngrok session 已佔用帳號配額（`ERR_NGROK_108`），請先在 ngrok 儀表板停止現有 agent，或升級付費方案。
- ngrok config 版本不正確，腳本會建立新的 v3 config 檔案。

### 注意
- `firebase login` 和 `ngrok` 是不同服務，`firebase login` 只對 Firebase CLI 有效。
- 您的 ngrok token 不應該提交到 git，因為它是敏感憑證。
- `.gitignore` 已忽略 `.env`、`.env.local` 與 `.firebase/`，這樣可避免把本地機密資料放到版本控制中。

### 建議的佈署流程
```bash
cd ai-vibe-c
cd frontend
npm install
npm run build
cd ..
firebase deploy --only hosting:ai-diy-123
```

### 也可以用啟動腳本
```bash
cd ai-vibe-c
./start/run local --deploy-firebase
```

### 關於保護與 .gitignore
- `firebase login` 只是讓 CLI 訪問 Firebase，並不保護您專案中的敏感本地檔案。
- `.gitignore` 應該忽略本地環境變數和 Firebase CLI 產生的本機檔案，例如：
  - `.env` / `.env.local`
  - `.firebase/`
  - `firebase-debug.log`
- 您可以提交 `firebase.json` 與 `.firebaserc`，因為它們僅包含佈署設定，不包含密鑰。
- 本專案 `.gitignore` 也已經忽略 `dist/`、`node_modules/`、`package-lock.json` 等常見暫存檔。

如果您希望新增 Firebase 設定或佈署站點，只要先登入對的帳號、再使用 `firebase use --add`，就能正確佈署。

## 項目結構
```
ai-vibe-c/
├── frontend/                # React 前端應用
│   ├── src/
│   ├── .env.local          # 前端環境變量
│   └── package.json
├── backend/                 # FastAPI 後端服務
│   ├── main.py             # 主應用進入點
│   ├── config.py           # 配置管理
│   ├── models.py           # 資料模型
│   ├── stats.py            # 統計管理
│   ├── ai_service.py       # AI 服務
│   ├── Dockerfile          # Docker 建置配置
│   ├── .env                # 後端環境變量
│   └── requirements.txt
├── infra/                   # 基礎設施配置
│   ├── docker-compose.yml  # Docker Compose 配置
│   ├── .env.example        # 環境變量範例
│   └── .env                # 環境變量（本地）
└── start/                   # 啟動指南和指令稿
    ├── run                 # 多功能啟動指令稿
    ├── start_backend.sh    # 後端啟動指令
    ├── start_frontend.sh   # 前端啟動指令
    └── readme.md           # 本文件
```

## Docker 指令稿使用

### 啟動選項

```bash
# 本地模式
./run local [options]

選項:
  --backend-only    僅啟動後端
  --frontend-only   僅啟動前端
  --no-install      跳過相依套件安裝

範例:
  ./run local --backend-only        # 僅後端
  ./run local --frontend-only       # 僅前端
```

### Docker 模式

```bash
./run docker [options]

選項:
  --build           重建映像檔
  --detach          背景執行
  --logs            查看即時日誌
  --stop            停止容器
  --down            停止並刪除容器

範例:
  ./run docker              # 啟動容器
  ./run docker --build      # 重建並啟動
  ./run docker --detach     # 背景啟動
  ./run docker --logs       # 查看日誌
  ./run docker --down       # 完全停止
```

## 訪問應用

- **前端**：http://localhost:3000
- **後端**：http://localhost:8000
- **API 文件**：http://localhost:8000/docs
- **Swagger UI**：http://localhost:8000/redoc

## 開發指南

### 添加新的按鈕追蹤
在前端 `App.tsx` 中的按鈕處理函式中添加：
```typescript
trackButtonEvent('button_name');
```

### 查看統計數據
- 通過 API：`curl http://localhost:8000/api/button-stats`
- 或使用指令稿查看日誌

### 修改密碼
編輯環境設定檔：
```env
VITE_ADMIN_PASSWORD=your_new_password
ADMIN_PASSWORD=your_new_password
```

## 故障排除

### Docker 相關
- **Docker 未安裝**：安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **權限錯誤**：執行 `sudo usermod -aG docker $USER`
- **通訊埠被佔用**：修改 `infra/docker-compose.yml` 中的通訊埠映射

### 本地開發

#### 後端無法啟動
- 檢查 conda 環境：`conda list`
- 重新安裝相依套件：`pip install -r requirements.txt`
- 檢查 API Key 是否設定在 `.env`

#### 前端無法連接後端
- 確認後端已啟動並在 `http://localhost:8000`
- 檢查 CORS 是否啟用（應已在後端配置）
- 檢查 `frontend/.env.local` 中的 `VITE_API_URL`

#### AI 生圖失敗
- 檢查 Gemini API Key 是否有效
- 檢查配額限制
- 查看後端日誌中的詳細錯誤

## 測試指令

```bash
# 健康檢查
curl http://localhost:8000/health

# 記錄按鈕事件
curl -X POST http://localhost:8000/api/button-event \
  -H "Content-Type: application/json" \
  -d '{"button_name":"test_click","timestamp":1234567890}'

# 查看統計
curl http://localhost:8000/api/button-stats

# 查看所有事件
curl http://localhost:8000/api/button-events
```

## 相關資源
- [FastAPI 文件](https://fastapi.tiangolo.com/)
- [React 文件](https://react.dev/)
- [Gemini API](https://ai.google.dev/docs)
- [Docker 文件](https://docs.docker.com/)
