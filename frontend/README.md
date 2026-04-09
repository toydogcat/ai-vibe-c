# 前端啟動
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

