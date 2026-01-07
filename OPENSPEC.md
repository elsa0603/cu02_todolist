# OpenSpec 技術規格文件

**專案名稱**: cu02_todolist  
**版本**: 1.0.0  
**最後更新**: 2024年12月  
**文件類型**: Open Specification  

---

## 目錄

1. [專案概述](#專案概述)
2. [系統架構](#系統架構)
3. [API 規格](#api-規格)
4. [資料模型](#資料模型)
5. [身份驗證規格](#身份驗證規格)
6. [權限控制規格](#權限控制規格)
7. [前端介面規格](#前端介面規格)
8. [資料庫規格](#資料庫規格)
9. [部署規格](#部署規格)
10. [安全規範](#安全規範)
11. [錯誤處理規格](#錯誤處理規格)
12. [效能規格](#效能規格)

---

## 專案概述

### 1.1 專案簡介

**cu02_todolist** 是一個基於 React + TypeScript + Vite 和 Supabase 的現代化協作式工作清單應用程式。

### 1.2 核心功能

- 用戶身份驗證與授權
- 任務的 CRUD 操作
- 多人協作（查看所有任務，管理自己的任務）
- 拖動排序功能
- 即時資料同步
- 響應式網頁設計

### 1.3 技術棧

| 層級 | 技術 | 版本 |
|------|------|------|
| 前端框架 | React | 19.2.0 |
| 語言 | TypeScript | 5.9.3 |
| 建置工具 | Vite | 7.2.4 |
| 後端平台 | Supabase | Latest |
| 資料庫 | PostgreSQL | (via Supabase) |
| 拖動排序 | @dnd-kit | 6.3.1, 10.0.0 |
| 身份驗證 | Supabase Auth | Latest |

---

## 系統架構

### 2.1 架構圖

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React UI   │  │   Hooks      │  │   Components │  │
│  │   Components │  │   (useAuth,  │  │   (Forms,    │  │
│  │              │  │    useTodos) │  │    Lists)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS/REST
                          │ WebSocket (Realtime)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Platform                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Auth API   │  │  Database    │  │   Realtime   │  │
│  │   (JWT)      │  │  (PostgreSQL)│  │   (WebSocket)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                          │                               │
│                          ▼                               │
│                  ┌──────────────┐                        │
│                  │  RLS Policies│                        │
│                  │  & Triggers  │                        │
│                  └──────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

### 2.2 資料流程

1. **用戶操作** → React Components
2. **狀態管理** → Custom Hooks (useAuth, useTodos)
3. **API 呼叫** → Supabase Client
4. **身份驗證** → Supabase Auth (JWT)
5. **資料操作** → PostgreSQL (with RLS)
6. **即時更新** → Supabase Realtime (WebSocket)
7. **狀態同步** → React State Update

---

## API 規格

### 3.1 Supabase Client 設定

**端點**: 由環境變數設定  
**認證方式**: JWT Token (透過 Supabase Auth)

```typescript
// 設定檔: src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### 3.2 身份驗證 API

#### 3.2.1 註冊

**端點**: `supabase.auth.signUp()`

**請求格式**:
```typescript
{
  email: string
  password: string
}
```

**回應格式**:
```typescript
{
  data: {
    user: User | null
    session: Session | null
  }
  error: AuthError | null
}
```

**錯誤碼**:
- `signup_disabled`: 註冊功能已停用
- `email_rate_limit_exceeded`: 電子郵件發送頻率過高
- `weak_password`: 密碼強度不足

#### 3.2.2 登入

**端點**: `supabase.auth.signInWithPassword()`

**請求格式**:
```typescript
{
  email: string
  password: string
}
```

**回應格式**:
```typescript
{
  data: {
    user: User
    session: Session
  }
  error: AuthError | null
}
```

**錯誤碼**:
- `invalid_credentials`: 帳號或密碼錯誤
- `email_not_confirmed`: 電子郵件未確認

#### 3.2.3 登出

**端點**: `supabase.auth.signOut()`

**請求格式**: 無參數

**回應格式**:
```typescript
{
  error: AuthError | null
}
```

#### 3.2.4 重新發送確認郵件

**端點**: `supabase.auth.resend()`

**請求格式**:
```typescript
{
  type: 'signup'
  email: string
}
```

**回應格式**:
```typescript
{
  data: {}
  error: AuthError | null
}
```

### 3.3 任務管理 API

#### 3.3.1 查詢所有任務

**端點**: `supabase.from('todos').select('*')`

**請求格式**:
```typescript
// 查詢參數
{
  order: [
    { column: 'category', ascending: true },
    { column: 'sort_order', ascending: true }
  ]
}
```

**回應格式**:
```typescript
{
  data: Todo[] | null
  error: PostgrestError | null
}
```

**權限**: 所有人可查看（RLS Policy: "Anyone can view all todos"）

#### 3.3.2 新增任務

**端點**: `supabase.from('todos').insert()`

**請求格式**:
```typescript
{
  content: string
  category: TodoCategory
  completed: boolean (default: false)
  sort_order: number (自動計算)
  user_id: string (自動從 auth.uid() 取得)
}
```

**回應格式**:
```typescript
{
  data: Todo[] | null
  error: PostgrestError | null
}
```

**權限**: 僅限已登入用戶，且 `user_id` 必須等於當前用戶 ID

**驗證規則**:
- `content`: 必填，非空字串
- `category`: 必須為 '專案A' | '專案B' | '專案C'
- `user_id`: 必須等於 `auth.uid()`

#### 3.3.3 更新任務

**端點**: `supabase.from('todos').update()`

**請求格式**:
```typescript
// 更新排序
{
  sort_order: number
}

// 更新完成狀態（僅限任務擁有者）
{
  completed: boolean
}
```

**回應格式**:
```typescript
{
  data: Todo[] | null
  error: PostgrestError | null
}
```

**權限規則**:
- **更新 `sort_order`**: 所有人可更新
- **更新 `completed`**: 僅限任務擁有者
- **更新其他欄位**: 僅限任務擁有者（由觸發器檢查）

**觸發器檢查**:
- `check_todo_update()` 函數會驗證更新權限
- 非擁有者嘗試更新 `completed` 會拋出錯誤

#### 3.3.4 刪除任務

**端點**: `supabase.from('todos').delete()`

**請求格式**:
```typescript
{
  id: string
}
```

**回應格式**:
```typescript
{
  data: {} | null
  error: PostgrestError | null
}
```

**權限**: 僅限任務擁有者（RLS Policy: "Users can delete own todos"）

### 3.4 即時訂閱 API

**端點**: `supabase.channel('todos-changes').on('postgres_changes')`

**訂閱設定**:
```typescript
{
  event: '*' // INSERT, UPDATE, DELETE
  schema: 'public'
  table: 'todos'
}
```

**回調函數**:
```typescript
() => {
  // 重新載入所有任務
  fetchTodos()
}
```

---

## 資料模型

### 4.1 Todo 介面

```typescript
interface Todo {
  id: string                    // UUID, PRIMARY KEY
  content: string              // TEXT, NOT NULL
  completed: boolean           // BOOLEAN, DEFAULT false
  created_at: string           // TIMESTAMP WITH TIME ZONE, DEFAULT now()
  sort_order: number           // INTEGER, DEFAULT 0
  category: TodoCategory       // TEXT, NOT NULL, CHECK IN ('專案A', '專案B', '專案C')
  user_id: string              // UUID, REFERENCES auth.users(id)
}
```

### 4.2 TodoCategory 類型

```typescript
type TodoCategory = '專案A' | '專案B' | '專案C'
```

### 4.3 User 介面（Supabase Auth）

```typescript
interface User {
  id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
  // ... 其他 Supabase Auth 欄位
}
```

### 4.4 Session 介面（Supabase Auth）

```typescript
interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
  token_type: string
  user: User
}
```

---

## 身份驗證規格

### 5.1 認證流程

1. **註冊流程**:
   ```
   用戶輸入 email/password
   → supabase.auth.signUp()
   → 發送確認郵件（如啟用）
   → 返回 user 和 session
   ```

2. **登入流程**:
   ```
   用戶輸入 email/password
   → supabase.auth.signInWithPassword()
   → 驗證憑證
   → 返回 user 和 session
   → 儲存 session 到 localStorage
   ```

3. **會話管理**:
   ```
   應用啟動
   → supabase.auth.getSession()
   → 檢查 session 有效性
   → 自動刷新過期 token
   ```

### 5.2 JWT Token 結構

Supabase 使用 JWT (JSON Web Token) 進行身份驗證：

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### 5.3 會話持久化

- **儲存位置**: Browser localStorage
- **鍵名**: `sb-{project-ref}-auth-token`
- **自動刷新**: Supabase Client 自動處理 token 刷新

---

## 權限控制規格

### 6.1 Row Level Security (RLS) 政策

#### 6.1.1 SELECT 政策

**政策名稱**: "Anyone can view all todos"

```sql
CREATE POLICY "Anyone can view all todos"
  ON todos FOR SELECT
  USING (true);
```

**權限**: 所有人可以查看所有任務

#### 6.1.2 INSERT 政策

**政策名稱**: "Users can insert own todos"

```sql
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**權限**: 用戶只能新增自己的任務

#### 6.1.3 UPDATE 政策

**政策名稱**: "Anyone can update todos"

```sql
CREATE POLICY "Anyone can update todos"
  ON todos FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

**詳細權限檢查**（由觸發器處理）:
- 所有人可以更新 `sort_order`
- 只有任務擁有者可以更新 `completed`
- 只有任務擁有者可以更新 `content`、`category`、`user_id`

#### 6.1.4 DELETE 政策

**政策名稱**: "Users can delete own todos"

```sql
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);
```

**權限**: 用戶只能刪除自己的任務

### 6.2 觸發器規格

**觸發器名稱**: `check_todo_update`

**觸發時機**: `BEFORE UPDATE ON todos`

**功能**:
```sql
CREATE OR REPLACE FUNCTION check_sort_order_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 檢查 completed 欄位更新權限
  IF OLD.completed IS DISTINCT FROM NEW.completed THEN
    IF auth.uid() != OLD.user_id THEN
      RAISE EXCEPTION '只能更新自己的任務的完成狀態';
    END IF;
  END IF;
  
  -- 檢查其他欄位更新權限
  IF OLD.content IS DISTINCT FROM NEW.content OR 
     OLD.category IS DISTINCT FROM NEW.category OR
     OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    IF auth.uid() != OLD.user_id THEN
      RAISE EXCEPTION '只能更新自己的任務';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6.3 權限矩陣

| 操作 | 自己的任務 | 他人的任務 |
|------|-----------|-----------|
| 查看 (SELECT) | ✅ | ✅ |
| 新增 (INSERT) | ✅ | ❌ |
| 更新 sort_order | ✅ | ✅ |
| 更新 completed | ✅ | ❌ |
| 更新 content/category | ✅ | ❌ |
| 刪除 (DELETE) | ✅ | ❌ |

---

## 前端介面規格

### 7.1 元件架構

```
App
├── AuthForm (未登入時)
│   ├── 登入/註冊切換
│   ├── 表單驗證
│   └── 錯誤處理
├── EmailConfirmationNotice (未確認時)
│   ├── 確認提示
│   └── 重新發送按鈕
└── TodoList (已登入時)
    ├── UserHeader
    │   ├── 用戶資訊
    │   └── 登出按鈕
    └── AddTodoForm
        ├── 類別選擇
        ├── 內容輸入
        └── 新增按鈕
    └── DndContext
        └── TodoColumns (3欄)
            └── SortableContext
                └── TodoItem[]
                    ├── DragHandle
                    ├── Checkbox
                    ├── Content
                    └── DeleteButton
```

### 7.2 Hooks 規格

#### 7.2.1 useAuth Hook

**位置**: `src/hooks/useAuth.ts`

**API**:
```typescript
const {
  user: User | null              // 當前用戶
  session: Session | null         // 當前會話
  loading: boolean               // 載入狀態
  signUp: (email, password) => Promise<{data, error}>
  signIn: (email, password) => Promise<{data, error}>
  signOut: () => Promise<{error}>
  resendConfirmationEmail: (email) => Promise<{data, error}>
  isEmailConfirmed: boolean      // 電子郵件確認狀態
} = useAuth()
```

**生命週期**:
1. 初始化時獲取當前會話
2. 監聽身份驗證狀態變化
3. 自動更新 user 和 session 狀態

#### 7.2.2 useTodos Hook

**位置**: `src/hooks/useTodos.ts`

**API**:
```typescript
const {
  todos: Todo[]                  // 任務列表
  loading: boolean               // 載入狀態
  error: string | null           // 錯誤訊息
  addTodo: (content, category) => Promise<void>
  toggleTodo: (id) => Promise<void>
  deleteTodo: (id) => Promise<void>
  updateSortOrder: (category, newOrder) => Promise<void>
} = useTodos()
```

**功能**:
- 自動載入所有任務
- 即時訂閱資料庫變化
- 樂觀更新（Optimistic Updates）
- 錯誤處理與恢復

### 7.3 響應式設計規格

#### 7.3.1 斷點定義

| 裝置類型 | 寬度範圍 | 布局 |
|---------|---------|------|
| 小手機 | < 480px | 單欄，緊湊間距 |
| 手機 | 480px - 768px | 單欄，標準間距 |
| 平板 | 768px - 1024px | 單欄，寬鬆間距 |
| 桌面 | > 1024px | 三欄布局 |

#### 7.3.2 關鍵樣式規則

```css
/* 基礎響應式 */
box-sizing: border-box;
width: 100%;
max-width: 1400px;

/* 手機優化 */
@media (max-width: 768px) {
  padding: 0.5rem;
  font-size: 0.9375rem;
}

/* 小手機優化 */
@media (max-width: 480px) {
  padding: 0.25rem;
  font-size: 0.875rem;
}
```

---

## 資料庫規格

### 8.1 資料表結構

#### 8.1.1 todos 資料表

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sort_order INTEGER DEFAULT 0,
  category TEXT NOT NULL DEFAULT '專案A' 
    CHECK (category IN ('專案A', '專案B', '專案C')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

#### 8.1.2 索引

```sql
-- 排序優化
CREATE INDEX idx_todos_sort_order ON todos(sort_order);

-- 分類查詢優化
CREATE INDEX idx_todos_category ON todos(category);

-- 分類+排序複合索引
CREATE INDEX idx_todos_category_sort ON todos(category, sort_order);

-- 用戶查詢優化
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- 用戶+分類+排序複合索引
CREATE INDEX idx_todos_user_category_sort ON todos(user_id, category, sort_order);
```

### 8.2 約束條件

- **主鍵**: `id` (UUID)
- **外鍵**: `user_id` → `auth.users(id)` (CASCADE DELETE)
- **檢查約束**: `category` 必須為 '專案A', '專案B', 或 '專案C'
- **非空約束**: `content`, `category`, `user_id`

### 8.3 觸發器

**名稱**: `check_todo_update`  
**類型**: `BEFORE UPDATE`  
**功能**: 檢查更新權限（見 6.2 節）

---

## 部署規格

### 9.1 環境變數

**必需變數**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**建置時變數**:
```env
NODE_ENV=production
```

### 9.2 建置規格

**建置命令**:
```bash
npm run build
```

**輸出目錄**: `dist/`

**建置產物**:
- `index.html`
- `assets/index-{hash}.js`
- `assets/index-{hash}.css`

### 9.3 GitHub Pages 部署

**工作流程**: `.github/workflows/deploy.yml`

**部署流程**:
1. 觸發條件: 推送到 `main` 分支
2. 建置步驟: 安裝依賴 → 建置專案
3. 部署步驟: 上傳 artifact → 部署到 GitHub Pages

**Base 路徑**: `/cu02_todolist/` (可在 `vite.config.ts` 調整)

### 9.4 部署後 URL

```
https://elsa0603.github.io/cu02_todolist/
```

---

## 安全規範

### 10.1 身份驗證安全

- **密碼要求**: 最少 6 個字元
- **Token 儲存**: Browser localStorage（由 Supabase 管理）
- **Token 過期**: 自動刷新機制
- **HTTPS**: 所有通訊使用 HTTPS

### 10.2 資料安全

- **Row Level Security**: 啟用 RLS 保護資料
- **輸入驗證**: 前端和後端雙重驗證
- **SQL 注入防護**: 使用 Supabase 參數化查詢
- **XSS 防護**: React 自動轉義

### 10.3 環境變數安全

- **敏感資訊**: 不提交到 Git
- **Secrets 管理**: 使用 GitHub Secrets
- **公開金鑰**: Anon Key 可公開（有 RLS 保護）

---

## 錯誤處理規格

### 11.1 錯誤類型

#### 11.1.1 身份驗證錯誤

```typescript
interface AuthError {
  message: string
  status: number
  name: string
}
```

**常見錯誤**:
- `invalid_credentials`: 帳號或密碼錯誤
- `email_not_confirmed`: 電子郵件未確認
- `signup_disabled`: 註冊功能已停用

#### 11.1.2 資料庫錯誤

```typescript
interface PostgrestError {
  message: string
  details: string
  hint: string
  code: string
}
```

**常見錯誤碼**:
- `23505`: 唯一約束違反
- `23503`: 外鍵約束違反
- `42501`: 權限不足

### 11.2 錯誤處理策略

1. **樂觀更新**: 先更新 UI，失敗時恢復
2. **錯誤顯示**: 在 UI 顯示錯誤訊息
3. **自動重試**: 網路錯誤時自動重試
4. **錯誤日誌**: 記錄到 console.error

### 11.3 錯誤訊息格式

**用戶友好訊息**:
```typescript
const errorMessages = {
  'invalid_credentials': '帳號或密碼錯誤',
  'email_not_confirmed': '請確認您的電子郵件',
  '只能更新自己的任務的完成狀態': '您只能關閉自己的任務',
  // ...
}
```

---

## 效能規格

### 12.1 前端優化

- **Code Splitting**: Vite 自動處理
- **Tree Shaking**: 自動移除未使用代碼
- **Memoization**: 使用 `useMemo` 和 `useCallback`
- **樂觀更新**: 減少等待時間

### 12.2 資料庫優化

- **索引**: 所有查詢欄位都有索引
- **複合索引**: 優化多欄位查詢
- **查詢優化**: 使用 `select()` 只查詢需要的欄位

### 12.3 網路優化

- **Gzip 壓縮**: 自動啟用
- **快取策略**: 瀏覽器自動快取靜態資源
- **即時更新**: 使用 WebSocket 減少輪詢

### 12.4 效能指標

**目標指標**:
- 首次內容繪製 (FCP): < 1.5s
- 最大內容繪製 (LCP): < 2.5s
- 互動延遲 (TTI): < 3.5s
- 累積布局偏移 (CLS): < 0.1

---

## 附錄

### A. 檔案結構

```
cu02_todolist/
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions 工作流程
├── public/
│   └── vite.svg
├── src/
│   ├── components/             # React 元件
│   │   ├── AddTodoForm.tsx
│   │   ├── AuthForm.tsx
│   │   ├── EmailConfirmationNotice.tsx
│   │   ├── TodoItem.tsx
│   │   └── TodoList.tsx
│   ├── hooks/                  # Custom Hooks
│   │   ├── useAuth.ts
│   │   └── useTodos.ts
│   ├── lib/
│   │   └── supabase.ts         # Supabase 客戶端
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── supabase-*.sql              # 資料庫腳本
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### B. 依賴清單

**生產依賴**:
```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "@supabase/supabase-js": "^2.89.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0"
}
```

**開發依賴**:
```json
{
  "@types/node": "^24.10.1",
  "@types/react": "^19.2.5",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^5.1.1",
  "typescript": "~5.9.3",
  "vite": "^7.2.4"
}
```

### C. 資料庫遷移腳本

1. `supabase-setup.sql` - 初始資料表建立
2. `supabase-add-user-auth.sql` - 添加身份驗證支援
3. `supabase-update-rls-policies.sql` - 更新權限政策
4. `supabase-recreate-table.sql` - 重建資料表（清理用）

### D. 參考文件

- [Supabase 官方文檔](https://supabase.com/docs)
- [React 官方文檔](https://react.dev)
- [Vite 官方文檔](https://vitejs.dev)
- [@dnd-kit 文檔](https://docs.dndkit.com)

---

**文件版本**: 1.0.0  
**最後更新**: 2024年12月  
**維護者**: 專案開發團隊

