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
   - 在 `.env.local` 中填入你的 Firebase web app config 變量：
     ```
     VITE_FIREBASE_API_KEY=你的_api_key
     VITE_FIREBASE_AUTH_DOMAIN=你的_auth_domain
     VITE_FIREBASE_PROJECT_ID=你的_project_id
     VITE_FIREBASE_STORAGE_BUCKET=你的_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=你的_messaging_sender_id
     VITE_FIREBASE_APP_ID=你的_app_id
     VITE_FIREBASE_MEASUREMENT_ID=你的_measurement_id
     ```
   - 也可保留或修改後端 URL / 管理密碼設定：
     ```
     VITE_API_URL=http://localhost:8000
     VITE_ADMIN_PASSWORD=admin123
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

