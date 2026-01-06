-- 建立 todos 資料表
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sort_order INTEGER DEFAULT 0,
  category TEXT NOT NULL DEFAULT '專案A' CHECK (category IN ('專案A', '專案B', '專案C'))
);

-- 建立索引以優化排序查詢
CREATE INDEX IF NOT EXISTS idx_todos_sort_order ON todos(sort_order);
CREATE INDEX IF NOT EXISTS idx_todos_category ON todos(category);
CREATE INDEX IF NOT EXISTS idx_todos_category_sort ON todos(category, sort_order);

-- 關閉 Row Level Security (RLS) 以允許公開讀寫
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

