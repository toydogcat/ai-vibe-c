# Git Example

這個資料夾用來學習 Git 的基礎操作，特別適合你在 `step/02-git-init` 階段練習版本控制和分支管理。

## 1. Git 四大核心區塊

在學習指令前，先理解 Git 的四個區塊，這樣你就能知道為什麼要 `git add`、`git commit`。

- **Working Directory (工作區)**：你正在編輯檔案的地方。
- **Staging Area (暫存區)**：準備要提交到版本歷史的檔案清單。
- **Local Repository (本地倉庫)**：已提交的 commit 紀錄存在的地方。
- **Remote Repository (遠端倉庫)**：像 GitHub、GitLab 上的備份版本。

## 2. 常用指令大全

### 2.1 初始化與基本設定

```bash
git init                    # 在目前資料夾初始化 Git 倉庫
git config --global user.name "你的名字"
git config --global user.email "你的信箱"
```

### 2.2 存檔流程（最常用）

這是你在開發小畫家時每天會使用的流程：

```bash
git status                  # 查看哪些檔案已修改
git add <檔案名稱>           # 將單一檔案加入暫存區
git add .                   # 將所有改動過的檔案加入暫存區
git commit -m "你的 commit 訊息"
```

建議寫 commit 訊息時使用簡單明確格式，例如：
- `feat: add drawing canvas`
- `fix: correct brush size logic`
- `docs: update README`

### 2.3 分支操作

你想用 `step/` 分支來切分開發階段，以下是常用分支指令：

```bash
git branch                  # 列出所有分支
git branch <新分支名>        # 建立新分支
git switch <分支名>          # 切換分支（推薦）
git checkout -b <分支名>     # 建立並切換到新分支
git branch -d <分支名>       # 刪除本地分支
```

分支命名建議：
- `step/01-python-core`
- `step/02-git-init`
- `step/03-frontend-vite`

### 2.4 查看與復原

```bash
git log --oneline           # 以簡潔模式查看 commit 歷史
git diff                    # 查看未提交的變更內容
git checkout -- <檔案>      # 還原檔案到上一次 commit 的狀態
git reset --hard HEAD       # 放棄所有未提交的變更
```

## 3. 建議的學習流程

這份 Git 教學可以搭配你的小畫家專案步驟，讓學生練習實際流程：

1. 在 `python-example` 或其他目錄新增/修改程式。
2. 查看變更：`git status`
3. 將變更加入暫存：`git add <檔案>`
4. 提交 commit：`git commit -m "feat: add new feature"`
5. 建立新分支：`git switch -c step/03-frontend-vite`

### 3.1 練習範例：第一次 commit

```bash
git status
git add exp1.py
git commit -m "feat: add initial Python drawing example"
```

### 3.2 練習分支：建立 step/02-git-init

```bash
git switch -c step/02-git-init
git add readme.md .gitignore
git commit -m "chore: add git tutorial README and .gitignore"
```

## 4. 小提醒

- 每次改完程式，先執行 `git status`。
- 如果只想暫存部分內容，可以用 `git add -p`。
- `git switch` 是較新的分支切換指令，推薦取代 `git checkout`。
- 若要和遠端同步，可在設定 remote 後使用 `git push`。

---

這份 README 現在更適合教學使用，也更適合你在 `step/02-git-init` 階段當成參考手冊。
