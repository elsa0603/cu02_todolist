# 部署指南

本文件說明如何將專案部署到 GitHub Pages。

## 前置需求

1. GitHub 帳號
2. 已建立的 GitHub 倉庫
3. Supabase 專案（用於後端服務）

## 部署步驟

### 1. 準備 GitHub 倉庫

1. 在 GitHub 建立新倉庫（或使用現有倉庫）
2. 將專案推送到 GitHub：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. 設定 GitHub Secrets

由於專案需要 Supabase 環境變數，需要在 GitHub 設定 Secrets：

1. 前往您的 GitHub 倉庫
2. 點擊 **Settings** > **Secrets and variables** > **Actions**
3. 點擊 **New repository secret**
4. 添加以下 Secrets：

   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: 您的 Supabase Project URL

   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: 您的 Supabase Anon Key

### 3. 設定 GitHub Pages

1. 前往倉庫的 **Settings** > **Pages**
2. 在 **Source** 區塊：
   - 選擇 **GitHub Actions**
3. 儲存設定

### 4. 更新倉庫名稱（如需要）

如果您的 GitHub 倉庫名稱不是 `cu02_todolist`，需要更新 `vite.config.ts` 中的 `base` 路徑：

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME/' : '/',
})
```

### 5. 觸發部署

有兩種方式觸發部署：

#### 方式 1: 自動部署（推薦）

推送到 `main` 分支會自動觸發部署：

```bash
git add .
git commit -m "Update code"
git push origin main
```

#### 方式 2: 手動觸發

1. 前往倉庫的 **Actions** 標籤
2. 選擇 **Deploy to GitHub Pages** 工作流程
3. 點擊 **Run workflow**
4. 選擇分支並點擊 **Run workflow**

### 6. 查看部署狀態

1. 前往 **Actions** 標籤
2. 查看最新的工作流程執行狀態
3. 等待部署完成（通常需要 1-2 分鐘）

### 7. 訪問您的網站

部署完成後，您的網站將可在以下網址訪問：

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

例如：`https://username.github.io/cu02_todolist/`

## 自訂域名（可選）

如果您想使用自訂域名：

1. 更新 `vite.config.ts`，將 `base` 設為 `/`：

```typescript
base: '/',
```

2. 在專案根目錄建立 `public/CNAME` 檔案，內容為您的域名：

```
yourdomain.com
```

3. 在您的域名 DNS 設定中添加 CNAME 記錄：
   - **Type**: CNAME
   - **Name**: @ 或 www
   - **Value**: YOUR_USERNAME.github.io

4. 重新部署專案

## 故障排除

### 問題 1: 部署後頁面空白

**原因**: `base` 路徑設定錯誤。

**解決方案**:
- 確認 `vite.config.ts` 中的 `base` 路徑與倉庫名稱一致
- 確認路徑以 `/` 開頭和結尾

### 問題 2: 環境變數未載入

**原因**: GitHub Secrets 未正確設定。

**解決方案**:
- 檢查 Secrets 名稱是否正確（區分大小寫）
- 確認 Secrets 已添加到倉庫
- 檢查 Actions 日誌中的環境變數是否正確載入

### 問題 3: 404 錯誤

**原因**: 路由問題或 base 路徑錯誤。

**解決方案**:
- 確認 `vite.config.ts` 中的 `base` 設定正確
- 檢查 GitHub Pages 設定是否正確

### 問題 4: 建置失敗

**原因**: 依賴問題或 TypeScript 錯誤。

**解決方案**:
- 檢查 Actions 日誌中的錯誤訊息
- 確認本地建置成功：`npm run build`
- 檢查 `package-lock.json` 是否已提交

## 更新部署

每次推送到 `main` 分支都會自動觸發新的部署。您也可以：

1. 手動觸發部署（見上方「方式 2」）
2. 使用 GitHub CLI：

```bash
gh workflow run deploy.yml
```

## 注意事項

- ⚠️ **環境變數安全**: 確保不要將 `.env.local` 檔案提交到 Git
- ⚠️ **建置時間**: 首次部署可能需要較長時間
- ⚠️ **快取**: GitHub Actions 會快取 node_modules，加速後續部署
- ⚠️ **分支保護**: 建議保護 `main` 分支，避免直接推送

## 相關文件

- [GitHub Pages 官方文檔](https://docs.github.com/en/pages)
- [GitHub Actions 官方文檔](https://docs.github.com/en/actions)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

