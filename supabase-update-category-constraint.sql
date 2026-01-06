-- 更新現有資料庫的 category 欄位約束
-- 將類別從「工作、生活、學習」更新為「專案A、專案B、專案C」
-- 請在 Supabase SQL Editor 中執行此腳本

-- 步驟 1: 先更新現有資料（將舊類別名稱對應到新名稱）
-- 如果您想保留現有資料，請取消註解以下行：
-- UPDATE todos SET category = '專案A' WHERE category = '工作';
-- UPDATE todos SET category = '專案B' WHERE category = '生活';
-- UPDATE todos SET category = '專案C' WHERE category = '學習';

-- 步驟 2: 刪除舊的 CHECK 約束
DO $$ 
DECLARE
  constraint_name TEXT;
BEGIN
  -- 查找現有的 CHECK 約束名稱
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'todos'::regclass
    AND contype = 'c'
    AND conname LIKE '%category%';
  
  -- 如果找到約束，則刪除它
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE todos DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- 步驟 3: 更新預設值
ALTER TABLE todos ALTER COLUMN category SET DEFAULT '專案A';

-- 步驟 4: 添加新的 CHECK 約束
ALTER TABLE todos ADD CONSTRAINT todos_category_check 
  CHECK (category IN ('專案A', '專案B', '專案C'));

-- 步驟 5: 驗證更新（可選）
-- SELECT DISTINCT category FROM todos;

