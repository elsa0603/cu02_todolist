# 線上工作清單網站

一個使用 React + TypeScript + Vite 和 Supabase 建立的現代化協作式工作清單應用程式，支援多人協作、拖動排序、即時同步等功能。

## 功能特色

- 🔐 **身份驗證系統**：電子郵件登入/註冊，會話管理
- 👥 **協作功能**：所有人可查看所有任務，但只能管理自己的任務
- 📋 **三欄分類**：專案A、專案B、專案C
- ✅ 新增、編輯、刪除工作項目
- ✅ 標記完成/未完成狀態（僅限自己的任務）
- ✅ 拖動排序（所有人可排序，上下移動工作項目，僅限同類別內）
- ✅ 顯示建立時間（相對時間格式）
- ✅ 即時同步到 Supabase 資料庫
- ✅ 響應式設計，支援手機和桌面裝置
- ✅ 現代化 UI 設計，支援深色模式

## 技術棧

- **前端框架**: React 18 + TypeScript
- **建置工具**: Vite
- **後端/資料庫**: Supabase (PostgreSQL)
- **拖動排序**: @dnd-kit
- **樣式**: CSS3 (支援深色模式)

## 開始使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Supabase

1. 在 [Supabase](https://supabase.com) 建立新專案
2. 進入專案的 SQL Editor
3. 依序執行以下 SQL 腳本：
   - `supabase-setup.sql` - 建立資料表
   - `supabase-add-user-auth.sql` - 添加身份驗證支援
   - `supabase-update-rls-policies.sql` - 設定權限政策
4. 在專案設定中取得你的 Supabase URL 和 Anon Key
5. （可選）如需關閉電子郵件確認，參考 `supabase-disable-email-confirmation.md`

### 3. 設定環境變數

在專案根目錄建立 `.env.local` 檔案：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

將 `your_supabase_url` 和 `your_supabase_anon_key` 替換為你的 Supabase 專案資訊。

### 4. 啟動開發伺服器

```bash
npm run dev
```

應用程式將在 `http://localhost:5173` 啟動。

### 5. 建置生產版本

```bash
npm run build
```

建置檔案將輸出到 `dist` 目錄。

## 資料庫結構

### todos 資料表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 唯一識別碼（主鍵） |
| content | TEXT | 工作內容 |
| completed | BOOLEAN | 完成狀態（預設 false） |
| created_at | TIMESTAMP WITH TIME ZONE | 建立時間 |
| sort_order | INTEGER | 排序順序（用於拖動排序，每個類別獨立） |
| category | TEXT | 分類（專案A、專案B、專案C） |
| user_id | UUID | 用戶 ID（外鍵，關聯到 auth.users） |

## 專案結構

```
cu02_todolist/
├── public/                          # 靜態資源
├── src/
│   ├── components/                  # React 元件
│   │   ├── TodoList.tsx            # 主要清單元件
│   │   ├── TodoItem.tsx            # 單一工作項目元件
│   │   ├── AddTodoForm.tsx         # 新增工作表單
│   │   ├── AuthForm.tsx            # 登入/註冊表單
│   │   └── EmailConfirmationNotice.tsx  # 電子郵件確認通知
│   ├── hooks/                       # 自訂 Hooks
│   │   ├── useTodos.ts             # 工作清單資料管理
│   │   └── useAuth.ts             # 身份驗證管理
│   ├── lib/                        # 工具函式
│   │   └── supabase.ts            # Supabase 客戶端設定
│   ├── App.tsx                     # 主應用元件
│   ├── App.css                     # 應用樣式
│   ├── main.tsx                    # 應用入口
│   └── index.css                   # 全域樣式
├── supabase-setup.sql              # 初始資料庫設定
├── supabase-add-user-auth.sql      # 添加用戶身份驗證
├── supabase-update-rls-policies.sql  # 更新權限政策
├── supabase-recreate-table.sql     # 重建資料表
├── supabase-migration.sql          # 遷移腳本
├── supabase-update-category-constraint.sql  # 更新類別約束
├── supabase-disable-email-confirmation.md   # 關閉電子郵件確認說明
├── DOCUMENTATION.md                # 完整專案規格文件
├── package.json
└── vite.config.ts
```

## 使用說明

1. **註冊/登入**: 首次使用需要註冊帳號，之後可直接登入
2. **新增工作**: 在頂部選擇類別（專案A/專案B/專案C），輸入工作內容，點擊「新增」按鈕
3. **標記完成**: 點擊工作項目左側的核取方塊（僅限自己的任務）
4. **刪除工作**: 點擊工作項目右側的「×」按鈕（僅限自己的任務）
5. **排序工作**: 按住工作項目左側的拖動圖示（六個點），上下拖動來改變順序（所有人可排序，僅限同類別內）
6. **查看所有任務**: 所有人可以看到所有用戶的任務，但只能管理自己的任務
7. **分類管理**: 工作項目會自動分類到對應的欄位中，不同類別之間無法相互拖動

## 注意事項

- **權限管理**: 使用 Row Level Security (RLS) 保護資料，所有人可查看和排序，但只能管理自己的任務
- **身份驗證**: 必須登入才能使用，支援電子郵件確認（可選）
- **時間顯示**: 使用相對時間格式（如「2 小時前」），超過一週則顯示完整日期時間
- **即時同步**: 拖動排序會即時同步到 Supabase，所有變更都會自動儲存
- **分類獨立**: 每個類別（專案A、專案B、專案C）的排序順序是獨立的，不同類別之間無法相互拖動
- **響應式設計**: 在手機裝置上，三欄布局會自動切換為單欄顯示
- **深色模式**: 自動適配系統深色模式設定

## 部署

專案已配置 GitHub Actions 自動部署到 GitHub Pages。

### 快速部署步驟

1. **推送到 GitHub**:
   ```bash
   git push origin main
   ```

2. **設定 GitHub Secrets**（在倉庫 Settings > Secrets）:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **啟用 GitHub Pages**（在倉庫 Settings > Pages）:
   - Source: GitHub Actions

4. **等待部署完成**（約 1-2 分鐘）

詳細部署說明請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 詳細文檔

完整的專案規格文件請參考 [DOCUMENTATION.md](./DOCUMENTATION.md)，包含：
- 詳細的 API 說明
- 元件使用指南
- 權限管理說明
- 故障排除指南
- 開發指南
- 部署說明

## 授權

MIT License
