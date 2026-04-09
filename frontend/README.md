# 前端啟動

1. 進入 frontend 目錄：
   ```bash
   cd frontend
   ```

2. 安裝相依套件：
   ```bash
   npm install
   ```

3. 設置環境變數：
   - 複製 `env.example` 為 `.env.local`
   - 填入您的 Gemini API key：
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

4. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

5. 在瀏覽器中打開 http://localhost:3000 查看應用

### 其他命令
- 建置生產版本：`npm run build`
- 預覽生產版本：`npm run preview`
- 清理建置檔案：`npm run clean`
- 類型檢查：`npm run lint`
