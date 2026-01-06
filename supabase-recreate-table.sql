-- 刪除並重新建立 todos 資料表
-- 警告：此腳本會刪除所有現有資料！
-- 請在 Supabase SQL Editor 中執行此腳本

-- 步驟 1: 刪除現有的 todos 資料表（如果存在）
DROP TABLE IF EXISTS todos CASCADE;

-- 步驟 2: 重新建立 todos 資料表，使用新的類別名稱
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sort_order INTEGER DEFAULT 0,
  category TEXT NOT NULL DEFAULT '專案A' CHECK (category IN ('專案A', '專案B', '專案C'))
);

-- 步驟 3: 建立索引以優化查詢
CREATE INDEX idx_todos_sort_order ON todos(sort_order);
CREATE INDEX idx_todos_category ON todos(category);
CREATE INDEX idx_todos_category_sort ON todos(category, sort_order);

-- 步驟 4: 關閉 Row Level Security (RLS) 以允許公開讀寫
-- 注意：這僅適用於不需要身份驗證的情況
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;

-- 或者，如果您想啟用 RLS 但允許公開讀寫，可以使用以下政策：
-- ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow public read access" ON todos
--   FOR SELECT USING (true);
-- 
-- CREATE POLICY "Allow public insert access" ON todos
--   FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow public update access" ON todos
--   FOR UPDATE USING (true);
-- 
-- CREATE POLICY "Allow public delete access" ON todos
--   FOR DELETE USING (true);

-- 完成！資料表已重新建立，現在可以使用新的類別名稱（專案A、專案B、專案C）

