# GitHub Pages 部署故障排除

## 常見錯誤與解決方案

### 1. 建置失敗：環境變數未設定

**錯誤訊息**：
```
Error: Missing Supabase environment variables
```

**解決方案**：
1. 前往倉庫的 **Settings** > **Secrets and variables** > **Actions**
2. 確認已添加以下 Secrets：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. 重新觸發部署

### 2. 部署失敗：權限不足

**錯誤訊息**：
```
Error: Resource not accessible by integration
```

**解決方案**：
1. 前往倉庫的 **Settings** > **Actions** > **General**
2. 在 **Workflow permissions** 區塊：
   - 選擇 **Read and write permissions**
   - 勾選 **Allow GitHub Actions to create and approve pull requests**
3. 點擊 **Save**
4. 重新觸發部署

### 3. 頁面空白或 404 錯誤

**原因**：`base` 路徑設定錯誤

**解決方案**：
1. 確認 `vite.config.ts` 中的 `base` 路徑與倉庫名稱一致：
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/cu02_todolist/' : '/',
   ```
2. 如果倉庫名稱不同，更新為正確的路徑
3. 重新建置和部署

### 4. GitHub Pages 未啟用

**錯誤訊息**：
```
No GitHub Pages site found
```

**解決方案**：
1. 前往倉庫的 **Settings** > **Pages**
2. 在 **Source** 區塊選擇 **GitHub Actions**
3. 儲存設定
4. 重新觸發部署

### 5. 建置超時

**解決方案**：
- GitHub Actions 預設超時時間為 6 小時，通常不會超時
- 如果確實超時，檢查是否有無限循環或大量檔案

### 6. 依賴安裝失敗

**錯誤訊息**：
```
npm ERR! code ELIFECYCLE
```

**解決方案**：
1. 確認 `package-lock.json` 已提交到倉庫
2. 檢查 `package.json` 中的依賴版本是否正確
3. 嘗試清除快取並重新部署

### 7. TypeScript 編譯錯誤

**錯誤訊息**：
```
error TS2307: Cannot find module
```

**解決方案**：
1. 在本地執行 `npm run build` 檢查是否有錯誤
2. 修復所有 TypeScript 錯誤
3. 提交修復後重新推送

## 檢查清單

部署前請確認：

- [ ] GitHub Secrets 已設定（`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`）
- [ ] GitHub Pages 已啟用（Settings > Pages > Source: GitHub Actions）
- [ ] Workflow permissions 已設定（Settings > Actions > General）
- [ ] `vite.config.ts` 中的 `base` 路徑正確
- [ ] 本地建置成功（`npm run build`）
- [ ] 所有檔案已提交並推送到 GitHub

## 查看部署日誌

1. 前往倉庫的 **Actions** 標籤
2. 點擊最新的工作流程執行
3. 展開各個步驟查看詳細日誌
4. 查找錯誤訊息並參考上方解決方案

## 手動測試建置

在本地測試建置：

```bash
# 設定環境變數（Windows PowerShell）
$env:VITE_SUPABASE_URL="your_supabase_url"
$env:VITE_SUPABASE_ANON_KEY="your_anon_key"
$env:NODE_ENV="production"

# 建置
npm run build

# 預覽建置結果
npm run preview
```

## 重新部署

如果部署失敗，可以：

1. **修復問題後重新推送**：
   ```bash
   git add .
   git commit -m "Fix deployment issues"
   git push origin main
   ```

2. **手動觸發部署**：
   - 前往 **Actions** 標籤
   - 選擇 **Deploy to GitHub Pages**
   - 點擊 **Run workflow**

3. **清除快取並重新部署**：
   - 前往 **Actions** 標籤
   - 點擊工作流程
   - 點擊右上角的 **...** > **Delete workflow run**
   - 重新觸發部署

## 取得協助

如果問題仍未解決：

1. 檢查 [GitHub Actions 文檔](https://docs.github.com/en/actions)
2. 檢查 [GitHub Pages 文檔](https://docs.github.com/en/pages)
3. 查看工作流程日誌中的詳細錯誤訊息
4. 在 GitHub Issues 中報告問題


