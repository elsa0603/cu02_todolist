-- 為 todos 資料表添加用戶身份驗證支援
-- 請在 Supabase SQL Editor 中執行此腳本

-- 步驟 1: 添加 user_id 欄位（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'todos' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE todos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 步驟 2: 為現有資料設定預設值（可選，如果沒有現有資料可以跳過）
-- 注意：這會將所有現有資料關聯到第一個用戶，您可能需要手動調整
-- UPDATE todos SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- 步驟 3: 將 user_id 設為必填（在更新現有資料後）
-- ALTER TABLE todos ALTER COLUMN user_id SET NOT NULL;

-- 步驟 4: 建立索引以優化查詢
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_category_sort ON todos(user_id, category, sort_order);

-- 步驟 5: 啟用 Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 步驟 6: 刪除舊的公開政策（如果存在）
DROP POLICY IF EXISTS "Allow public read access" ON todos;
DROP POLICY IF EXISTS "Allow public insert access" ON todos;
DROP POLICY IF EXISTS "Allow public update access" ON todos;
DROP POLICY IF EXISTS "Allow public delete access" ON todos;

-- 步驟 7: 建立新的 RLS 政策
-- 用戶只能查看自己的資料
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

-- 用戶只能新增自己的資料
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用戶只能更新自己的資料
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用戶只能刪除自己的資料
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

-- 完成！現在每個用戶只能看到和操作自己的待辦事項

