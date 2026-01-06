# 專案規格文件

## 目錄

1. [專案概述](#專案概述)
2. [功能特色](#功能特色)
3. [技術棧](#技術棧)
4. [專案結構](#專案結構)
5. [安裝與設定](#安裝與設定)
6. [資料庫結構](#資料庫結構)
7. [身份驗證系統](#身份驗證系統)
8. [權限管理](#權限管理)
9. [API 與 Hooks](#api-與-hooks)
10. [元件說明](#元件說明)
11. [樣式系統](#樣式系統)
12. [部署說明](#部署說明)
13. [開發指南](#開發指南)
14. [故障排除](#故障排除)

---

## 專案概述

**cu02_todolist** 是一個現代化的協作式工作清單應用程式，使用 React + TypeScript + Vite 和 Supabase 建立。支援多人協作、即時同步、拖動排序等功能。

### 核心特性

- 🔐 **身份驗證系統**：基於 Supabase Auth 的電子郵件登入/註冊
- 👥 **協作功能**：所有人可查看所有任務，但只能管理自己的任務
- 📋 **三欄分類**：專案A、專案B、專案C
- 🎯 **拖動排序**：支援同類別內拖動排序
- ⚡ **即時同步**：使用 Supabase Realtime 即時同步資料
- 📱 **響應式設計**：完美支援手機和桌面裝置
- 🌙 **深色模式**：自動適配系統深色模式

---

## 功能特色

### 1. 身份驗證
- ✅ 電子郵件註冊/登入
- ✅ 電子郵件確認（可選）
- ✅ 會話管理
- ✅ 自動登入狀態保持

### 2. 任務管理
- ✅ 新增任務（選擇類別：專案A/B/C）
- ✅ 標記完成/未完成（僅限自己的任務）
- ✅ 刪除任務（僅限自己的任務）
- ✅ 查看所有任務（所有人可見）

### 3. 協作功能
- ✅ 所有人可查看所有任務
- ✅ 所有人可拖動排序（更新 sort_order）
- ✅ 只有任務擁有者可標記完成
- ✅ 只有任務擁有者可刪除任務

### 4. 使用者體驗
- ✅ 拖動排序（同類別內）
- ✅ 相對時間顯示（如「2 小時前」）
- ✅ 載入狀態提示
- ✅ 錯誤訊息顯示
- ✅ 樂觀更新（Optimistic Updates）

---

## 技術棧

### 前端
- **框架**: React 19.2.0
- **語言**: TypeScript 5.9.3
- **建置工具**: Vite 7.2.4
- **拖動排序**: @dnd-kit/core 6.3.1, @dnd-kit/sortable 10.0.0
- **樣式**: CSS3（支援深色模式）

### 後端/資料庫
- **平台**: Supabase
- **資料庫**: PostgreSQL（透過 Supabase）
- **身份驗證**: Supabase Auth
- **即時同步**: Supabase Realtime

### 開發工具
- **Linter**: ESLint 9.39.1
- **Type Checking**: TypeScript ESLint 8.46.4

---

## 專案結構

```
cu02_todolist/
├── public/                          # 靜態資源
│   └── vite.svg
├── src/
│   ├── components/                  # React 元件
│   │   ├── AddTodoForm.tsx         # 新增任務表單
│   │   ├── AuthForm.tsx            # 登入/註冊表單
│   │   ├── EmailConfirmationNotice.tsx  # 電子郵件確認通知
│   │   ├── TodoItem.tsx            # 單一任務項目元件
│   │   └── TodoList.tsx            # 任務清單主元件
│   ├── hooks/                       # 自訂 Hooks
│   │   ├── useAuth.ts              # 身份驗證 Hook
│   │   └── useTodos.ts             # 任務管理 Hook
│   ├── lib/                        # 工具函式
│   │   └── supabase.ts            # Supabase 客戶端設定
│   ├── assets/                     # 資源檔案
│   │   └── react.svg
│   ├── App.tsx                     # 主應用元件
│   ├── App.css                     # 應用樣式
│   ├── index.css                   # 全域樣式
│   └── main.tsx                    # 應用入口
├── supabase-setup.sql              # 初始資料庫設定
├── supabase-add-user-auth.sql      # 添加用戶身份驗證
├── supabase-update-rls-policies.sql  # 更新權限政策
├── supabase-recreate-table.sql     # 重建資料表
├── supabase-migration.sql          # 遷移腳本
├── supabase-update-category-constraint.sql  # 更新類別約束
├── supabase-disable-email-confirmation.md    # 關閉電子郵件確認說明
├── package.json                    # 專案依賴
├── tsconfig.json                   # TypeScript 設定
├── vite.config.ts                  # Vite 設定
├── eslint.config.js               # ESLint 設定
└── README.md                       # 專案說明
```

---

## 安裝與設定

### 1. 環境需求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase 帳號

### 2. 安裝依賴

```bash
npm install
```

### 3. Supabase 設定

#### 3.1 建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com) 建立新專案
2. 等待專案初始化完成

#### 3.2 設定資料庫

在 Supabase SQL Editor 中依序執行以下 SQL 腳本：

1. **初始設定**：執行 `supabase-setup.sql`
   ```sql
   -- 建立 todos 資料表
   -- 建立索引
   -- 設定預設值
   ```

2. **添加身份驗證**：執行 `supabase-add-user-auth.sql`
   ```sql
   -- 添加 user_id 欄位
   -- 啟用 RLS
   -- 建立初始政策
   ```

3. **更新權限政策**：執行 `supabase-update-rls-policies.sql`
   ```sql
   -- 更新為協作式權限
   -- 建立觸發器
   ```

#### 3.3 設定身份驗證（可選）

如需關閉電子郵件確認（開發環境）：

1. 前往 **Authentication** > **Settings**
2. 取消勾選 **"Enable email confirmations"**
3. 點擊 **Save**

詳細說明請參考 `supabase-disable-email-confirmation.md`

### 4. 環境變數設定

在專案根目錄建立 `.env.local` 檔案：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

取得方式：
1. 前往 Supabase Dashboard
2. 選擇專案
3. 前往 **Settings** > **API**
4. 複製 **Project URL** 和 **anon public** key

### 5. 啟動開發伺服器

```bash
npm run dev
```

應用程式將在 `http://localhost:5173` 啟動。

### 6. 建置生產版本

```bash
npm run build
```

建置檔案將輸出到 `dist` 目錄。

---

## 資料庫結構

### todos 資料表

| 欄位 | 類型 | 說明 | 約束 |
|------|------|------|------|
| id | UUID | 唯一識別碼（主鍵） | PRIMARY KEY, DEFAULT gen_random_uuid() |
| content | TEXT | 任務內容 | NOT NULL |
| completed | BOOLEAN | 完成狀態 | DEFAULT false |
| created_at | TIMESTAMP WITH TIME ZONE | 建立時間 | DEFAULT now() |
| sort_order | INTEGER | 排序順序 | DEFAULT 0 |
| category | TEXT | 分類 | NOT NULL, DEFAULT '專案A', CHECK IN ('專案A', '專案B', '專案C') |
| user_id | UUID | 用戶 ID | REFERENCES auth.users(id) ON DELETE CASCADE |

### 索引

- `idx_todos_sort_order`: 優化排序查詢
- `idx_todos_category`: 優化分類查詢
- `idx_todos_category_sort`: 優化分類+排序查詢
- `idx_todos_user_id`: 優化用戶查詢
- `idx_todos_user_category_sort`: 優化用戶+分類+排序查詢

### 觸發器

- `check_todo_update`: 檢查更新權限
  - 確保只有任務擁有者可更新 `completed` 狀態
  - 防止非擁有者修改 `content`、`category`、`user_id`

---

## 身份驗證系統

### 架構

使用 Supabase Auth 進行身份驗證，支援：
- 電子郵件/密碼登入
- 電子郵件/密碼註冊
- 會話管理
- 電子郵件確認（可選）

### useAuth Hook

位置：`src/hooks/useAuth.ts`

#### API

```typescript
const {
  user,                    // 當前用戶（User | null）
  session,                 // 當前會話（Session | null）
  loading,                 // 載入狀態（boolean）
  signUp,                 // 註冊函數
  signIn,                 // 登入函數
  signOut,                // 登出函數
  resendConfirmationEmail, // 重新發送確認郵件
  isEmailConfirmed        // 電子郵件是否已確認（boolean）
} = useAuth()
```

#### 使用範例

```typescript
// 註冊
const { data, error } = await signUp(email, password)

// 登入
const { data, error } = await signIn(email, password)

// 登出
const { error } = await signOut()

// 重新發送確認郵件
const { data, error } = await resendConfirmationEmail(email)
```

---

## 權限管理

### Row Level Security (RLS) 政策

#### 1. SELECT（查看）
- **政策名稱**: "Anyone can view all todos"
- **權限**: 所有人可以查看所有任務
- **條件**: `USING (true)`

#### 2. INSERT（新增）
- **政策名稱**: "Users can insert own todos"
- **權限**: 用戶只能新增自己的任務
- **條件**: `WITH CHECK (auth.uid() = user_id)`

#### 3. UPDATE（更新）
- **政策名稱**: "Anyone can update todos"
- **權限**: 所有人可以更新（觸發器處理詳細權限）
- **觸發器檢查**:
  - ✅ 所有人可以更新 `sort_order`
  - ❌ 只有任務擁有者可以更新 `completed`
  - ❌ 只有任務擁有者可以更新 `content`、`category`、`user_id`

#### 4. DELETE（刪除）
- **政策名稱**: "Users can delete own todos"
- **權限**: 用戶只能刪除自己的任務
- **條件**: `USING (auth.uid() = user_id)`

### 權限矩陣

| 操作 | 自己的任務 | 他人的任務 |
|------|-----------|-----------|
| 查看 | ✅ | ✅ |
| 新增 | ✅ | ❌ |
| 更新 sort_order | ✅ | ✅ |
| 更新 completed | ✅ | ❌ |
| 刪除 | ✅ | ❌ |

---

## API 與 Hooks

### useTodos Hook

位置：`src/hooks/useTodos.ts`

#### 類型定義

```typescript
export type TodoCategory = '專案A' | '專案B' | '專案C'

export interface Todo {
  id: string
  content: string
  completed: boolean
  created_at: string
  sort_order: number
  category: TodoCategory
  user_id: string
}
```

#### API

```typescript
const {
  todos,        // 任務列表（Todo[]）
  loading,      // 載入狀態（boolean）
  error,        // 錯誤訊息（string | null）
  addTodo,      // 新增任務
  toggleTodo,   // 切換完成狀態
  deleteTodo,   // 刪除任務
  updateSortOrder // 更新排序
} = useTodos()
```

#### 方法說明

##### addTodo(content: string, category: TodoCategory)

新增任務。

**參數**:
- `content`: 任務內容
- `category`: 任務類別

**返回**: `Promise<void>`

**權限**: 僅限已登入用戶，自動關聯到當前用戶

##### toggleTodo(id: string)

切換任務完成狀態。

**參數**:
- `id`: 任務 ID

**返回**: `Promise<void>`

**權限**: 僅限任務擁有者

**錯誤**: 如果不是任務擁有者，會拋出錯誤

##### deleteTodo(id: string)

刪除任務。

**參數**:
- `id`: 任務 ID

**返回**: `Promise<void>`

**權限**: 僅限任務擁有者

##### updateSortOrder(category: TodoCategory, newOrder: Todo[])

更新任務排序。

**參數**:
- `category`: 任務類別
- `newOrder`: 新的排序順序（Todo 陣列）

**返回**: `Promise<void>`

**權限**: 所有人可以更新排序

**說明**: 使用樂觀更新，先更新本地狀態，然後同步到資料庫

---

## 元件說明

### App.tsx

主應用元件，處理身份驗證狀態和路由。

**功能**:
- 檢查登入狀態
- 顯示登入表單（未登入）
- 顯示任務清單（已登入）
- 顯示電子郵件確認通知（未確認）

### TodoList.tsx

任務清單主元件。

**功能**:
- 顯示三欄分類（專案A/B/C）
- 處理拖動排序
- 顯示載入/錯誤狀態
- 整合 AddTodoForm

**使用的 Hooks**:
- `useTodos`: 任務資料管理
- `@dnd-kit`: 拖動排序

### TodoItem.tsx

單一任務項目元件。

**功能**:
- 顯示任務內容
- 顯示完成狀態（checkbox）
- 顯示建立時間（相對時間）
- 顯示任務擁有者標記
- 處理拖動
- 處理刪除（僅限擁有者）

**權限檢查**:
- 非擁有者的 checkbox 會被禁用
- 非擁有者不顯示刪除按鈕，顯示鎖定圖示

### AddTodoForm.tsx

新增任務表單元件。

**功能**:
- 選擇任務類別（專案A/B/C）
- 輸入任務內容
- 提交新增請求
- 顯示載入狀態

### AuthForm.tsx

身份驗證表單元件。

**功能**:
- 登入/註冊切換
- 表單驗證
- 錯誤訊息顯示
- 成功訊息顯示

### EmailConfirmationNotice.tsx

電子郵件確認通知元件。

**功能**:
- 顯示確認提示
- 重新發送確認郵件
- 顯示發送狀態

---

## 樣式系統

### CSS 架構

- **全域樣式**: `src/index.css`
- **應用樣式**: `src/App.css`

### 設計特色

- 漸層背景
- 圓角設計
- 陰影效果
- 過渡動畫
- 響應式布局
- 深色模式支援

### 主要樣式類別

#### 身份驗證相關
- `.auth-container`: 登入容器
- `.auth-card`: 登入卡片
- `.auth-form`: 登入表單
- `.auth-button`: 登入按鈕

#### 任務相關
- `.todo-container`: 任務容器
- `.todo-columns`: 三欄布局
- `.todo-column`: 單一欄位
- `.todo-item`: 任務項目
- `.todo-checkbox`: 完成核取方塊
- `.todo-text`: 任務文字

#### 狀態相關
- `.loading`: 載入狀態
- `.error`: 錯誤狀態
- `.completed`: 完成狀態
- `.dragging`: 拖動狀態

### 響應式斷點

- **桌面**: > 1024px（三欄布局）
- **平板**: 768px - 1024px（單欄布局）
- **手機**: < 768px（單欄布局，調整間距）

### 深色模式

使用 `@media (prefers-color-scheme: dark)` 自動適配系統設定。

---

## 部署說明

### 1. 建置專案

```bash
npm run build
```

建置檔案將輸出到 `dist` 目錄。

### 2. 部署到 GitHub Pages（推薦）

GitHub Pages 提供免費的靜態網站託管服務，適合此專案。

#### 2.1 前置準備

1. 確保專案已推送到 GitHub 倉庫
2. 確認 `vite.config.ts` 中的 `base` 路徑與倉庫名稱一致

#### 2.2 設定 GitHub Secrets

1. 前往倉庫的 **Settings** > **Secrets and variables** > **Actions**
2. 添加以下 Secrets：
   - `VITE_SUPABASE_URL`: Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key

#### 2.3 啟用 GitHub Pages

1. 前往倉庫的 **Settings** > **Pages**
2. 在 **Source** 選擇 **GitHub Actions**

#### 2.4 觸發部署

推送到 `main` 分支會自動觸發部署，或手動在 **Actions** 標籤中觸發。

#### 2.5 訪問網站

部署完成後，網站將可在以下網址訪問：
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

**詳細說明請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)**

### 3. 部署到 Vercel

1. 安裝 Vercel CLI: `npm i -g vercel`
2. 登入: `vercel login`
3. 部署: `vercel`
4. 設定環境變數（在 Vercel Dashboard）：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 4. 部署到 Netlify

1. 安裝 Netlify CLI: `npm i -g netlify-cli`
2. 登入: `netlify login`
3. 部署: `netlify deploy --prod`
4. 設定環境變數（在 Netlify Dashboard）：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 5. 環境變數設定

所有部署平台都需要設定以下環境變數：
- `VITE_SUPABASE_URL`: Supabase 專案 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key

**注意**: 環境變數名稱必須以 `VITE_` 開頭，Vite 才會將其注入到客戶端代碼中。

---

## 開發指南

### 開發流程

1. **建立功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **開發與測試**
   ```bash
   npm run dev
   ```

3. **檢查代碼**
   ```bash
   npm run lint
   ```

4. **提交變更**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

### 代碼規範

- 使用 TypeScript 嚴格模式
- 遵循 ESLint 規則
- 使用函數式元件和 Hooks
- 使用 `useCallback` 和 `useMemo` 優化效能
- 使用樂觀更新提升使用者體驗

### 效能優化

已實作的優化：
- ✅ `useCallback` 包裝函數
- ✅ `useMemo` 快取計算結果
- ✅ 樂觀更新（Optimistic Updates）
- ✅ 減少資料庫查詢
- ✅ 索引優化

### 測試建議

建議測試項目：
- [ ] 身份驗證流程
- [ ] 任務 CRUD 操作
- [ ] 權限檢查（自己的任務 vs 他人的任務）
- [ ] 拖動排序
- [ ] 響應式布局
- [ ] 深色模式

---

## 故障排除

### 常見問題

#### 1. "Email not confirmed" 錯誤

**原因**: Supabase 預設需要電子郵件確認。

**解決方案**:
- 檢查電子郵件收件匣（包含垃圾郵件）
- 或關閉電子郵件確認（開發環境）
- 參考 `supabase-disable-email-confirmation.md`

#### 2. "Failed to run sql query" 錯誤

**原因**: SQL 語法錯誤或權限問題。

**解決方案**:
- 檢查 SQL 腳本語法
- 確保在 Supabase SQL Editor 中執行
- 檢查 RLS 政策是否正確設定

#### 3. 無法看到他人的任務

**原因**: RLS 政策未正確設定。

**解決方案**:
- 執行 `supabase-update-rls-policies.sql`
- 檢查 SELECT 政策是否為 `USING (true)`

#### 4. 無法更新排序

**原因**: UPDATE 政策或觸發器問題。

**解決方案**:
- 檢查觸發器是否正確建立
- 檢查 UPDATE 政策是否允許更新 `sort_order`

#### 5. 無法標記完成他人的任務

**這是預期行為**：只有任務擁有者可以標記完成。

#### 6. 環境變數未載入

**原因**: 環境變數檔案名稱或位置錯誤。

**解決方案**:
- 確保檔案名稱為 `.env.local`
- 確保檔案在專案根目錄
- 重新啟動開發伺服器

### 除錯技巧

1. **檢查瀏覽器控制台**
   - 查看錯誤訊息
   - 檢查網路請求

2. **檢查 Supabase Dashboard**
   - 查看資料庫日誌
   - 檢查 RLS 政策
   - 檢查觸發器狀態

3. **檢查環境變數**
   ```bash
   # 在代碼中檢查
   console.log(import.meta.env.VITE_SUPABASE_URL)
   ```

---

## 版本歷史

### v1.0.0（當前版本）

- ✅ 基礎任務管理功能
- ✅ 身份驗證系統
- ✅ 協作式權限管理
- ✅ 拖動排序
- ✅ 即時同步
- ✅ 響應式設計
- ✅ 深色模式支援

---

## 授權

MIT License

---

## 聯絡資訊

如有問題或建議，請透過以下方式聯絡：
- 建立 Issue
- 提交 Pull Request

---

**最後更新**: 2024年12月

