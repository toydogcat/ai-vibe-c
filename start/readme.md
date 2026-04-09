# AI Vibe C step04-backend-fastapi - 前後端分離開始指南

## 架構概述

本項目已分離成前後端獨立服務：
- **前端**：React + Vite（通訊埠 3000 或 3001）
- **後端**：FastAPI（通訊埠 8000）
- **功能**：AI 繪圖、按鈕統計、密碼保護

## 環境準備

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
  conda activate <your-conda-env>  # 啟用環境
  ```

## 快速啟動

### 1. 啟動後端服務（FastAPI）

在新終端機開啟：
```bash
# 進入後端目錄
cd backend
conda activate <your-conda-env>
pip install -r requirements.txt
python main.py
```

後端將在 `http://localhost:8000` 啟動
- 健康檢查：`http://localhost:8000/health`
- API 文件：`http://localhost:8000/docs`

### 2. 啟動前端服務（React）

在新終端機開啟：
```bash
# 進入前端目錄
cd frontend
npm install  # 首次運行
npm run dev
```

前端將在 `http://localhost:3000`（或下一個可用通訊埠）啟動

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
│   ├── main.py        # 主應用進入點
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
- 重新安裝相依套件：`pip install -r requirements.txt`
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
