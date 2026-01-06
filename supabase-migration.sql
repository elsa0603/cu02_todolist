-- 遷移腳本：為現有的 todos 資料表添加 category 欄位
-- 如果您的資料表已經存在，請執行此腳本來添加分類功能

-- 添加 category 欄位（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'todos' AND column_name = 'category'
  ) THEN
    ALTER TABLE todos ADD COLUMN category TEXT NOT NULL DEFAULT '專案A' CHECK (category IN ('專案A', '專案B', '專案C'));
  END IF;
END $$;

-- 建立索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_todos_category ON todos(category);
CREATE INDEX IF NOT EXISTS idx_todos_category_sort ON todos(category, sort_order);

-- 注意：現有的資料會被設定為預設類別「專案A」
-- 如果需要，您可以手動更新現有資料的類別：
-- UPDATE todos SET category = '專案B' WHERE ...;
-- UPDATE todos SET category = '專案C' WHERE ...;

