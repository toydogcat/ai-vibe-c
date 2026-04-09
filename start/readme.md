
# AI Vibe C, step03-frontend-vite - 開始指南

歡迎使用 AI Vibe C！這是一個使用 AI Studio 或其他代碼生成工具來完成前端項目的項目。

## 快速開始

### 1. 環境準備
- 確保已安裝 Node.js（推薦版本 18+）
- 複製 `env.example` 為 `.env` 並填入必要的環境變數

### 2. 前端啟動
1. 進入 frontend 目錄：
   ```
   cd frontend
   ```

2. 安裝依賴：
   ```
   npm install
   ```

3. 設置環境變數：
   - 複製 `env.example` 為 `.env.local`
   - 填入你的 Gemini API key：
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. 啟動開發服務器：
   ```
   npm run dev
   ```

5. 在瀏覽器中打開 http://localhost:3000 查看應用

### 3. 其他命令
- 構建生產版本：`npm run build`
- 預覽生產版本：`npm run preview`
- 清理構建文件：`npm run clean`
- 類型檢查：`npm run lint`

## 項目結構
- `frontend/` - React + Vite 前端應用
- `start/` - 開始指南和文檔

## 更多信息
查看 [frontend/README.md](frontend/README.md) 獲取詳細說明，或訪問 AI Studio 查看應用：https://ai.studio/apps/167c4f02-b81f-49e6-92ce-b81cc2a04fcc


