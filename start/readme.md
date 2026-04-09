# AI Vibe C step08-migration-go - 後端 Go 版

## 架構概述

本專案已演進為前後端分離架構：
- **前端**：React + Vite（本地預設 3000）
- **後端**：Go + Gin（本地預設 8000）
- **功能**：AI 繪圖、按鈕事件統計、密碼保護
- **外網分享**：使用 ngrok 隧道公開後端服務
- **部署**：前端 Firebase Hosting、後端可本地 Go、Docker 容器化

## 目標

- 後端已全面改為 Go (移除 FastAPI)
- 保留 `ngrok_tunnel.py` 以便外網隧道功能
- 更新啟動腳本 `start/run`，支援 Go 後端、Firebase、ngrok
- 說明如何在本地、Docker、Firebase、ngrok 三者都能通

## 快速啟動

```bash
cd ai-vibe-c/start

# 使用 Go 後端啟動本地服務
./run local --go-backend

# 使用 Go 後端並啟動 Ngrok 隧道
./run local --go-backend --ngrok

# 僅啟動 Go 後端
./run local --backend-only --go-backend

# 僅啟動 Ngrok 隧道（後端需先啟動）
./run local --ngrok-only

# 將前端建置並部署到 Firebase
./run local --deploy-firebase

# Docker 模式啟動
./run docker

# Docker 重建映像檔
./run docker --build
```

## 環境準備

### 前端
- Node.js 18+
- 安裝相依套件：`npm install`

### Go 後端
- Go 1.21+
- 後端相依套件由 `go mod tidy` / `go run main.go` 自動處理

## 本地啟動方式

### 1. Go 後端 + 前端

```bash
cd ai-vibe-c/start
./run local --go-backend
```

### 2. Go 後端 + 前端 + Ngrok

```bash
cd ai-vibe-c/start
./run local --go-backend --ngrok
```

### 3. 僅啟動 Go 後端

```bash
cd ai-vibe-c/start
./run local --backend-only --go-backend
```

### 4. 僅啟動 Ngrok 隧道

```bash
cd ai-vibe-c/start
./run local --ngrok-only
```

> 注意：`--ngrok-only` 只會啟動 ngrok 隧道，後端需先在本機運行。

### 5. Firebase 部署（前端）

```bash
cd ai-vibe-c/start
./run local --deploy-firebase
```

## Go 後端說明

後端程式位於 `backend/go-backend/`：
- `main.go`：Gin Web API、按鈕事件統計、AI 繪圖 API
- `go.mod` / `go.sum`：Go 模組相依套件
- `Dockerfile`：用於 Docker 部署
- `.dockerignore`：忽略不必要檔案

### Go API 端點

- `GET /health`
- `POST /api/button-event`
- `GET /api/button-stats`
- `GET /api/button-events`
- `POST /api/ai-draw`
- `POST /api/reset-stats`

### Go 後端啟動命令

```bash
cd backend/go-backend
go run main.go
```

如果你已經開啟 `start/run`，則可直接使用 `--go-backend` 選項。

## Ngrok 隧道

後端仍保留 `backend/ngrok_tunnel.py`，這個腳本會：
- 讀取 `backend/.env` 中的 `NGROK_AUTHTOKEN` 和可選的 `NGROK_DOMAIN`
- 自動下載 ngrok v3 二進位檔到 `backend/ngrok`
- 建立本地 `http://127.0.0.1:8000` 到 ngrok 的外網連線

### 設定 `backend/.env`

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite-preview
NGROK_AUTHTOKEN=your_ngrok_authtoken
NGROK_DOMAIN=optional_reserved_domain.ngrok-free.dev
```

### 啟動 Ngrok

```bash
cd ai-vibe-c/start
./run local --ngrok-only
```

### Go 後端 + Ngrok

```bash
cd ai-vibe-c/start
./run local --go-backend --ngrok
```

## Firebase Hosting 部署

前端仍使用 Firebase Hosting，請確認：
- `firebase login`
- `firebase use --add`
- `infra/.env` 已正確配置

部署命令：

```bash
cd ai-vibe-c/start
./run local --deploy-firebase
```

> 這個命令會先執行 `npm run build`，再部署 `frontend/dist` 到 Firebase Hosting。

## Docker 支援

`infra/docker-compose.yml` 現在已改為使用 Go 後端 Dockerfile：
- 後端服務使用 `backend/go-backend/Dockerfile`
- 前端服務使用 Node 18 Alpine

### Docker 啟動

```bash
cd ai-vibe-c/start
./run docker
```

### Docker 紀錄 (Logs)

```bash
./run docker --logs
```

### 停止並刪除

```bash
./run docker --down
```

## 本專案結構

```text
ai-vibe-c/
├── frontend/                # React 前端應用程式
│   ├── src/
│   ├── .env.local           # 前端環境變數
│   └── package.json
├── backend/                 # 後端專案
│   ├── go-backend/          # Go 後端實作
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── .dockerignore
│   │   └── main            # build artifact,已忽略
│   ├── ngrok                # ngrok 執行檔
│   ├── ngrok_tunnel.py      # ngrok 隧道腳本
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
├── infra/
│   ├── docker-compose.yml
│   ├── .env.example
│   └── .env
└── start/
    ├── run
    └── readme.md
```

## 故障排除

### Go 後端無法啟動
- 檢查通訊埠 8000 是否已被佔用
- 確認 `GO` 已安裝：`go version`
- 確認 `backend/.env` 中 `GEMINI_API_KEY` 已設定

### Ngrok 隧道失敗
- 檢查 `NGROK_AUTHTOKEN`
- 確認 ngrok 帳號是否有有效代理配額
- 如果使用保留域名，請檢查 `NGROK_DOMAIN` 是否有效

### Firebase 部署失敗
- 確認 `frontend/dist` 已成功建立
- 執行 `firebase use --add` 選擇正確專案
- 確認 `firebase deploy --only hosting:ai-diy-123` 可在專案根目錄執行

## 相關資源
- [Go 官方網站](https://golang.org/dl/)
- [Gin 文檔](https://gin-gonic.com/docs/)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [ngrok v3 文檔](https://ngrok.com/docs)
