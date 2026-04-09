
# AI Vibe C step05-docker-container - 前後端分離開始指南

## 架構概述

本項目已分離成前後端獨立服務：
- **前端**：React + Vite（端口 3000 或 3001）
- **後端**：FastAPI（端口 8000）
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
./run docker --logs   # 實時日誌
```

**4. 停止容器**
```bash
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

# 仅启动后端
./run local --backend-only

# 仅启动前端，跳过依赖安装
./run local --frontend-only --no-install
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
```

### 後端 (`backend/.env` 或 `infra/.env`)
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash
ADMIN_PASSWORD=admin123
```

## 項目結構
```
ai-vibe-c/
├── frontend/                # React 前端應用
│   ├── src/
│   ├── .env.local          # 前端環境變量
│   └── package.json
├── backend/                 # FastAPI 後端服務
│   ├── main.py             # 主應用入點
│   ├── config.py           # 配置管理
│   ├── models.py           # 資料模型
│   ├── stats.py            # 統計管理
│   ├── ai_service.py       # AI 服務
│   ├── Dockerfile          # Docker 構建配置
│   ├── .env                # 後端環境變量
│   └── requirements.txt
├── infra/                   # 基礎設施配置
│   ├── docker-compose.yml  # Docker Compose 配置
│   ├── .env.example        # 環境變量展示
│   └── .env                # 環境變量（本地）
└── start/                   # 啟動指南和指令碼
    ├── run                 # 多功能啟動指令碼
    ├── start_backend.sh    # 後端啟動指令
    ├── start_frontend.sh   # 前端啟動指令
    └── readme.md           # 本文件
```

## Docker 指令碼使用

### 啟動選項

```bash
# 本地模式
./run local [options]

選項:
  --backend-only    僅啟動後端
  --frontend-only   僅啟動前端
  --no-install      跳過依賴安裝

示例:
  ./run local --backend-only        # 仅后端
  ./run local --frontend-only       # 仅前端
```

### Docker 模式

```bash
./run docker [options]

選項:
  --build           重建鏡像
  --detach          後台運行
  --logs            查看即時日誌
  --stop            停止容器
  --down            停止並刪除容器

示例:
  ./run docker              # 啟動容器
  ./run docker --build      # 重建並啟動
  ./run docker --detach     # 後台啟動
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
- 或使用指令碼查看日誌

### 修改密碼
編輯環境設定檔：
```env
VITE_ADMIN_PASSWORD=your_new_password
ADMIN_PASSWORD=your_new_password
```

## 故障排除

### Docker 相關
- **Docker 未安裝**：安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **權限錯誤**：運行 `sudo usermod -aG docker $USER`
- **端口被佔用**：修改 `infra/docker-compose.yml` 中的端口映射

### 本地開發

#### 後端無法啟動
- 檢查 conda 環境：`conda list`
- 重新安裝依賴：`pip install -r requirements.txt`
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

npm run dev
```

前端將在 `http://localhost:3000`（或下一個可用端口）啟動

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
  - API Key 在 `backend/.env` 配置
  - 型號在 `backend/.env` 配置（預設：`gemini-3.1-flash-lite-preview`）

## 環境變量配置

### 前端 (`frontend/.env.local`)
```env
VITE_API_URL=http://localhost:8000
VITE_ADMIN_PASSWORD=admin123
```

### 後端 (`backend/.env`)
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite-preview
```

## 項目結構
```
ai-vibe-c/
├── frontend/          # React 前端應用
│   ├── src/
│   ├── .env.local     # 前端環境變量
│   └── package.json
├── backend/           # FastAPI 後端服務
│   ├── main.py        # 主應用入點
│   ├── config.py      # 配置管理
│   ├── models.py      # 資料模型
│   ├── stats.py       # 統計管理
│   ├── ai_service.py  # AI 服務
│   ├── .env           # 後端環境變量
│   └── requirements.txt
└── start/             # 啟動指南
    ├── start_backend.sh   # 後端啟動指令
    ├── start_frontend.sh  # 前端啟動指令
    └── readme.md          # 本文件
```

## 開發指南

### 添加新的按鈕追蹤
在前端 `App.tsx` 中的按鈕處理函式中添加：
```typescript
trackButtonEvent('button_name');
```

### 查看統計數據
- 通過 API：`curl http://localhost:8000/api/button-stats`
- 前端中無直接 UI，可通過瀏覽器開發者工具檢查網路請求

### 修改密碼
編輯 `frontend/.env.local`：
```env
VITE_ADMIN_PASSWORD=your_new_password
```

## 故障排除

### 後端無法啟動
- 檢查 conda 環境：`conda list`
- 重新安裝依賴：`pip install -r requirements.txt`
- 檢查 API Key 是否設定在 `.env`

### 前端無法連接後端
- 確認後端已啟動並在 `http://localhost:8000`
- 檢查 CORS 是否啟用（應已在後端配置）
- 檢查 `frontend/.env.local` 中的 `VITE_API_URL`

### AI 生圖失敗
- 檢查 Gemini API Key 是否有效
- 檢查配額限制
- 查看後端日誌中的詳細錯誤

## 相關資源
- [FastAPI 文件](https://fastapi.tiangolo.com/)
- [React 文件](https://react.dev/)
- [Gemini API](https://ai.google.dev/docs)

